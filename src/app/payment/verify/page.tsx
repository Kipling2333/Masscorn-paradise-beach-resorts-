"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, X as XIcon, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

type VerifyResult = {
  status: "verified" | "already_verified" | "failed";
  booking?: { id: number; reference: string; totalAmount: string };
  loyaltyEarned?: number;
  tier?: string;
  paymentType?: string;
  error?: string;
};

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "success" | "failed">("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");
    const bookingId = searchParams.get("booking_id");
    const status = searchParams.get("status");

    if (status === "cancelled") {
      setState("failed");
      setError("Payment was cancelled. Your booking has not been charged.");
      return;
    }

    if (!transactionId || !bookingId || !txRef) {
      setState("failed");
      setError("Missing payment verification data. Please contact the resort.");
      return;
    }

    fetch("/api/flutterwave/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: transactionId,
        booking_id: Number(bookingId),
        tx_ref: txRef,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        setResult(data);
        if (data.status === "verified" || data.status === "already_verified") {
          setState("success");
        } else {
          setState("failed");
          setError(data.error ?? "Payment verification failed.");
        }
      })
      .catch(() => {
        setState("failed");
        setError("Unable to verify payment. Please contact the resort at +255 774 000 100.");
      });
  }, [searchParams]);

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink px-6 py-32">
      <img src="/images/villa.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg"
      >
        {/* loading */}
        {state === "loading" && (
          <div className="glass-dark p-14 text-center">
            <Loader2 className="mx-auto animate-spin text-gold" size={40} />
            <h2 className="mt-6 font-display text-3xl text-ivory">Verifying your payment</h2>
            <p className="mt-3 text-sm text-ivory/55">
              We are confirming your transaction with Flutterwave. This takes just a moment…
            </p>
          </div>
        )}

        {/* success */}
        {state === "success" && result?.booking && (
          <div className="glass-dark p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
              <Check className="text-gold" size={30} strokeWidth={1.2} />
            </div>
            <h2 className="mt-6 font-display text-3xl text-ivory">Reserved, with pleasure</h2>
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-sm text-ivory/60">
                Booking <span className="text-gold tracking-widest font-medium">{result.booking.reference}</span>
              </p>
              <p className="font-display text-2xl text-gold">
                ${Number(result.booking.totalAmount).toLocaleString()}
              </p>
              {result.paymentType && (
                <span className="flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                  <ShieldCheck size={12} /> Paid via {result.paymentType.replace(/_/g, " ")}
                </span>
              )}
            </div>
            {result.loyaltyEarned && result.loyaltyEarned > 0 && (
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ivory/50">
                <Sparkles size={13} className="text-gold" />
                +{result.loyaltyEarned} Paradise Elite points earned · {result.tier} tier
              </div>
            )}
            <p className="mt-6 text-xs leading-relaxed text-ivory/45">
              Confirmation has been sent by email and SMS. Manage your stay, request airport pickup
              or download your invoice from your portal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/portal" className="btn-gold">
                Open my portal <ArrowRight size={14} />
              </Link>
              <Link href="/" className="btn-ghost">Return home</Link>
            </div>
          </div>
        )}

        {/* failed */}
        {state === "failed" && (
          <div className="glass-dark p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-300/40 bg-red-400/10">
              <XIcon className="text-red-300" size={28} strokeWidth={1.2} />
            </div>
            <h2 className="mt-6 font-display text-3xl text-ivory">Payment not completed</h2>
            <p className="mt-3 text-sm text-ivory/55">{error}</p>
            <p className="mt-4 text-xs text-ivory/40">
              No charges have been applied. You can try again or contact our reservations desk at +255 774 000 100.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/accommodations" className="btn-gold">Try again</Link>
              <Link href="/contact" className="btn-ghost">Contact the resort</Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
