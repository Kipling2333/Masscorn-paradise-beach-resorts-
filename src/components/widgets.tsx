"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, Clock, CreditCard, Heart,
  Loader2, Minus, Plus, Quote, Star, Sun, CloudSun, Droplets, Wind, Users, X, Sparkles,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

/* ------------------------------- Motion atoms ------------------------------- */

export function Reveal({
  children, delay = 0, y = 36, className = "",
}: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxImg({
  src, alt, className = "", speed = 0.25,
}: { src: string; alt: string; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y, scale: 1.25 }} className="h-full w-full object-cover" />
    </div>
  );
}

export function SectionHeading({
  index, eyebrow, title, sub, dark = false, align = "center",
}: {
  index?: string; eyebrow: string; title: React.ReactNode; sub?: string;
  dark?: boolean; align?: "center" | "left";
}) {
  return (
    <Reveal className={`${align === "center" ? "text-center mx-auto" : "text-left"} max-w-3xl`}>
      <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}>
        {index && <span className="text-[11px] tracking-[0.35em] text-gold">{index}</span>}
        <span className="h-px w-10 bg-gold/50" />
        <span className={`text-[11px] tracking-[0.35em] uppercase ${dark ? "text-ivory/60" : "text-ink/50"}`}>{eyebrow}</span>
        {index == null && <span className="h-px w-10 bg-gold/50" />}
      </div>
      <h2 className={`mt-5 font-display text-4xl leading-[1.08] md:text-6xl ${dark ? "text-ivory" : "text-ink"}`}>
        {title}
      </h2>
      {sub && <p className={`mt-6 text-[15px] leading-relaxed ${dark ? "text-ivory/60" : "text-ink/60"}`}>{sub}</p>}
    </Reveal>
  );
}

