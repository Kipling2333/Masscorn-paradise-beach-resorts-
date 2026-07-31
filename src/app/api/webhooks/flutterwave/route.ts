import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, payments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notify } from "@/lib/auth";
import { tierForPoints } from "@/lib/pricing";

/**
 * Flutterwave Webhook Handler
 * 
 * Securely processes payment notifications from Flutterwave.
 * Supports both redirect flow (GET) and async webhook (POST).
 * 
 * Routes:
 * - POST /api/webhooks/flutterwave - Async webhook from Flutterwave
 * - GET /api/webhooks/flutterwave/redirect - Redirect handler after payment
 */

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY ?? "";
const FLW_WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH ?? "";

interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: "successful" | "failed" | "pending";
    payment_type: string;
    created_at: string;
    account_id: number;
    meta?: {
      booking_id?: string;
      booking_ref?: string;
      [key: string]: unknown;
    };
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
      created_at: string;
    };
  };
}

/**
 * Verify webhook signature using Flutterwave's verification secret
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!FLW_WEBHOOK_HASH || !signature) {
    // In development, accept without signature if hash not configured
    return process.env.NODE_ENV === "development";
  }
  
  // Flutterwave uses simple hash comparison
  // In production, compare against the secret hash from dashboard
  const crypto = require("node:crypto");
  const hash = crypto.createHash("sha256").update(payload + FLW_WEBHOOK_HASH).digest("hex");
  return hash === signature;
}

/**
 * Verify transaction with Flutterwave API
 */
async function verifyTransaction(transactionId: number): Promise<{
  valid: boolean;
  status?: string;
  amount?: number;
  txRef?: string;
  data?: Record<string, unknown>;
}> {
  try {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: {
        "Authorization": `Bearer ${FLW_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.status === "success" && result.data?.status === "successful") {
      return {
        valid: true,
        status: result.data.status,
        amount: result.data.amount,
        txRef: result.data.tx_ref,
        data: result.data,
      };
    }

    return { valid: false, status: result.data?.status };
  } catch (err) {
    console.error("Transaction verification error:", err);
    return { valid: false };
  }
}

/**
 * Process successful payment
 */
async function processSuccessfulPayment(
  bookingId: number,
  transactionId: number,
  paymentData: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  // Fetch booking with user details
  const bookingRows = await db
    .select({
      booking: bookings,
      user: users,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (bookingRows.length === 0) {
    return { success: false, error: "Booking not found" };
  }

  const { booking, user } = bookingRows[0];

  // Idempotency check - already processed?
  if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
    return { success: true };
  }

  // Update booking status
  await db
    .update(bookings)
    .set({
      status: "confirmed",
      paymentStatus: "paid",
    })
    .where(eq(bookings.id, bookingId));

  // Record payment
  await db.insert(payments).values({
    bookingId: booking.id,
    amount: String(paymentData.amount || booking.totalAmount),
    method: String(paymentData.payment_type || "flutterwave"),
    transactionId: String(transactionId),
    status: "completed",
  });

  // Process loyalty points
  const total = Number(booking.totalAmount);
  const earned = Math.floor(total / 10);
  const newPoints = (user.loyaltyPoints ?? 0) + earned;
  const newTier = tierForPoints(newPoints);

  await db
    .update(users)
    .set({
      loyaltyPoints: newPoints,
      loyaltyTier: newTier,
    })
    .where(eq(users.id, user.id));

  // Send confirmation notifications
  await notify(
    user.id,
    `Reservation confirmed — ${booking.reference}`,
    `Dear ${user.name}, your payment has been received and your stay is confirmed. ` +
    `Reference: ${booking.reference}. Amount: $${total.toLocaleString()}. ` +
    `${booking.airportPickup ? "Airport pickup arranged. " : ""}` +
    `We look forward to welcoming you to Masscorn Paradise.`,
    ["email", "sms"]
  );

  return { success: true };
}

/**
 * POST Handler - Async Webhook from Flutterwave
 */
export async function POST(req: Request) {
  // Verify webhook signature
  const signature = req.headers.get("verif-hash");
  const rawBody = await req.text();
  
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: FlutterwaveWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only process charge.completed events
  if (payload.event !== "charge.completed") {
    return NextResponse.json({ received: true, processed: false });
  }

  const { data } = payload;
  const bookingId = data.meta?.booking_id ? parseInt(data.meta.booking_id) : null;

  if (!bookingId) {
    console.error("Webhook missing booking_id:", data);
    return NextResponse.json({ error: "Missing booking reference" }, { status: 400 });
  }

  // Verify transaction server-side
  const verification = await verifyTransaction(data.id);
  
  if (!verification.valid) {
    console.error("Transaction verification failed:", data.id, verification.status);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Process based on status
  if (data.status === "successful") {
    const result = await processSuccessfulPayment(bookingId, data.id, data);
    
    if (!result.success) {
      console.error("Payment processing failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      received: true, 
      processed: true,
      bookingId,
      status: "confirmed"
    });
  }

  // Failed payment - update booking status
  if (data.status === "failed") {
    await db
      .update(bookings)
      .set({ status: "cancelled", paymentStatus: "unpaid" })
      .where(eq(bookings.id, bookingId));
  }

  return NextResponse.json({ received: true, processed: true, status: data.status });
}

/**
 * GET Handler - Redirect flow after payment
 * 
 * Flutterwave redirects here after customer completes/cancels payment.
 * We verify and redirect to the appropriate status page.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const transactionId = searchParams.get("transaction_id");
  const txRef = searchParams.get("tx_ref");
  const status = searchParams.get("status");
  const bookingId = searchParams.get("booking_id");

  // Build redirect URL with status
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  
  if (!transactionId || !bookingId) {
    return NextResponse.redirect(`${baseUrl}/payment/verify?status=error&message=missing_params`);
  }

  // If user cancelled
  if (status === "cancelled") {
    await db
      .update(bookings)
      .set({ status: "cancelled", paymentStatus: "unpaid" })
      .where(eq(bookings.id, parseInt(bookingId)));
    
    return NextResponse.redirect(`${baseUrl}/payment/verify?status=cancelled&booking_id=${bookingId}`);
  }

  // Verify transaction
  const verification = await verifyTransaction(parseInt(transactionId));

  if (verification.valid && verification.status === "successful") {
    const result = await processSuccessfulPayment(
      parseInt(bookingId),
      parseInt(transactionId),
      { amount: verification.amount, payment_type: "card" }
    );

    if (result.success) {
      return NextResponse.redirect(
        `${baseUrl}/payment/verify?status=success&transaction_id=${transactionId}&tx_ref=${txRef}&booking_id=${bookingId}`
      );
    }
  }

  // Payment failed or pending
  return NextResponse.redirect(
    `${baseUrl}/payment/verify?status=pending&transaction_id=${transactionId}&booking_id=${bookingId}`
  );
}
