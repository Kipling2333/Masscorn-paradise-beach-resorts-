"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BedDouble, CalendarDays, CreditCard, Gem, Heart, Loader2, Mail, MessageSquareText,
  Plane, Sparkles, Star, UtensilsCrossed, Waves, X, Download, User as UserIcon, Check,
} from "lucide-react";
import { ReviewComposer, Stars } from "@/components/widgets";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------------------- types ---------------------------------- */

type PortalData = {
  user: { id: number; name: string; email: string; phone: string | null; role: string; loyaltyTier: string; loyaltyPoints: number; createdAt: string };
  bookings: { booking: { id: number; reference: string; checkIn: string; checkOut: string; guests: number; totalAmount: string; status: string; paymentStatus: string; airportPickup: boolean; createdAt: string }; roomName: string; roomImage: string; roomSlug: string }[];
  payments: { payment: { id: number; amount: string; method: string; transactionId: string; status: string; createdAt: string }; reference: string; checkIn: string; checkOut: string; roomName: string; guests: number }[];
  dining: { reservation: { id: number; reservationDate: string; reservationTime: string; guests: number; tableNumber: number | null; status: string }; restaurantName: string }[];
  spa: { booking: { id: number; appointmentDate: string; appointmentTime: string; therapist: string | null; amount: string; status: string }; serviceName: string; duration: number }[];
  favorites: { favorite: { id: number }; room: { id: number; slug: string; name: string; image: string; basePrice: string; tagline: string | null } }[];
  notifications: { id: number; channel: string; subject: string; body: string; createdAt: string }[];
  reviews: { id: number; rating: number; title: string | null; comment: string; approved: boolean; createdAt: string }[];
};

const TABS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "stays", label: "My Stays", icon: BedDouble },
  { id: "dining", label: "Dining & Spa", icon: UtensilsCrossed },
  { id: "loyalty", label: "Elite Club", icon: Gem },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "invoices", label: "Invoices", icon: CreditCard },
  { id: "messages", label: "Messages", icon: MessageSquareText },
  { id: "profile", label: "Profile", icon: UserIcon },
] as const;

const TIER_STYLE: Record<string, string> = {
  silver: "text-slate-300 border-slate-300/40 bg-slate-300/10",
  gold: "text-gold border-gold/50 bg-gold/10",
  platinum: "text-cyan-200 border-cyan-200/40 bg-cyan-200/10",
};

function nights(ci: string, co: string) {
  return Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "ok" | "warn" }) {
  const styles = tone === "ok"
    ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
    : tone === "warn"
      ? "border-red-300/40 bg-red-300/10 text-red-200"
      : "border-ivory/20 bg-ivory/10 text-ivory/70";
  return <span className={`rounded-full border px-3 py-1 text-[10px] tracking-[0.2em] uppercase ${styles}`}>{children}</span>;
}