export function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-ivory/10 py-5">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-10 text-[11px] tracking-[0.4em] uppercase text-ivory/50">
            {it} <Sparkles size={11} className="text-gold/70" strokeWidth={1.2} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Stars({ value, onChange, size = 15 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${s} star`}
        >
          <Star size={size} strokeWidth={1.2} className={s <= value ? "fill-gold text-gold" : "text-current opacity-30"} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Booking widget ------------------------------ */

function iso(offsetDays: number) {
  return new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
}

export function BookingWidget({ compact = false }: { compact?: boolean }) {
  const { t } = useLang();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(iso(7));
  const [checkOut, setCheckOut] = useState(iso(10));
  const [guests, setGuests] = useState(2);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(`/accommodations?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`); }}
      className={`glass-dark grid w-full grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end ${
        compact ? "" : "md:p-6"
      }`}
    >
      <label className="block">
        <span className="widget-label">{t("widget.checkin")}</span>
        <div className="widget-field">
          <Calendar size={15} strokeWidth={1.4} className="text-gold" />
          <input type="date" required min={iso(0)} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="widget-input" />
        </div>
      </label>
      <label className="block">
        <span className="widget-label">{t("widget.checkout")}</span>
        <div className="widget-field">
          <Calendar size={15} strokeWidth={1.4} className="text-gold" />
          <input type="date" required min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="widget-input" />
        </div>
      </label>
      <div>
        <span className="widget-label">{t("widget.guests")}</span>
        <div className="widget-field justify-between">
          <Users size={15} strokeWidth={1.4} className="text-gold" />
          <div className="ml-auto flex items-center gap-3">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="stepper"><Minus size={12} /></button>
            <span className="text-sm text-ivory">{guests}</span>
            <button type="button" onClick={() => setGuests((g) => Math.min(12, g + 1))} className="stepper"><Plus size={12} /></button>
          </div>
        </div>
      </div>
      <button type="submit" className="btn-gold h-[46px] whitespace-nowrap">
        {t("widget.search")}
      </button>
    </form>
  );
}

/* ------------------------------ Weather widget ------------------------------ */

type Weather = { temp: number; wind: number; humidity: number; code: number; condition: string };

export function WeatherWidget({ dark = true }: { dark?: boolean }) {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    fetch("/api/weather").then((r) => r.json()).then(setW).catch(() => {});
  }, []);
  const base = dark ? "text-ivory" : "text-ink";
  const sub = dark ? "text-ivory/60" : "text-ink/60";
  return (
    <div className={`flex items-center gap-6 ${base}`}>
      <div className="flex items-center gap-3">
        {(w?.code ?? 1) <= 1 ? <Sun size={34} strokeWidth={1} className="text-gold" /> : <CloudSun size={34} strokeWidth={1} className="text-gold" />}
        <div>
          <div className="font-display text-4xl leading-none">{w ? Math.round(w.temp) : "—"}°</div>
          <div className={`mt-1 text-[10px] tracking-[0.25em] uppercase ${sub}`}>{w?.condition ?? "Masscorn Bay"}</div>
        </div>
      </div>
      <div className={`hidden gap-5 border-l pl-6 text-xs sm:flex ${dark ? "border-ivory/15" : "border-ink/15"}`}>
        <span className="flex items-center gap-1.5"><Wind size={13} className="text-gold" />{w ? Math.round(w.wind) : "—"} km/h</span>
        <span className="flex items-center gap-1.5"><Droplets size={13} className="text-gold" />{w ? Math.round(w.humidity) : "—"}%</span>
      </div>
    </div>
  );
}

/* ------------------------------ Testimonials -------------------------------- */

export type ReviewLite = { name: string; rating: number; title: string | null; comment: string; tier?: string };

export function Testimonials({ reviews }: { reviews: ReviewLite[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!reviews.length) return;
    const id = setInterval(() => setI((v) => (v + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [reviews.length]);
  if (!reviews.length) return null;
  const r = reviews[i];
  return (
    <div className="relative mx-auto max-w-3xl text-center">
      <Quote size={40} strokeWidth={0.8} className="mx-auto text-gold/60" />
      <div className="mt-8 min-h-[190px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-display text-2xl leading-relaxed text-ivory/90 md:text-[28px]">“{r.comment}”</p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Stars value={r.rating} />
            </div>
            <div className="mt-3 text-[11px] tracking-[0.3em] uppercase text-gold">{r.name}</div>
            {r.title && <div className="mt-1 text-xs text-ivory/40">{r.title}</div>}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {reviews.map((_, d) => (
          <button
            key={d}
            onClick={() => setI(d)}
            aria-label={`Review ${d + 1}`}
            className={`h-1 rounded-full transition-all ${d === i ? "w-8 bg-gold" : "w-2 bg-ivory/25"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Common forms ------------------------------- */

export type SessionLite = { name: string; email: string; role: string; loyaltyTier: string } | null;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

function SignInGate({ action }: { action: string }) {
  const router = useRouter();
  return (
    <div className="glass-light flex flex-col items-center gap-4 p-10 text-center">
      <Sparkles className="text-gold" size={22} strokeWidth={1.2} />
      <p className="text-sm text-ink/70">Please sign in to {action}. Your account unlocks live availability, member rates and one-tap checkout.</p>
      <button onClick={() => router.push("/auth")} className="btn-ink">Sign in / Create account</button>
    </div>
  );
}

export function ReservationForm({ restaurants, user }: {
  restaurants: { id: number; name: string }[]; user: SessionLite;
}) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? 0);
  const [date, setDate] = useState(iso(1));
  const [time, setTime] = useState("19:30");
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState("");
  const [specialMeals, setSpecialMeals] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; msg?: string }>({ kind: "idle" });

  if (!user) return <SignInGate action="reserve a table" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/dining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, date, time, guests, occasion, specialMeals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reservation failed");
      setState({ kind: "done", msg: data.message });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  if (state.kind === "done")
    return (
      <div className="glass-light p-10 text-center">
        <Check className="mx-auto text-gold" size={30} strokeWidth={1.2} />
        <p className="mt-4 font-display text-2xl text-ink">Your table awaits</p>
        <p className="mt-2 text-sm text-ink/60">{state.msg}</p>
        <button onClick={() => setState({ kind: "idle" })} className="btn-ink mt-6">Make another reservation</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="glass-light grid gap-5 p-7 md:grid-cols-2">
      <Field label="Restaurant">
        <select value={restaurantId} onChange={(e) => setRestaurantId(Number(e.target.value))} className="form-input">
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" min={iso(0)} value={date} onChange={(e) => setDate(e.target.value)} className="form-input" required />
      </Field>
      <Field label="Time">
        <select value={time} onChange={(e) => setTime(e.target.value)} className="form-input">
          {["12:00", "12:30", "13:00", "14:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Guests">
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="form-input">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => <option key={g} value={g}>{g} guests</option>)}
        </select>
      </Field>
      <Field label="Occasion (optional)">
        <input value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Anniversary, birthday…" className="form-input" />
      </Field>
      <Field label="Dietary requests">
        <input value={specialMeals} onChange={(e) => setSpecialMeals(e.target.value)} placeholder="Vegan tasting menu, allergies…" className="form-input" />
      </Field>
      {state.kind === "error" && <p className="text-sm text-red-500 md:col-span-2">{state.msg}</p>}
      <button disabled={state.kind === "busy"} className="btn-ink md:col-span-2 h-12">
        {state.kind === "busy" ? <Loader2 className="animate-spin" size={16} /> : "Confirm reservation"}
      </button>
    </form>
  );
}

