import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, roomTypes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { bookingReference, getSessionUser, loyaltyDiscount } from "@/lib/auth";
import { availableRooms, priceStay, validateCoupon } from "@/lib/pricing";

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to reserve" }, { status: 401 });

  if (!FLW_SECRET) {
    return NextResponse.json({ error: "Payment gateway not configured. Please contact the resort." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const guests = Math.max(1, Number(body.guests ?? 1));
  const couponCode = String(body.couponCode ?? "").trim().toUpperCase();
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

  // Create booking in PENDING status
  const reference = bookingReference();
  const [booking] = await db
    .insert(bookings)
    .values({
      reference, userId: user.id, roomTypeId: room.id, checkIn, checkOut, guests,
      roomsCount: 1, totalAmount: String(pricing.total), couponCode: couponCode || null,
      bookingType, status: "pending", paymentStatus: "unpaid",
      specialRequests: specialRequests || null, airportPickup,
    })
    .returning();

  // Call Flutterwave Standard API to create a hosted payment link
  const tx_ref = `MSCR-${booking.id}-${reference}`;
  const redirectUrl = `${SITE_URL}/payment/verify?tx_ref=${tx_ref}&booking_id=${booking.id}`;

  try {
    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FLW_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref,
        amount: pricing.total,
        currency: "USD",
        redirect_url: redirectUrl,
        payment_options: "card,mobilemoney,ussd,banktransfer",
        customer: {
          email: user.email,
          name: user.name,
          phonenumber: user.phone ?? "",
        },
        customizations: {
          title: "Masscorn Paradise Beach Resort",
          description: `${room.name} · ${pricing.nights} nights · ${checkIn} → ${checkOut}`,
          logo: `${SITE_URL}/icon.svg`,
        },
        meta: {
          booking_id: booking.id,
          booking_ref: reference,
          room_name: room.name,
          check_in: checkIn,
          check_out: checkOut,
          guests,
        },
      }),
    });

    const flwData = await flwRes.json();

    if (flwData.status !== "success" || !flwData.data?.link) {
      // Flutterwave didn't return a payment link — cancel the pending booking
      await db.update(bookings).set({ status: "cancelled", paymentStatus: "unpaid" }).where(eq(bookings.id, booking.id));
      console.error("Flutterwave initiate error:", flwData);
      return NextResponse.json({
        error: "Payment gateway temporarily unavailable. Please try again or contact the resort.",
        detail: flwData.message ?? "Unknown gateway error",
      }, { status: 502 });
    }

    return NextResponse.json({
      paymentLink: flwData.data.link,
      booking: {
        id: booking.id,
        reference: booking.reference,
        totalAmount: pricing.total,
        nights: pricing.nights,
      },
      tx_ref,
    });
  } catch (err) {
    // Network error reaching Flutterwave — cancel pending booking
    await db.update(bookings).set({ status: "cancelled", paymentStatus: "unpaid" }).where(eq(bookings.id, booking.id));
    console.error("Flutterwave network error:", err);
    return NextResponse.json({ error: "Unable to reach payment gateway. Please try again." }, { status: 502 });
  }
}
