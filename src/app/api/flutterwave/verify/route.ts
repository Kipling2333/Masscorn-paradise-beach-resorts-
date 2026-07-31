import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, payments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, loyaltyDiscount, notify } from "@/lib/auth";
import { tierForPoints } from "@/lib/pricing";

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY ?? "";

/**
 * Server-side Flutterwave transaction verification.
 * Called by the /payment/verify page after Flutterwave redirects the user back.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!FLW_SECRET) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const transactionId = String(body.transaction_id ?? "");
  const bookingId = Number(body.booking_id ?? 0);
  const txRef = String(body.tx_ref ?? "");

  if (!transactionId || !bookingId) {
    return NextResponse.json({ error: "Missing transaction data" }, { status: 400 });
  }

  // Fetch the booking
  const bookingRows = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  const booking = bookingRows[0];
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  // Ensure the booking belongs to this user
  if (booking.userId !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Already verified?
  if (booking.paymentStatus === "paid" && booking.status === "confirmed") {
    return NextResponse.json({
      status: "already_verified",
      booking: { id: booking.id, reference: booking.reference, totalAmount: booking.totalAmount },
    });
  }

  // Verify with Flutterwave
  try {
    const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: {
        "Authorization": `Bearer ${FLW_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const flwData = await flwRes.json();

    if (
      flwData.status === "success" &&
      flwData.data?.status === "successful" &&
      Number(flwData.data.amount) >= Number(booking.totalAmount) &&
      flwData.data.tx_ref === txRef
    ) {
      // Payment verified — confirm the booking
      await db.update(bookings).set({ status: "confirmed", paymentStatus: "paid" }).where(eq(bookings.id, bookingId));

      // Record payment
      await db.insert(payments).values({
        bookingId: booking.id,
        amount: String(flwData.data.amount),
        method: flwData.data.payment_type ?? "flutterwave",
        transactionId: String(flwData.data.id),
        status: "completed",
      });

      // Loyalty accrual
      const total = Number(booking.totalAmount);
      const earned = Math.floor(total / 10);
      const newPoints = (user.loyaltyPoints ?? 0) + earned;
      const newTier = tierForPoints(newPoints);
      await db.update(users).set({ loyaltyPoints: newPoints, loyaltyTier: newTier }).where(eq(users.id, user.id));

      // Send notifications
      const { roomTypes } = await import("@/db/schema");
      const roomRows = await db.select().from(roomTypes).where(eq(roomTypes.id, booking.roomTypeId)).limit(1);
      const roomName = roomRows[0]?.name ?? "your residence";

      await notify(
        user.id,
        `Reservation confirmed — ${booking.reference}`,
        `Dear ${user.name}, your stay in ${roomName} is confirmed (${booking.checkIn} → ${booking.checkOut}, $${total.toLocaleString()}). Payment via Flutterwave (${flwData.data.payment_type}). ${booking.airportPickup ? "Your airport pickup is arranged. " : ""}We look forward to welcoming you to the bay.`,
        ["email", "sms"]
      );

      return NextResponse.json({
        status: "verified",
        booking: {
          id: booking.id,
          reference: booking.reference,
          totalAmount: booking.totalAmount,
        },
        loyaltyEarned: earned,
        tier: newTier,
        paymentType: flwData.data.payment_type,
      });
    } else {
      // Payment not successful — mark booking as cancelled
      await db.update(bookings).set({ status: "cancelled", paymentStatus: "unpaid" }).where(eq(bookings.id, bookingId));
      return NextResponse.json({
        status: "failed",
        error: "Payment was not successful. Your booking has been released.",
        flw_status: flwData.data?.status ?? "unknown",
      }, { status: 400 });
    }
  } catch (err) {
    console.error("Flutterwave verify error:", err);
    return NextResponse.json({ error: "Unable to verify payment. Please contact the resort." }, { status: 502 });
  }
}
