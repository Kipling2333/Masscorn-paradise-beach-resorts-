import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, roomTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { bookingReference, getSessionUser, loyaltyDiscount } from "@/lib/auth";
import { availableRooms, priceStay, validateCoupon } from "@/lib/pricing";
import crypto from "node:crypto";

/**
 * Checkout Initialization API
 * 
 * Accepts reservation details, generates a unique transaction reference,
 * creates a pending booking, and prepares the Flutterwave payload structure.
 * 
 * POST /api/checkout/initialize
 * Payload: { slug, checkIn, checkOut, guests, couponCode?, specialRequests?, airportPickup?, bookingType? }
 * Response: { txRef, bookingId, reference, amount, currency, paymentLink?, flutterwavePayload }
 */

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY ?? "";
const FLW_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  // Authenticate user
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to complete your reservation" }, { status: 401 });
  }

  // Validate environment
  if (!FLW_SECRET || !FLW_PUBLIC_KEY) {
    return NextResponse.json({ 
      error: "Payment gateway not configured", 
      code: "GATEWAY_CONFIG_MISSING" 
    }, { status: 503 });
  }

  // Parse and validate payload
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const slug = String(payload.slug ?? "").trim();
  const checkIn = String(payload.checkIn ?? "").trim();
  const checkOut = String(payload.checkOut ?? "").trim();
  const guests = Math.max(1, Math.min(20, Number(payload.guests ?? 1)));
  const couponCode = String(payload.couponCode ?? "").trim().toUpperCase();
  const specialRequests = String(payload.specialRequests ?? "").slice(0, 800).trim();
  const airportPickup = Boolean(payload.airportPickup);
  const bookingType = ["standard", "group", "package", "corporate"].includes(String(payload.bookingType))
    ? String(payload.bookingType) 
    : "standard";

  // Validate dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
  }

  const checkInDate = new Date(checkIn + "T00:00:00Z");
  const checkOutDate = new Date(checkOut + "T00:00:00Z");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return NextResponse.json({ error: "Check-in date cannot be in the past" }, { status: 400 });
  }

  if (checkInDate >= checkOutDate) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  // Fetch room details
  const roomRows = await db.select().from(roomTypes).where(eq(roomTypes.slug, slug)).limit(1);
  const room = roomRows[0];
  
  if (!room) {
    return NextResponse.json({ error: "Residence not found" }, { status: 404 });
  }

  if (guests > room.capacity) {
    return NextResponse.json({ 
      error: `${room.name} accommodates up to ${room.capacity} guests` 
    }, { status: 400 });
  }

  // Check availability
  const available = await availableRooms(room.id, checkIn, checkOut);
  if (available < 1) {
    return NextResponse.json({ 
      error: "This residence is fully committed for those dates",
      code: "NO_AVAILABILITY"
    }, { status: 409 });
  }

  // Calculate pricing
  const loyaltyPct = loyaltyDiscount(user.loyaltyTier);
  const couponPct = couponCode ? await validateCoupon(couponCode) : 0;
  
  if (couponCode && couponPct === 0) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
  }

  const pricing = priceStay(Number(room.basePrice), checkIn, checkOut, { loyaltyPct, couponPct });
  
  if (pricing.nights < 1) {
    return NextResponse.json({ error: "Minimum stay is one night" }, { status: 400 });
  }

  // Generate unique transaction reference
  const reference = bookingReference();
  const txRef = `MSCR-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${Date.now()}`;

  // Create pending booking
  const [booking] = await db
    .insert(bookings)
    .values({
      reference,
      userId: user.id,
      roomTypeId: room.id,
      checkIn,
      checkOut,
      guests,
      roomsCount: 1,
      totalAmount: String(pricing.total),
      couponCode: couponCode || null,
      bookingType,
      status: "pending",
      paymentStatus: "unpaid",
      specialRequests: specialRequests || null,
      airportPickup,
    })
    .returning();

  // Build Flutterwave payload structure
  const flutterwavePayload = {
    tx_ref: txRef,
    amount: pricing.total,
    currency: "USD",
    redirect_url: `${SITE_URL}/api/webhooks/flutterwave/redirect?tx_ref=${txRef}&booking_id=${booking.id}`,
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
      user_id: user.id,
    },
  };

  // Initiate Flutterwave payment session
  let paymentLink: string | null = null;
  try {
    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FLW_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flutterwavePayload),
    });

    const flwData = await flwRes.json();

    if (flwData.status === "success" && flwData.data?.link) {
      paymentLink = flwData.data.link;
    } else {
      // Log error but don't fail - client can retry
      console.error("Flutterwave initiate warning:", flwData);
    }
  } catch (err) {
    console.error("Flutterwave network error:", err);
    // Continue without payment link - client can retry
  }

  // Return standardized response
  return NextResponse.json({
    success: true,
    data: {
      txRef,
      bookingId: booking.id,
      reference: booking.reference,
      amount: pricing.total,
      currency: "USD",
      nights: pricing.nights,
      paymentLink,
      flutterwavePayload: {
        ...flutterwavePayload,
        // Exclude sensitive meta from client
        meta: {
          booking_id: booking.id,
          booking_ref: reference,
        },
      },
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    },
  });
}

/**
 * GET handler for retrieving checkout session status
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get("tx_ref");
  
  if (!txRef) {
    return NextResponse.json({ error: "Transaction reference required" }, { status: 400 });
  }

  // Extract booking ID from txRef
  const bookingId = txRef.split("-")[1];
  if (!bookingId) {
    return NextResponse.json({ error: "Invalid transaction reference" }, { status: 400 });
  }

  // Return current status
  const bookingRows = await db.select().from(bookings).where(eq(bookings.id, parseInt(bookingId))).limit(1);
  const booking = bookingRows[0];

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    reference: booking.reference,
  });
}
