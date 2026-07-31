"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, BedDouble, CalendarDays, Check, CreditCard, Gem, LayoutDashboard, Loader2,
  LogIn, LogOut, Mail, MessageSquareText, ShieldAlert, Star, Trash2, Users, UtensilsCrossed,
  Waves, X, TrendingUp, Presentation,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ---------------------------------- types ---------------------------------- */

type AdminData = {
  stats: {
    totalRevenue: number; revenueThisMonth: number; bookings: number; cancelledBookings: number;
    guests: number; occupancy: number; checkInsToday: number; checkOutsToday: number;
    events: number; diningReservations: number; spaBookings: number; avgRating: number;
  };
  revenueByMonth: { month: string; revenue: number }[];
  occupancyByMonth: { month: string; pct: number }[];
  roomRevenue: { name: string; revenue: number }[];
  customerGrowth: { month: string; count: number }[];
  recentBookings: { booking: { id: number; reference: string; checkIn: string; checkOut: string; guests: number; totalAmount: string; status: string; paymentStatus: string; bookingType: string; createdAt: string }; guestName: string; guestEmail: string; roomName: string }[];
  customers: { id: number; name: string; email: string; phone: string | null; role: string; tier: string; points: number; joined: string; spend: number; stays: number; nights: number }[];
  diningPerf: { name: string; reservations: number }[];
  spaPerf: { name: string; count: number; revenue: number }[];
  reviews: { review: { id: number; rating: number; title: string | null; comment: string; approved: boolean; createdAt: string }; userName: string }[];
  inquiries: { id: number; name: string; email: string; eventType: string; preferredDate: string | null; guests: number; budget: string | null; message: string | null; status: string; createdAt: string }[];
  events: { id: number; title: string; eventType: string; venue: string; eventDate: string; capacity: number; price: string; description: string }[];
  notifications: { id: number; channel: string; subject: string; body: string; status: string; createdAt: string }[];
  inventory: { room: { id: number; roomNumber: string; status: string }; typeName: string }[];
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "bookings", label: "Bookings", icon: BedDouble },
  { id: "crm", label: "CRM", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "events", label: "Events", icon: Presentation },
  { id: "inquiries", label: "Inquiries", icon: MessageSquareText },
  { id: "messages", label: "Email / SMS", icon: Mail },
  { id: "rooms", label: "Inventory", icon: CalendarDays },
] as const;

