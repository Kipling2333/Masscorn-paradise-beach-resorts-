import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, payments, roomTypes, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  bookingReference, getSessionUser, isAdmin, loyaltyDiscount, notify, transactionId,
} from "@/lib/auth";
import { availableRooms, priceStay, tierForPoints, validateCoupon } from "@/lib/pricing";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const base = db
    .select({
      booking: bookings,
      roomName: roomTypes.name,
      roomImage: roomTypes.image,
      guestName: users.name,
      guestEmail: users.email,
    })
    .from(bookings)
    .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt));

  const rows = isAdmin(user) ? await base : await base.where(eq(bookings.userId, user.id)).limit(50);
  return NextResponse.json({ bookings: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to reserve" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const guests = Math.max(1, Number(body.guests ?? 1));
  const couponCode = String(body.couponCode ?? "").trim().toUpperCase();
  const method = ["card", "paypal", "mobile_money", "mobilemoney", "banktransfer", "ussd", "flutterwave"].includes(String(body.method)) ? String(body.method) : "flutterwave";
  const specialRequests = String(body.specialRequests ?? "").slice(0, 800);
  const airportPickup = Boolean(body.airportPickup);
  const bookingType = ["standard", "group", "package", "corporate"].includes(String(body.bookingType))
    ? String(body.bookingType) : "standard";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return NextResponse.json({ error: "Please choose valid dates" }, { status: 400 });
  }
  if (new Date(checkIn) >= new Date(checkOut)) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  const roomRows = await db.select().from(roomTypes).where(eq(roomTypes.slug, slug)).limit(1);
  const room = roomRows[0];
  if (!room) return NextResponse.json({ error: "Residence not found" }, { status: 404 });
  if (guests > room.capacity) {
    return NextResponse.json({ error: `${room.name} welcomes up to ${room.capacity} guests` }, { status: 400 });
  }

  const available = await availableRooms(room.id, checkIn, checkOut);
  if (available < 1) {
    return NextResponse.json({ error: "This residence is fully committed for those dates" }, { status: 409 });
  }

  const loyaltyPct = loyaltyDiscount(user.loyaltyTier);
  const couponPct = couponCode ? await validateCoupon(couponCode) : 0;
  if (couponCode && couponPct === 0) {
    return NextResponse.json({ error: "This coupon code is not valid" }, { status: 400 });
  }
  const pricing = priceStay(Number(room.basePrice), checkIn, checkOut, { loyaltyPct, couponPct });
  if (pricing.nights < 1) return NextResponse.json({ error: "Minimum stay is one night" }, { status: 400 });

  const reference = bookingReference();
  const [booking] = await db
    .insert(bookings)
    .values({
      reference, userId: user.id, roomTypeId: room.id, checkIn, checkOut, guests,
      roomsCount: 1, totalAmount: String(pricing.total), couponCode: couponCode || null,
      bookingType, status: "confirmed", paymentStatus: "paid",
      specialRequests: specialRequests || null, airportPickup,
    })
    .returning();

  const [payment] = await db
    .insert(payments)
    .values({ bookingId: booking.id, amount: String(pricing.total), method, transactionId: transactionId(), status: "completed" })
    .returning();

  // loyalty accrual — 1 point per $10
  const earned = Math.floor(pricing.total / 10);
  const newPoints = (user.loyaltyPoints ?? 0) + earned;
  const newTier = tierForPoints(newPoints);
  await db.update(users).set({ loyaltyPoints: newPoints, loyaltyTier: newTier }).where(eq(users.id, user.id));

  await notify(
    user.id,
    `Reservation confirmed — ${reference}`,
    `Dear ${user.name}, your stay in ${room.name} is confirmed (${checkIn} → ${checkOut}, ${pricing.nights} nights, $${pricing.total.toLocaleString()}). ${airportPickup ? "Your airport pickup is arranged. " : ""}We look forward to welcoming you to the bay.`,
    ["email", "sms"]
  );

  return NextResponse.json({ booking, payment, loyaltyEarned: earned, tier: newTier });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const id = Number(body.id ?? 0);
  const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  const booking = rows[0];
  if (!booking || (booking.userId !== user.id && !isAdmin(user))) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
  }

  await db.update(bookings).set({ status: "cancelled", paymentStatus: booking.paymentStatus === "paid" ? "refunded" : booking.paymentStatus }).where(eq(bookings.id, id));
  if (booking.paymentStatus === "paid") {
    await db.update(payments).set({ status: "refunded" }).where(eq(payments.bookingId, id));
  }
  await notify(
    booking.userId,
    `Reservation ${booking.reference} cancelled`,
    `Your reservation ${booking.reference} has been cancelled and any payment refunded to the original method. We hope to welcome you another season.`,
    ["email", "sms"]
  );
  return NextResponse.json({ ok: true, status: "cancelled" });
}