export function SpaForm({ services, user }: {
  services: { id: number; name: string; durationMinutes: number; price: string }[]; user: SessionLite;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0);
  const svc = services.find((s) => s.id === serviceId) ?? services[0];
  const [date, setDate] = useState(iso(2));
  const [time, setTime] = useState("10:00");
  const [therapist, setTherapist] = useState("No preference");
  const [guests, setGuests] = useState(1);
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; msg?: string }>({ kind: "idle" });

  if (!user) return <SignInGate action="book a ritual" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/spa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, date, time, therapist, guests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      setState({ kind: "done", msg: data.message });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  if (state.kind === "done")
    return (
      <div className="glass-light p-10 text-center">
        <Check className="mx-auto text-gold" size={30} strokeWidth={1.2} />
        <p className="mt-4 font-display text-2xl text-ink">A moment of stillness, reserved</p>
        <p className="mt-2 text-sm text-ink/60">{state.msg}</p>
        <button onClick={() => setState({ kind: "idle" })} className="btn-ink mt-6">Book another ritual</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="glass-light grid gap-5 p-7 md:grid-cols-2">
      <Field label="Treatment">
        <select value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))} className="form-input">
          {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.durationMinutes} min · ${s.price}</option>)}
        </select>
      </Field>
      <Field label="Therapist">
        <select value={therapist} onChange={(e) => setTherapist(e.target.value)} className="form-input">
          {["No preference", "Amara K.", "Yusuf M.", "Leila N.", "Sofia D."].map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" min={iso(0)} value={date} onChange={(e) => setDate(e.target.value)} className="form-input" required />
      </Field>
      <Field label="Time">
        <select value={time} onChange={(e) => setTime(e.target.value)} className="form-input">
          {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Guests">
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="form-input">
          {[1, 2, 3, 4].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
      <div className="flex flex-col justify-end">
        <div className="text-sm text-ink/70">
          Total <span className="font-display text-2xl text-ink">${svc ? (Number(svc.price) * guests).toLocaleString() : 0}</span>
          <span className="ml-2 text-xs text-gold">Charged to your suite or paid online</span>
        </div>
      </div>
      {state.kind === "error" && <p className="text-sm text-red-500 md:col-span-2">{state.msg}</p>}
      <button disabled={state.kind === "busy"} className="btn-ink md:col-span-2 h-12">
        {state.kind === "busy" ? <Loader2 className="animate-spin" size={16} /> : "Reserve & pay"}
      </button>
    </form>
  );
}

export function InquiryForm({ defaultType = "wedding", user }: { defaultType?: string; user: SessionLite }) {
  const [eventType, setEventType] = useState(defaultType);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: "", preferredDate: "", guests: 80, budget: "", message: "" });
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; msg?: string }>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventType, preferredDate: form.preferredDate || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inquiry failed");
      setState({ kind: "done", msg: data.message });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  if (state.kind === "done")
    return (
      <div className="glass-light p-10 text-center">
        <Check className="mx-auto text-gold" size={30} strokeWidth={1.2} />
        <p className="mt-4 font-display text-2xl text-ink">Inquiry received</p>
        <p className="mt-2 text-sm text-ink/60">{state.msg}</p>
      </div>
    );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={submit} className="glass-light grid gap-5 p-7 md:grid-cols-2">
      <Field label="Occasion">
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="form-input">
          <option value="wedding">Wedding</option>
          <option value="conference">Conference / Meeting</option>
          <option value="corporate_retreat">Corporate Retreat</option>
          <option value="birthday">Birthday Celebration</option>
          <option value="beach_party">Beach Party</option>
        </select>
      </Field>
      <Field label="Preferred date">
        <input type="date" min={iso(0)} value={form.preferredDate} onChange={set("preferredDate")} className="form-input" />
      </Field>
      <Field label="Full name">
        <input required value={form.name} onChange={set("name")} className="form-input" />
      </Field>
      <Field label="Email">
        <input required type="email" value={form.email} onChange={set("email")} className="form-input" />
      </Field>
      <Field label="Phone / WhatsApp">
        <input value={form.phone} onChange={set("phone")} className="form-input" />
      </Field>
      <Field label="Guests">
        <input type="number" min={2} max={2000} value={form.guests} onChange={set("guests")} className="form-input" />
      </Field>
      <Field label="Indicative budget">
        <input value={form.budget} onChange={set("budget")} placeholder="e.g. $25,000" className="form-input" />
      </Field>
      <Field label="Tell us about your vision">
        <textarea rows={3} value={form.message} onChange={set("message")} className="form-input resize-none" />
      </Field>
      {state.kind === "error" && <p className="text-sm text-red-500 md:col-span-2">{state.msg}</p>}
      <button disabled={state.kind === "busy"} className="btn-ink md:col-span-2 h-12">
        {state.kind === "busy" ? <Loader2 className="animate-spin" size={16} /> : "Send inquiry — our planners reply within 24h"}
      </button>
    </form>
  );
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [state, setState] = useState<{ kind: "idle" | "busy" | "error"; msg?: string }>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Authentication failed");
      router.refresh();
      router.push(data.user?.role === "admin" || data.user?.role === "staff" ? "/admin" : "/portal");
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="glass-dark w-full max-w-md p-8">
      <div className="flex border-b border-ivory/15">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 pb-3 text-[11px] tracking-[0.3em] uppercase transition-colors ${
              mode === m ? "border-b border-gold text-gold" : "text-ivory/50 hover:text-ivory"
            }`}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-7 space-y-5">
        {mode === "register" && (
          <>
            <label className="block">
              <span className="widget-label">Full name</span>
              <input required value={form.name} onChange={set("name")} className="form-input-dark" placeholder="Amara Masscorn" />
            </label>
            <label className="block">
              <span className="widget-label">Phone (for SMS updates)</span>
              <input value={form.phone} onChange={set("phone")} className="form-input-dark" placeholder="+255 7xx xxx xxx" />
            </label>
          </>
        )}
        <label className="block">
          <span className="widget-label">Email</span>
          <input required type="email" value={form.email} onChange={set("email")} className="form-input-dark" placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="widget-label">Password</span>
          <input required minLength={8} type="password" value={form.password} onChange={set("password")} className="form-input-dark" placeholder="••••••••" />
        </label>
        {state.kind === "error" && <p className="text-sm text-red-400">{state.msg}</p>}
        <button disabled={state.kind === "busy"} className="btn-gold h-12 w-full">
          {state.kind === "busy" ? <Loader2 className="animate-spin" size={16} /> : mode === "login" ? "Sign in" : "Join Paradise Elite Club"}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-ivory/40">
          Membership is instant — Silver tier at enrolment, 5% member rate on every stay.
        </p>
      </form>
    </div>
  );
}

/* ------------------------------ Room booking -------------------------------- */

type Availability = {
  available: number;
  roomsTotal: number;
  nights: number;
  subtotal: number;
  loyaltyOff: number;
  loyaltyPct: number;
  couponOff: number;
  couponPct: number;
  total: number;
  seasonal: boolean;
};

export function BookingRoomPanel({
  room, user, initial,
}: {
  room: { id: number; slug: string; name: string; basePrice: string; capacity: number };
  user: SessionLite;
  initial?: { checkIn?: string; checkOut?: string; guests?: number };
}) {
  const [checkIn, setCheckIn] = useState(initial?.checkIn || iso(7));
  const [checkOut, setCheckOut] = useState(initial?.checkOut || iso(10));
  const [guests, setGuests] = useState(initial?.guests ?? 2);
  const [coupon, setCoupon] = useState("");
  const [method, setMethod] = useState("card");
  const [pickup, setPickup] = useState(false);
  const [requests, setRequests] = useState("");
  const [av, setAv] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed] = useState<{ reference: string; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/rooms?slug=${room.slug}&checkIn=${checkIn}&checkOut=${checkOut}&coupon=${encodeURIComponent(coupon)}&guests=${guests}`)
      .then((r) => r.json())
      .then((d) => { if (alive) { setAv(d); setLoading(false); } })
      .catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [room.slug, checkIn, checkOut, coupon, guests]);

  const book = async () => {
    if (!user) { router.push("/auth"); return; }
    setLoading(true);
    setError(null);
    try {
      // Initialize checkout session via clean API
      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: room.slug, checkIn, checkOut, guests, couponCode: coupon,
          specialRequests: requests, airportPickup: pickup,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      if (data.data?.paymentLink) {
        // Redirect to Flutterwave hosted checkout
        window.location.href = data.data.paymentLink;
        return; // Don't setLoading(false) — page is navigating away
      } else if (data.data?.flutterwavePayload) {
        // Fallback: if no direct link, client can construct inline payment
        console.log("Flutterwave payload:", data.data.flutterwavePayload);
        throw new Error("Payment link not available. Please try again or contact the resort.");
      } else {
        throw new Error("Unable to create payment session. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setLoading(false);
    }
  };

  if (confirmed)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-dark p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40">
          <Check className="text-gold" size={26} strokeWidth={1.2} />
        </div>
        <h3 className="mt-5 font-display text-3xl text-ivory">Reserved, with pleasure</h3>
        <p className="mt-2 text-sm text-ivory/60">
          Reference <span className="text-gold tracking-widest">{confirmed.reference}</span> · ${confirmed.total.toLocaleString()}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ivory/45">
          Confirmation has been sent by email and SMS. Manage your stay, request airport pickup or download your invoice from your portal.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => router.push("/portal")} className="btn-gold">Open my portal</button>
          <button onClick={() => router.push("/")} className="btn-ghost">Return home</button>
        </div>
      </motion.div>
    );

  // Flutterwave handles method selection on their checkout page
  // This visual selector shows guests what's available
  const methods = [
    { id: "card", label: "Card (Visa/MC)" },
    { id: "mobilemoney", label: "Mobile Money" },
    { id: "banktransfer", label: "Bank Transfer" },
  ];

  return (
    <div className="glass-dark p-7">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-ivory/50">From</span>
          <div className="font-display text-4xl text-ivory">${Number(room.basePrice).toLocaleString()}</div>
          <span className="text-xs text-ivory/45">per night · seasonal rates apply</span>
        </div>
        <Heart className="text-gold" size={20} strokeWidth={1.2} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <label>
          <span className="widget-label">Check-in</span>
          <input type="date" min={iso(0)} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="form-input-dark" />
        </label>
        <label>
          <span className="widget-label">Check-out</span>
          <input type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="form-input-dark" />
        </label>
      </div>

      <div className="mt-3">
        <span className="widget-label">Guests · up to {room.capacity}</span>
        <div className="widget-field justify-between">
          <Users size={15} strokeWidth={1.4} className="text-gold" />
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="stepper"><Minus size={12} /></button>
            <span className="text-sm text-ivory">{guests}</span>
            <button onClick={() => setGuests((g) => Math.min(room.capacity, g + 1))} className="stepper"><Plus size={12} /></button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <span className="widget-label">Coupon code</span>
        <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="PARADISE10" className="form-input-dark" />
      </div>

      <div className="mt-4 border-t border-ivory/10 pt-4 text-sm">
        {loading && !av ? (
          <div className="flex items-center gap-2 text-ivory/50 text-xs"><Loader2 size={13} className="animate-spin" /> Checking availability…</div>
        ) : av && av.nights > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-ivory/70"><span>{av.nights} nights {av.seasonal && <span className="text-gold text-xs">(peak season)</span>}</span><span>${av.subtotal.toLocaleString()}</span></div>
            {av.loyaltyOff > 0 && <div className="flex justify-between text-gold/90"><span>Paradise Elite {av.loyaltyPct}%</span><span>−${av.loyaltyOff.toLocaleString()}</span></div>}
            {av.couponOff > 0 && <div className="flex justify-between text-gold/90"><span>Coupon {av.couponPct}%</span><span>−${av.couponOff.toLocaleString()}</span></div>}
            <div className="flex justify-between border-t border-ivory/10 pt-2 text-ivory"><span className="tracking-[0.2em] uppercase text-xs">Total</span><span className="font-display text-2xl">${av.total.toLocaleString()}</span></div>
            <div className={`text-xs ${av.available === 0 ? "text-red-400" : "text-emerald-400"}`}>
              {av.available === 0 ? "Fully committed for these dates" : `${av.available} of ${av.roomsTotal} residences available`}
            </div>
          </div>
        ) : (
          <p className="text-xs text-ivory/50">Select dates to preview member pricing.</p>
        )}
      </div>

      <div className="mt-4">
        <span className="widget-label">Payment method</span>
        <div className="grid grid-cols-3 gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`rounded-lg border px-2 py-2.5 text-[10px] tracking-wide transition-colors ${
                method === m.id ? "border-gold bg-gold/10 text-gold" : "border-ivory/15 text-ivory/60 hover:border-ivory/40"
              }`}
            >
              <CreditCard size={13} className="mx-auto mb-1" strokeWidth={1.2} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 flex items-center gap-3 text-xs text-ivory/60">
        <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className="accent-[#c6a15b]" />
        Arrange complimentary airport pickup (Paradise Elite)
      </label>

      <textarea
        value={requests}
        onChange={(e) => setRequests(e.target.value)}
        placeholder="Special requests — ocean-facing, celebration setup, dietary notes…"
        className="form-input-dark mt-3 resize-none"
        rows={2}
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        onClick={book}
        disabled={loading || (av ? av.available === 0 || av.nights === 0 : false)}
        className="btn-gold mt-5 h-12 w-full disabled:opacity-40"
      >
        {loading ? <><Loader2 className="animate-spin" size={16} /> Redirecting to Flutterwave…</> : user ? "Reserve & pay via Flutterwave" : "Sign in to reserve"}
      </button>
      <p className="mt-3 text-center text-[10px] tracking-wide text-ivory/35">
        Secure payment via Flutterwave · Free cancellation up to 14 days before arrival
      </p>
    </div>
  );
}

/* ------------------------------ Reviews form -------------------------------- */

export function ReviewComposer({ user }: { user: SessionLite }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; msg?: string }>({ kind: "idle" });

  if (!user) return <SignInGate action="share your experience" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setState({ kind: "done" });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  if (state.kind === "done")
    return (
      <div className="glass-light p-8 text-center">
        <Check className="mx-auto text-gold" size={26} strokeWidth={1.2} />
        <p className="mt-3 text-sm text-ink/70">Thank you — your words have been received and will appear once curated by our team.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="glass-light space-y-4 p-7">
      <div className="flex items-center justify-between">
        <span className="form-label !mb-0">Your rating</span>
        <Stars value={rating} onChange={setRating} size={20} />
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — e.g. A slice of heaven" className="form-input" />
      <textarea required rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share the moments that stayed with you…" className="form-input resize-none" />
      {state.kind === "error" && <p className="text-sm text-red-500">{state.msg}</p>}
      <button disabled={state.kind === "busy"} className="btn-ink h-11 w-full">
        {state.kind === "busy" ? <Loader2 className="animate-spin" size={15} /> : "Submit review"}
      </button>
    </form>
  );
}

/* --------------------------------- Carousel --------------------------------- */

export function ImageCarousel({ images, aspect = "aspect-[16/10]" }: { images: string[]; aspect?: string }) {
  const [i, setI] = useState(0);
  return (
    <div className={`relative overflow-hidden ${aspect}`}>
      <AnimatePresence mode="popLayout">
        <motion.img
          key={i}
          src={images[i]}
          alt="Resort gallery"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button onClick={() => setI((v) => (v - 1 + images.length) % images.length)} className="carousel-btn" aria-label="Previous"><ChevronLeft size={16} /></button>
        <button onClick={() => setI((v) => (v + 1) % images.length)} className="carousel-btn" aria-label="Next"><ChevronRight size={16} /></button>
      </div>
      <div className="absolute bottom-5 left-5 text-[10px] tracking-[0.3em] text-ivory/80">
        {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </div>
    </div>
  );
}

/* -------------------------- Virtual tour (panorama) -------------------------- */

export function VirtualTour() {
  const [x, setX] = useState(50);
  const dragging = useRef(false);
  return (
    <div
      className="relative h-[420px] cursor-grab overflow-hidden active:cursor-grabbing"
      onPointerDown={() => (dragging.current = true)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        setX((v) => Math.min(100, Math.max(0, v - e.movementX * 0.08)));
      }}
    >
      <img
        src="/images/aerial.jpg"
        alt="360 virtual tour of Masscorn Paradise"
        draggable={false}
        className="h-full w-[220%] max-w-none object-cover transition-none"
        style={{ transform: `translateX(-${x * 0.54}%)` }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-ink/70 to-transparent pb-6 pt-16">
        <span className="text-[10px] tracking-[0.4em] uppercase text-gold">360° Virtual Tour</span>
        <span className="text-xs text-ivory/70">Drag to explore Masscorn Bay</span>
      </div>
    </div>
  );
}