const money = (n: number) => "$" + Math.round(n).toLocaleString();

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "ok" | "warn" }) {
  const s = tone === "ok" ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200" : tone === "warn" ? "border-red-300/40 bg-red-300/10 text-red-200" : "border-ivory/20 bg-ivory/10 text-ivory/70";
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${s}`}>{children}</span>;
}

/* ---------------------------------- charts --------------------------------- */

function AreaChart({ data, h = 190 }: { data: { label: string; value: number }[]; h?: number }) {
  const w = 640;
  const max = Math.max(...data.map((d) => d.value), 1);
  const pts = data.map((d, i) => [ (i / Math.max(1, data.length - 1)) * w, h - 14 - (d.value / max) * (h - 40) ] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c6a15b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c6a15b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ag)" />
        <path d={line} fill="none" stroke="#c6a15b" strokeWidth="2" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#0c2a2c" stroke="#c6a15b" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.2em] text-ivory/40">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}

function BarChart({ data, suffix = "%" }: { data: { label: string; value: number }[]; suffix?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-48 items-end gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] text-gold">{d.value}{suffix}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(3, (d.value / max) * 100)}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-14 rounded-t-md bg-gradient-to-t from-gold/30 to-gold"
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ data }: { data: { name: string; revenue: number }[] }) {
  const total = data.reduce((s, d) => s + d.revenue, 0) || 1;
  const colors = ["#c6a15b", "#7fb5a8", "#e4cfa1", "#5b8ea0", "#a8823f", "#9ab87a"];
  let acc = 0;
  const r = 60, C = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 160 160" className="w-40">
        {data.map((d, i) => {
          const frac = d.revenue / total;
          const dash = `${frac * C} ${C}`;
          const offset = -acc * C;
          acc += frac;
          return (
            <circle key={d.name} cx="80" cy="80" r={r} fill="none" stroke={colors[i % colors.length]} strokeWidth="18" strokeDasharray={dash} strokeDashoffset={offset} transform="rotate(-90 80 80)" />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fill="#f7f2e9" fontSize="15" fontFamily="serif">{money(total)}</text>
        <text x="80" y="94" textAnchor="middle" fill="#f7f2e980" fontSize="8" letterSpacing="2">REVENUE</text>
      </svg>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-3 text-xs text-ivory/65">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span>{d.name}</span>
            <span className="text-gold">{money(d.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- page ----------------------------------- */

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [busy, setBusy] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", eventType: "celebration", venue: "Grand Pavilion", eventDate: "", capacity: 80, price: 0, description: "" });

  const load = () => {
    fetch("/api/admin")
      .then(async (r) => {
        if (r.status === 403 || r.status === 401) { setDenied(true); return null; }
        return r.json();
      })
      .then((d) => d && setData(d))
      .catch(() => setDenied(true));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (payload: Record<string, unknown>) => {
    setBusy(true);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    load();
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await act({ action: "event_create", ...newEvent });
    setNewEvent({ title: "", eventType: "celebration", venue: "Grand Pavilion", eventDate: "", capacity: 80, price: 0, description: "" });
  };

  const upcoming = useMemo(() => {
    if (!data) return [];
    const today = new Date().toISOString().slice(0, 10);
    return data.recentBookings.filter((b) => b.booking.checkIn >= today && b.booking.status !== "cancelled").slice(0, 6);
  }, [data]);

  if (denied)
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
        <ShieldAlert size={36} strokeWidth={1.2} className="text-gold" />
        <h1 className="font-display text-4xl text-ivory">Restricted to resort management</h1>
        <p className="max-w-md text-sm text-ivory/55">Sign in with an administrator account (admin@masscorn.com) to open the operations dashboard.</p>
        <Link href="/auth" className="btn-gold">Sign in</Link>
      </div>
    );

  if (!data)
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-ink">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );

  const s = data.stats;

  return (
    <div className="min-h-[100svh] bg-ink pb-28 pt-32">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Operations Command</span>
            <h1 className="mt-3 font-display text-5xl font-light text-ivory">The <span className="italic">Bridge</span></h1>
          </div>
          <span className="text-xs tracking-[0.2em] uppercase text-ivory/40">{new Date().toDateString()} · Masscorn Bay</span>
        </div>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-btn flex items-center gap-2 ${tab === t.id ? "active !text-ivory" : ""}`}
              style={tab === t.id ? { borderColor: "#c6a15b", background: "rgba(198,161,91,0.12)", color: "#f7f2e9" } : { borderColor: "rgba(247,242,233,0.12)", color: "rgba(247,242,233,0.55)" }}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="mt-10">

            {/* ------------------------------ OVERVIEW ------------------------------ */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Lifetime revenue", v: money(s.totalRevenue), icon: CreditCard, sub: `${money(s.revenueThisMonth)} this month` },
                    { label: "Occupancy (month)", v: `${s.occupancy}%`, icon: BedDouble, sub: `${s.checkInsToday} arrivals · ${s.checkOutsToday} departures today` },
                    { label: "Active bookings", v: String(s.bookings), icon: CalendarDays, sub: `${s.cancelledBookings} cancelled` },
                    { label: "Guest rating", v: s.avgRating.toFixed(2), icon: Star, sub: `${s.guests} registered guests` },
                  ].map((c) => (
                    <div key={c.label} className="glass-dark p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/45">{c.label}</span>
                        <c.icon size={16} className="text-gold" />
                      </div>
                      <div className="mt-3 font-display text-4xl text-ivory">{c.v}</div>
                      <div className="mt-1 text-xs text-ivory/45">{c.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                  <div className="glass-dark p-7">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Revenue — last 8 months</span>
                    <div className="mt-6">
                      <AreaChart data={data.revenueByMonth.map((r) => ({ label: r.month, value: r.revenue }))} />
                    </div>
                  </div>
                  <div className="glass-dark p-7">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Revenue by residence</span>
                    <div className="mt-8 flex justify-center">
                      {data.roomRevenue.length ? <Donut data={data.roomRevenue} /> : <p className="text-sm text-ivory/40">Awaiting first revenue</p>}
                    </div>
                  </div>
                </div>
                <div className="glass-dark p-7">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Upcoming arrivals</span>
                  <div className="mt-4 overflow-x-auto">
                    <table className="table-lux w-full min-w-[640px] text-ivory [&_td]:border-ivory/10">
                      <thead className="[&_th]:text-ivory/40"><tr><th>Guest</th><th>Residence</th><th>Dates</th><th>Ref</th><th>Status</th></tr></thead>
                      <tbody>
                        {upcoming.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-ivory/40">No arrivals on the horizon</td></tr>}
                        {upcoming.map(({ booking, guestName, roomName }) => (
                          <tr key={booking.id}>
                            <td>{guestName}</td><td>{roomName}</td>
                            <td>{booking.checkIn} → {booking.checkOut}</td>
                            <td className="tracking-widest">{booking.reference}</td>
                            <td><Badge tone="ok">{booking.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------ ANALYTICS ----------------------------- */}
            {tab === "analytics" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-dark p-7">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Occupancy — last 6 months</span>
                  <div className="mt-8">
                    <BarChart data={data.occupancyByMonth.map((o) => ({ label: o.month, value: o.pct }))} />
                  </div>
                </div>
                <div className="glass-dark p-7">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-gold">New guests — per month</span>
                  <div className="mt-8">
                    <BarChart data={data.customerGrowth.map((c) => ({ label: c.month, value: c.count }))} suffix="" />
                  </div>
                </div>
                <div className="glass-dark p-7">
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-gold"><UtensilsCrossed size={13} /> Restaurant performance</span>
                  <div className="mt-6 space-y-4">
                    {data.diningPerf.map((d) => (
                      <div key={d.name} className="flex items-center justify-between border-b border-ivory/10 pb-3 text-sm">
                        <span className="text-ivory/80">{d.name}</span>
                        <span className="text-gold">{d.reservations} reservations</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-dark p-7">
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-gold"><Waves size={13} /> Spa performance</span>
                  <div className="mt-6 space-y-4">
                    {data.spaPerf.length === 0 && <p className="text-sm text-ivory/40">No rituals yet</p>}
                    {data.spaPerf.map((d) => (
                      <div key={d.name} className="flex items-center justify-between border-b border-ivory/10 pb-3 text-sm">
                        <span className="text-ivory/80">{d.name}</span>
                        <span className="text-ivory/50">{d.count}× · <span className="text-gold">{money(d.revenue)}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------ BOOKINGS ------------------------------ */}
            {tab === "bookings" && (
              <div className="glass-dark overflow-x-auto p-4 md:p-7">
                <table className="table-lux w-full min-w-[900px] text-ivory [&_td]:border-ivory/10">
                  <thead className="[&_th]:text-ivory/40"><tr><th>Ref</th><th>Guest</th><th>Residence</th><th>Dates</th><th>Type</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.recentBookings.map(({ booking, guestName, guestEmail, roomName }) => (
                      <tr key={booking.id}>
                        <td className="tracking-widest">{booking.reference}</td>
                        <td>{guestName}<div className="text-xs text-ivory/40">{guestEmail}</div></td>
                        <td>{roomName}</td>
                        <td>{booking.checkIn} → {booking.checkOut}</td>
                        <td className="capitalize">{booking.bookingType}</td>
                        <td className="text-gold">{money(Number(booking.totalAmount))}</td>
                        <td><Badge tone={booking.paymentStatus === "paid" ? "ok" : booking.paymentStatus === "refunded" ? "warn" : "neutral"}>{booking.paymentStatus}</Badge></td>
                        <td>
                          <select
                            value={booking.status}
                            disabled={busy}
                            onChange={(e) => act({ action: "booking_status", id: booking.id, status: e.target.value })}
                            className="rounded-md border border-ivory/15 bg-ink px-2 py-1.5 text-xs text-ivory/80"
                          >
                            {["pending", "confirmed", "completed", "cancelled"].map((st) => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* --------------------------------- CRM --------------------------------- */}
            {tab === "crm" && (
              <div className="glass-dark overflow-x-auto p-4 md:p-7">
                <table className="table-lux w-full min-w-[960px] text-ivory [&_td]:border-ivory/10">
                  <thead className="[&_th]:text-ivory/40"><tr><th>Guest</th><th>Contact</th><th>Tier</th><th>Points</th><th>Stays</th><th>Nights</th><th>Lifetime spend</th><th>Since</th></tr></thead>
                  <tbody>
                    {data.customers.map((c) => (
                      <tr key={c.id}>
                        <td className="font-medium">{c.name}{c.role !== "guest" && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-gold">{c.role}</span>}</td>
                        <td className="text-xs text-ivory/50">{c.email}{c.phone ? ` · ${c.phone}` : ""}</td>
                        <td>
                          <select
                            value={c.tier}
                            disabled={busy}
                            onChange={(e) => act({ action: "user_tier", id: c.id, tier: e.target.value })}
                            className="rounded-md border border-ivory/15 bg-ink px-2 py-1 text-xs capitalize text-ivory/80"
                          >
                            {["silver", "gold", "platinum"].map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td>{c.points.toLocaleString()}</td>
                        <td>{c.stays}</td>
                        <td>{c.nights}</td>
                        <td className="text-gold">{money(c.spend)}</td>
                        <td className="text-xs text-ivory/45">{new Date(c.joined).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ------------------------------- REVIEWS ------------------------------- */}
            {tab === "reviews" && (
              <div className="grid gap-5 md:grid-cols-2">
                {data.reviews.map(({ review, userName }) => (
                  <div key={review.id} className="glass-dark p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={13} className={i <= review.rating ? "fill-gold text-gold" : "text-ivory/25"} />)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={review.approved ? "ok" : "warn"}>{review.approved ? "Published" : "Pending"}</Badge>
                        <button
                          disabled={busy}
                          onClick={() => act({ action: "review_approve", id: review.id, approved: !review.approved })}
                          className="flex items-center gap-1.5 rounded-md border border-ivory/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory/70 hover:border-gold hover:text-gold transition-colors"
                        >
                          {review.approved ? <X size={11} /> : <Check size={11} />} {review.approved ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </div>
                    {review.title && <div className="mt-3 font-display text-xl text-ivory">{review.title}</div>}
                    <p className="mt-1.5 text-sm text-ivory/60">{review.comment}</p>
                    <div className="mt-3 text-xs text-ivory/40">{userName} · {new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* -------------------------------- EVENTS -------------------------------- */}
            {tab === "events" && (
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-4">
                  {data.events.map((e) => (
                    <div key={e.id} className="glass-dark flex items-start justify-between gap-4 p-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-xl text-ivory">{e.title}</span>
                          <Badge>{e.eventType.replace(/_/g, " ")}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-ivory/50">{e.eventDate} · {e.venue} · up to {e.capacity} guests · {Number(e.price) > 0 ? `$${Number(e.price)} pp` : "by invitation"}</div>
                        <p className="mt-2 text-sm text-ivory/55">{e.description}</p>
                      </div>
                      <button disabled={busy} onClick={() => act({ action: "event_delete", id: e.id })} className="text-ivory/40 hover:text-red-300 transition-colors" aria-label="Delete event">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={createEvent} className="glass-dark h-fit space-y-4 p-7">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Create event</span>
                  <input required placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent((n) => ({ ...n, title: e.target.value }))} className="form-input-dark" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={newEvent.eventType} onChange={(e) => setNewEvent((n) => ({ ...n, eventType: e.target.value }))} className="form-input-dark">
                      {["wedding", "conference", "birthday", "beach_party", "corporate_retreat", "wellness", "celebration"].map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                    <input required type="date" value={newEvent.eventDate} onChange={(e) => setNewEvent((n) => ({ ...n, eventDate: e.target.value }))} className="form-input-dark" />
                    <input placeholder="Venue" value={newEvent.venue} onChange={(e) => setNewEvent((n) => ({ ...n, venue: e.target.value }))} className="form-input-dark" />
                    <input type="number" min={1} placeholder="Capacity" value={newEvent.capacity} onChange={(e) => setNewEvent((n) => ({ ...n, capacity: Number(e.target.value) }))} className="form-input-dark" />
                    <input type="number" min={0} placeholder="Price pp (0 = invitation)" value={newEvent.price} onChange={(e) => setNewEvent((n) => ({ ...n, price: Number(e.target.value) }))} className="form-input-dark" />
                  </div>
                  <textarea rows={3} placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent((n) => ({ ...n, description: e.target.value }))} className="form-input-dark resize-none" />
                  <button disabled={busy} className="btn-gold w-full">{busy ? <Loader2 size={14} className="animate-spin" /> : "Publish event"}</button>
                </form>
              </div>
            )}

            {/* ------------------------------ INQUIRIES ------------------------------- */}
            {tab === "inquiries" && (
              <div className="glass-dark overflow-x-auto p-4 md:p-7">
                <table className="table-lux w-full min-w-[900px] text-ivory [&_td]:border-ivory/10">
                  <thead className="[&_th]:text-ivory/40"><tr><th>Contact</th><th>Occasion</th><th>Date</th><th>Guests</th><th>Budget</th><th>Message</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.inquiries.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-ivory/40">No inquiries yet</td></tr>}
                    {data.inquiries.map((q) => (
                      <tr key={q.id}>
                        <td>{q.name}<div className="text-xs text-ivory/40">{q.email}</div></td>
                        <td className="capitalize">{q.eventType.replace(/_/g, " ")}</td>
                        <td>{q.preferredDate ?? "—"}</td>
                        <td>{q.guests}</td>
                        <td>{q.budget ?? "—"}</td>
                        <td className="max-w-[220px] truncate text-xs text-ivory/50">{q.message ?? "—"}</td>
                        <td>
                          <select
                            value={q.status}
                            disabled={busy}
                            onChange={(e) => act({ action: "inquiry_status", id: q.id, status: e.target.value })}
                            className="rounded-md border border-ivory/15 bg-ink px-2 py-1 text-xs text-ivory/80"
                          >
                            {["new", "in_review", "confirmed", "declined"].map((st) => <option key={st} value={st}>{st.replace(/_/g, " ")}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ------------------------------- MESSAGES ------------------------------- */}
            {tab === "messages" && (
              <div className="space-y-4">
                {data.notifications.length === 0 && <p className="text-sm text-ivory/40">The dispatch log is empty</p>}
                {data.notifications.map((n) => (
                  <div key={n.id} className="glass-dark flex items-start gap-5 p-5">
                    <span className={`mt-0.5 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.25em] ${n.channel === "sms" ? "border-cyan-200/40 text-cyan-200" : "border-gold/40 text-gold"}`}>{n.channel}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-ivory">{n.subject}</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">{n.status}</span>
                        <span className="text-xs text-ivory/35">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-xs text-ivory/55">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------- INVENTORY ------------------------------ */}
            {tab === "rooms" && (
              <div className="glass-dark overflow-x-auto p-4 md:p-7">
                <table className="table-lux w-full min-w-[640px] text-ivory [&_td]:border-ivory/10">
                  <thead className="[&_th]:text-ivory/40"><tr><th>Room</th><th>Category</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {data.inventory.map(({ room, typeName }) => (
                      <tr key={room.id}>
                        <td className="tracking-widest">{room.roomNumber}</td>
                        <td>{typeName}</td>
                        <td><Badge tone={room.status === "active" ? "ok" : "warn"}>{room.status}</Badge></td>
                        <td>
                          <button
                            disabled={busy}
                            onClick={() => act({ action: "room_status", id: room.id, status: room.status === "active" ? "maintenance" : "active" })}
                            className="rounded-md border border-ivory/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory/70 hover:border-gold hover:text-gold transition-colors"
                          >
                            Mark {room.status === "active" ? "maintenance" : "active"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