export default function PortalPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [busy, setBusy] = useState<number | null>(null);
  const [profile, setProfile] = useState({ name: "", phone: "", preferredLanguage: "en" });
  const [profileSaved, setProfileSaved] = useState(false);

  const load = () => {
    fetch("/api/portal")
      .then(async (r) => {
        if (r.status === 401) { router.push("/auth"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setData(d);
        setProfile({ name: d.user.name, phone: d.user.phone ?? "", preferredLanguage: "en" });
      })
      .catch(() => {});
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nextStay = useMemo(() => {
    if (!data) return null;
    const today = new Date().toISOString().slice(0, 10);
    return data.bookings.find((b) => b.booking.checkOut >= today && b.booking.status !== "cancelled") ?? null;
  }, [data]);

  if (!data)
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-ink">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );

  const { user } = data;
  const progress = Math.min(100, (user.loyaltyPoints / 10000) * 100);
  const nextTier = user.loyaltyTier === "platinum" ? null : user.loyaltyTier === "gold" ? "platinum" : "gold";

  const cancelBooking = async (id: number) => {
    setBusy(id);
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    setBusy(null);
    load();
  };

  const unfavorite = async (roomTypeId: number) => {
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomTypeId }),
    });
    load();
  };

  const printInvoice = (p: PortalData["payments"][number]) => {
    const w = window.open("", "_blank", "width=760,height=900");
    if (!w) return;
    const n = nights(p.checkIn, p.checkOut);
    w.document.write(`<!doctype html><html><head><title>Invoice ${p.reference}</title><style>
      body{font-family:Georgia,serif;color:#0c2a2c;padding:48px;background:#f7f2e9}
      .rule{height:1px;background:#c6a15b;margin:24px 0}
      table{width:100%;border-collapse:collapse;font-size:14px}
      td{padding:10px 0;border-bottom:1px solid rgba(12,42,44,.12)}
      .right{text-align:right}
      h1{letter-spacing:.3em;font-size:26px} h2{font-size:12px;letter-spacing:.35em;color:#c6a15b;font-weight:normal}
      .total{font-size:22px}
      .foot{font-size:11px;color:#666;margin-top:40px}
      </style></head><body>
      <h1>MASSCORN</h1><h2>PARADISE BEACH RESORT — TAX INVOICE</h2>
      <div class="rule"></div>
      <p>Invoice <strong>${p.reference}</strong> · Issued ${new Date(p.payment.createdAt).toLocaleDateString()}<br/>Guest: ${user.name} · ${user.email}</p>
      <table>
        <tr><td>${p.roomName} — ${n} night(s) · ${p.guests} guest(s)</td><td class="right">${p.checkIn} → ${p.checkOut}</td></tr>
        <tr><td>Accommodation & inclusions</td><td class="right">$${Number(p.payment.amount).toLocaleString()}</td></tr>
        <tr><td>Taxes & resort fees</td><td class="right">Included</td></tr>
        <tr class="total"><td><strong>Total paid</strong></td><td class="right"><strong>$${Number(p.payment.amount).toLocaleString()}</strong></td></tr>
      </table>
      <div class="rule"></div>
      <p>Method: ${p.payment.method.replace(/_/g, " ")} · Transaction ${p.payment.transactionId} · Status: ${p.payment.status}</p>
      <p class="foot">Masscorn Paradise Beach Resort · Masscorn Bay, Paje Coast · +255 774 000 100 · reservations@masscorn.com<br/>Thank you for staying with us. Karibu tena — welcome back, always.</p>
      <script>window.print()</script></body></html>`);
    w.document.close();
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(false);
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "profile", ...profile }),
    });
    setProfileSaved(true);
    load();
  };

  return (
    <div className="min-h-[100svh] bg-ink pb-28 pt-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Guest Portal</span>
            <h1 className="mt-3 font-display text-5xl font-light text-ivory md:text-6xl">
              Karibu, <span className="italic">{user.name.split(" ")[0]}</span>
            </h1>
          </div>
          <span className={`w-fit rounded-full border px-4 py-1.5 text-[11px] tracking-[0.3em] uppercase ${TIER_STYLE[user.loyaltyTier]}`}>
            {user.loyaltyTier} · Paradise Elite
          </span>
        </div>

        {/* tabs */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-btn flex items-center gap-2 !text-ivory/60 ${tab === t.id ? "active !text-ivory" : ""}`}
              style={{ borderColor: tab === t.id ? "#c6a15b" : "rgba(247,242,233,0.12)", background: tab === t.id ? "rgba(198,161,91,0.12)" : "transparent" }}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            {/* ------------------------------- OVERVIEW ------------------------------ */}
            {tab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-6">
                  <div className="glass-dark p-8">
                    <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Your next escape</span>
                    {nextStay ? (
                      <div className="mt-5 flex flex-col gap-6 sm:flex-row">
                        <img src={nextStay.roomImage} alt={nextStay.roomName} className="h-36 w-full rounded-xl object-cover sm:w-52" />
                        <div>
                          <div className="font-display text-3xl text-ivory">{nextStay.roomName}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ivory/60">
                            <span className="flex items-center gap-2"><CalendarDays size={14} className="text-gold" />{nextStay.booking.checkIn} → {nextStay.booking.checkOut}</span>
                            <span>{nights(nextStay.booking.checkIn, nextStay.booking.checkOut)} nights</span>
                            {nextStay.booking.airportPickup && <span className="flex items-center gap-2 text-gold"><Plane size={14} /> Pickup arranged</span>}
                          </div>
                          <div className="mt-3 text-[11px] tracking-[0.25em] uppercase text-ivory/40">Ref {nextStay.booking.reference}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <p className="text-sm text-ivory/60">No upcoming stays — the tide is waiting.</p>
                        <Link href="/accommodations" className="btn-gold mt-5">Plan a stay</Link>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-6 sm:grid-cols-3">
                    {[
                      { label: "Total stays", v: data.bookings.filter((b) => b.booking.status !== "cancelled").length },
                      { label: "Elite points", v: user.loyaltyPoints.toLocaleString() },
                      { label: "Table & rituals", v: data.dining.length + data.spa.length },
                    ].map((s) => (
                      <div key={s.label} className="glass-dark p-6 text-center">
                        <div className="font-display text-4xl text-gold">{s.v}</div>
                        <div className="mt-2 text-[10px] tracking-[0.3em] uppercase text-ivory/45">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-dark p-8">
                  <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Elite journey</span>
                  <div className="mt-5 font-display text-3xl capitalize text-ivory">{user.loyaltyTier}</div>
                  <div className="mt-1 text-xs text-ivory/50">
                    {nextTier ? `${(user.loyaltyTier === "silver" ? 2500 : 10000) - user.loyaltyPoints > 0 ? ((user.loyaltyTier === "silver" ? 2500 : 10000) - user.loyaltyPoints).toLocaleString() : 0} points to ${nextTier}` : "The summit of Paradise"}
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gradient-to-r from-gold/70 to-gold" />
                  </div>
                  <div className="mt-8 space-y-3 border-t border-ivory/10 pt-6 text-sm text-ivory/65">
                    <div className="flex items-center gap-3"><Check size={14} className="text-gold" /> Member rate applied at checkout</div>
                    <div className="flex items-center gap-3"><Check size={14} className="text-gold" /> Complimentary airport pickup option</div>
                    <div className="flex items-center gap-3"><Check size={14} className="text-gold" /> Priority dining & spa slots</div>
                  </div>
                  <div className="mt-8 grid gap-3">
                    <Link href="/accommodations" className="btn-gold w-full">Book a stay</Link>
                    <Link href="/dining" className="btn-ghost w-full">Reserve dinner</Link>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------- STAYS -------------------------------- */}
            {tab === "stays" && (
              <div className="space-y-5">
                {data.bookings.length === 0 && <EmptyState icon={BedDouble} text="No reservations yet" cta={{ href: "/accommodations", label: "Explore residences" }} />}
                {data.bookings.map(({ booking, roomName, roomImage, roomSlug }) => (
                  <div key={booking.id} className="glass-dark flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                    <img src={roomImage} alt={roomName} className="h-28 w-full rounded-xl object-cover sm:w-40" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-display text-2xl text-ivory">{roomName}</span>
                        <Badge tone={booking.status === "cancelled" ? "warn" : "ok"}>{booking.status}</Badge>
                        <Badge>{booking.paymentStatus}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-ivory/55">
                        {booking.checkIn} → {booking.checkOut} · {booking.guests} guest(s) · Ref {booking.reference}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-ivory/40">Total</div>
                        <div className="font-display text-2xl text-gold">${Number(booking.totalAmount).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/accommodations/${roomSlug}`} className="btn-ghost !px-4 !py-2">View</Link>
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            disabled={busy === booking.id}
                            className="rounded-lg border border-red-300/30 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-red-200 transition-colors hover:bg-red-400/10"
                          >
                            {busy === booking.id ? <Loader2 size={12} className="animate-spin" /> : <span className="flex items-center gap-1.5"><X size={12} /> Cancel</span>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ----------------------------- DINING & SPA ---------------------------- */}
            {tab === "dining" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-dark p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Table reservations</span>
                    <Link href="/dining" className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 hover:text-gold">+ New</Link>
                  </div>
                  <div className="mt-6 space-y-4">
                    {data.dining.length === 0 && <p className="text-sm text-ivory/50">No tables reserved — the chef asks about you.</p>}
                    {data.dining.map(({ reservation, restaurantName }) => (
                      <div key={reservation.id} className="flex items-center justify-between border-b border-ivory/10 pb-4">
                        <div>
                          <div className="text-ivory">{restaurantName}</div>
                          <div className="text-xs text-ivory/50">{reservation.reservationDate} at {reservation.reservationTime} · {reservation.guests} guests {reservation.tableNumber ? `· Table ${reservation.tableNumber}` : ""}</div>
                        </div>
                        <Badge tone="ok">{reservation.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-dark p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Spa rituals</span>
                    <Link href="/spa" className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 hover:text-gold">+ New</Link>
                  </div>
                  <div className="mt-6 space-y-4">
                    {data.spa.length === 0 && <p className="text-sm text-ivory/50">No rituals scheduled — stillness awaits.</p>}
                    {data.spa.map(({ booking, serviceName, duration }) => (
                      <div key={booking.id} className="flex items-center justify-between border-b border-ivory/10 pb-4">
                        <div>
                          <div className="text-ivory">{serviceName} <span className="text-xs text-ivory/40">· {duration} min</span></div>
                          <div className="text-xs text-ivory/50">{booking.appointmentDate} at {booking.appointmentTime} · {booking.therapist}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold">${Number(booking.amount).toLocaleString()}</div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">{booking.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-dark p-7 lg:col-span-2">
                  <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Experiences</span>
                  <p className="mt-4 text-sm text-ivory/60">
                    To arrange activities — jet ski, snorkelling safaris, dhow cruises, fishing charters or cultural tours — simply ask Aurelia (gold button) or call the experiences desk at +255 774 000 100. Charges post to your suite.
                  </p>
                </div>
              </div>
            )}

            {/* ------------------------------- LOYALTY ------------------------------- */}
            {tab === "loyalty" && (
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { tier: "Silver", need: "Enrolment", off: "5%", active: user.loyaltyTier === "silver", perks: ["Welcome drink ritual", "Member rates", "Digital news"] },
                  { tier: "Gold", need: "2,500 pts", off: "10%", active: user.loyaltyTier === "gold", perks: ["Arrival upgrade", "VIP check-in", "Cruise −25%"] },
                  { tier: "Platinum", need: "10,000 pts", off: "15%", active: user.loyaltyTier === "platinum", perks: ["Suite upgrades", "Airport transfers", "$300 spa credit"] },
                ].map((t) => (
                  <div key={t.tier} className={`glass-dark p-7 ${t.active ? "border-gold/60 shadow-[0_24px_70px_-30px_rgba(198,161,91,0.5)]" : "opacity-80"}`}>
                    <div className="flex items-center justify-between">
                      <Gem size={18} className="text-gold" />
                      {t.active && <Badge tone="ok">Your tier</Badge>}
                    </div>
                    <div className="mt-4 font-display text-3xl text-ivory">{t.tier}</div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-ivory/45">{t.need} · {t.off} member rate</div>
                    <ul className="mt-5 space-y-2.5 text-sm text-ivory/65">
                      {t.perks.map((p) => <li key={p} className="flex items-center gap-2.5"><Check size={13} className="text-gold" /> {p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------ FAVORITES ------------------------------ */}
            {tab === "favorites" && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.favorites.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={Heart} text="No saved residences yet — tap the heart on any room page" cta={{ href: "/accommodations", label: "Browse residences" }} /></div>}
                {data.favorites.map(({ favorite, room }) => (
                  <div key={favorite.id} className="glass-dark overflow-hidden">
                    <img src={room.image} alt={room.name} className="aspect-[16/10] w-full object-cover" />
                    <div className="p-6">
                      <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{room.tagline}</div>
                      <div className="mt-1 font-display text-2xl text-ivory">{room.name}</div>
                      <div className="mt-1 text-sm text-ivory/50">from ${Number(room.basePrice).toLocaleString()} / night</div>
                      <div className="mt-5 flex gap-3">
                        <Link href={`/accommodations/${room.slug}`} className="btn-gold !px-4 !py-2 flex-1 text-center">Reserve</Link>
                        <button onClick={() => unfavorite(room.id)} className="rounded-lg border border-ivory/15 px-4 text-ivory/60 hover:border-red-300/40 hover:text-red-200 transition-colors" aria-label="Remove favorite">
                          <Heart size={15} className="fill-gold text-gold" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------- REVIEWS ------------------------------- */}
            {tab === "reviews" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-dark p-7">
                  <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Your reviews</span>
                  <div className="mt-6 space-y-5">
                    {data.reviews.length === 0 && <p className="text-sm text-ivory/50">You have not shared your story yet.</p>}
                    {data.reviews.map((r) => (
                      <div key={r.id} className="border-b border-ivory/10 pb-5">
                        <div className="flex items-center justify-between">
                          <Stars value={r.rating} />
                          <Badge tone={r.approved ? "ok" : "neutral"}>{r.approved ? "Published" : "In curation"}</Badge>
                        </div>
                        {r.title && <div className="mt-2 font-display text-xl text-ivory">{r.title}</div>}
                        <p className="mt-1 text-sm text-ivory/60">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.35em] uppercase text-gold">Share your stay</span>
                  <div className="mt-4">
                    <ReviewComposer user={{ name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier }} />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------- INVOICES ------------------------------ */}
            {tab === "invoices" && (
              <div className="glass-dark overflow-x-auto p-4 md:p-7">
                <table className="table-lux w-full min-w-[680px] text-ivory [&_td]:border-ivory/10">
                  <thead className="[&_th]:text-ivory/40"><tr><th>Reference</th><th>Residence</th><th>Paid</th><th>Method</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.payment.id}>
                        <td className="tracking-widest">{p.reference}</td>
                        <td>{p.roomName}</td>
                        <td className="text-gold">${Number(p.payment.amount).toLocaleString()}</td>
                        <td className="capitalize">{p.payment.method.replace(/_/g, " ")}</td>
                        <td><Badge tone={p.payment.status === "refunded" ? "warn" : "ok"}>{p.payment.status}</Badge></td>
                        <td>
                          <button onClick={() => printInvoice(p)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gold hover:text-ivory transition-colors">
                            <Download size={13} /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.payments.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ivory/40">No invoices yet</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* ------------------------------- MESSAGES ------------------------------ */}
            {tab === "messages" && (
              <div className="space-y-4">
                {data.notifications.length === 0 && <EmptyState icon={Mail} text="No messages yet — confirmations will appear here" />}
                {data.notifications.map((n) => (
                  <div key={n.id} className="glass-dark flex items-start gap-5 p-6">
                    <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${n.channel === "sms" ? "border-cyan-200/40 text-cyan-200" : "border-gold/40 text-gold"}`}>
                      {n.channel === "sms" ? <MessageSquareText size={15} /> : <Mail size={15} />}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-display text-lg text-ivory">{n.subject}</span>
                        <Badge>{n.channel}</Badge>
                        <span className="text-xs text-ivory/35">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------- PROFILE ------------------------------- */}
            {tab === "profile" && (
              <form onSubmit={saveProfile} className="glass-dark grid max-w-2xl gap-5 p-8 md:grid-cols-2">
                <label className="block">
                  <span className="widget-label">Full name</span>
                  <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="form-input-dark" />
                </label>
                <label className="block">
                  <span className="widget-label">Email</span>
                  <input value={user.email} disabled className="form-input-dark opacity-50" />
                </label>
                <label className="block">
                  <span className="widget-label">Phone / WhatsApp (SMS alerts)</span>
                  <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="form-input-dark" placeholder="+255 …" />
                </label>
                <label className="block">
                  <span className="widget-label">Preferred language</span>
                  <select value={profile.preferredLanguage} onChange={(e) => setProfile((p) => ({ ...p, preferredLanguage: e.target.value }))} className="form-input-dark">
                    <option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option>
                  </select>
                </label>
                <div className="md:col-span-2 flex items-center gap-4">
                  <button className="btn-gold">Save profile</button>
                  {profileSaved && <span className="flex items-center gap-2 text-sm text-emerald-300"><Check size={14} /> Saved</span>}
                </div>
                <p className="text-xs text-ivory/40 md:col-span-2">
                  Member since {new Date(user.createdAt).toLocaleDateString()} · Airport pickup and activity requests can be added to any confirmed stay from the My Stays tab.
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, cta }: { icon: React.ComponentType<{ size?: number | string; className?: string }>; text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="glass-dark flex flex-col items-center gap-4 p-14 text-center">
      <Icon size={26} className="text-gold/70" />
      <p className="text-sm text-ivory/55">{text}</p>
      {cta && <Link href={cta.href} className="btn-gold">{cta.label}</Link>}
    </div>
  );
}
