"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, Globe, User, LogOut, Sparkles, Send, Loader2, MapPin, Phone, Mail,
  AtSign, Camera, Clapperboard, ChevronDown, CreditCard,
} from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";
import { LogoMark } from "@/components/logo";

type ChromeUser = { name: string; role: string } | null;

const NAV = [
  { href: "/accommodations", key: "nav.accommodations" },
  { href: "/experiences", key: "nav.experiences" },
  { href: "/dining", key: "nav.dining" },
  { href: "/spa", key: "nav.spa" },
  { href: "/weddings", key: "nav.weddings" },
  { href: "/events", key: "nav.events" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <LogoMark className={`shrink-0 transition-all duration-500 ${compact ? "h-12 w-[3.15rem]" : "h-16 w-[4.2rem]"}`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display tracking-[0.24em] text-ivory ${compact ? "text-lg" : "text-xl"}`}>
          MASSCORN
        </span>
        <span className="mt-1 text-[9px] tracking-[0.42em] text-gold/90 group-hover:text-gold transition-colors">
          PARADISE BEACH RESORT
        </span>
      </span>
    </Link>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const opts: { v: Lang; label: string }[] = [
    { v: "en", label: "English" },
    { v: "fr", label: "Français" },
    { v: "ar", label: "العربية" },
  ];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-ivory/80 hover:text-gold transition-colors"
        aria-label="Language"
      >
        <Globe size={14} strokeWidth={1.5} />
        {lang.toUpperCase()}
        <ChevronDown size={12} strokeWidth={1.5} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 top-7 z-50 glass-dark py-2 min-w-[140px]"
          >
            {opts.map((o) => (
              <button
                key={o.v}
                onClick={() => { setLang(o.v); setOpen(false); }}
                className={`block w-full px-4 py-2 text-left text-xs tracking-widest hover:text-gold transition-colors ${
                  lang === o.v ? "text-gold" : "text-ivory/75"
                }`}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header({ user }: { user: ChromeUser }) {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [menuOpen]);

  const signOut = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.refresh();
    router.push("/");
  };

  const darkBackdrop = scrolled || menuOpen;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          darkBackdrop ? "glass-dark shadow-[0_10px_60px_-20px_rgba(0,0,0,0.7)]" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
          <Wordmark compact={scrolled} />

          <nav className="hidden items-center gap-6 xl:flex">
            {NAV.slice(0, 8).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-[11px] tracking-[0.22em] uppercase transition-colors hover:text-gold ${
                  pathname?.startsWith(n.href) ? "text-gold" : "text-ivory/75"
                }`}
              >
                {t(n.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 xl:flex">
            <LangToggle />
            {user ? (
              <div className="flex items-center gap-5">
                <Link
                  href={user.role === "admin" || user.role === "staff" ? "/admin" : "/portal"}
                  className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-ivory/80 hover:text-gold transition-colors"
                >
                  <User size={14} strokeWidth={1.5} />
                  {user.role === "admin" || user.role === "staff" ? t("nav.admin") : t("nav.portal")}
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-ivory/60 hover:text-gold transition-colors"
                >
                  <LogOut size={13} strokeWidth={1.5} /> {t("nav.signout")}
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-ivory/80 hover:text-gold transition-colors"
              >
                <User size={14} strokeWidth={1.5} /> {t("nav.signin")}
              </Link>
            )}
            <Link href="/accommodations" className="btn-gold">
              {t("cta.book")}
            </Link>
          </div>

          <button
            className="text-ivory xl:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} strokeWidth={1.2} /> : <Menu size={24} strokeWidth={1.2} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 max-h-screen overflow-y-auto bg-ink/95 backdrop-blur-xl xl:hidden"
          >
            <div className="relative z-10 flex min-h-screen w-full flex-col justify-start gap-6 px-8 pb-12 pt-32 sm:px-10">
              {/* Wordmark header in overlay */}
              <div className="mb-4 flex items-center gap-3 border-b border-ivory/10 pb-6">
                <LogoMark className="h-12 w-[3.15rem] shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-lg tracking-[0.24em] text-ivory">MASSCORN</span>
                  <span className="text-[9px] tracking-[0.42em] text-gold/90">PARADISE BEACH RESORT</span>
                </div>
              </div>
              
              {/* Navigation links with proper spacing */}
              <nav className="flex flex-col gap-4">
                {NAV.map((n, i) => (
                  <motion.div
                    key={n.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link 
                      href={n.href} 
                      className="block py-2 font-display text-2xl leading-relaxed text-ivory transition-colors hover:text-gold sm:text-3xl"
                    >
                      {t(n.key)}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              
              {/* Footer actions with comfortable bottom padding */}
              <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-ivory/10 pt-8 pb-4">
                <LangToggle />
                {user ? (
                  <Link href={user.role === "admin" ? "/admin" : "/portal"} className="btn-gold">
                    {user.role === "admin" ? t("nav.admin") : t("nav.portal")}
                  </Link>
                ) : (
                  <Link href="/auth" className="btn-gold">{t("nav.signin")}</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* --------------------------------- Footer --------------------------------- */

export function Footer() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto max-w-[1500px] px-6 pb-10 pt-24 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-4">
              <LogoMark className="h-20 w-[5.3rem] shrink-0" />
              <div>
                <div className="font-display text-3xl tracking-[0.18em]">MASSCORN</div>
                <div className="mt-1 text-[10px] tracking-[0.4em] text-gold">PARADISE BEACH RESORT</div>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/60">{t("footer.tagline")}. 2.4 km of private ivory sand, six signature villas and a devotion to quiet perfection.</p>
            <div className="mt-6 flex gap-4 text-ivory/60">
              <a href="#" aria-label="Social" className="hover:text-gold transition-colors"><AtSign size={17} strokeWidth={1.4} /></a>
              <a href="#" aria-label="Photo journal" className="hover:text-gold transition-colors"><Camera size={17} strokeWidth={1.4} /></a>
              <a href="#" aria-label="Film" className="hover:text-gold transition-colors"><Clapperboard size={17} strokeWidth={1.4} /></a>
            </div>
          </div>

          <div>
            <div className="footer-label">Resort</div>
            <ul className="mt-5 space-y-3 text-sm text-ivory/65">
              <li><Link href="/accommodations" className="hover:text-gold transition-colors">Accommodations</Link></li>
              <li><Link href="/dining" className="hover:text-gold transition-colors">Restaurants & Bars</Link></li>
              <li><Link href="/spa" className="hover:text-gold transition-colors">Spa & Wellness</Link></li>
              <li><Link href="/experiences" className="hover:text-gold transition-colors">Experiences</Link></li>
              <li><Link href="/gallery" className="hover:text-gold transition-colors">Gallery & Virtual Tour</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-label">Occasions</div>
            <ul className="mt-5 space-y-3 text-sm text-ivory/65">
              <li><Link href="/weddings" className="hover:text-gold transition-colors">Weddings</Link></li>
              <li><Link href="/events" className="hover:text-gold transition-colors">Conferences & Events</Link></li>
              <li><Link href="/portal" className="hover:text-gold transition-colors">Paradise Elite Club</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-label">Stay in touch</div>
            <ul className="mt-5 space-y-3 text-sm text-ivory/65">
              <li className="flex items-start gap-2.5"><MapPin size={15} className="mt-0.5 text-gold/80" strokeWidth={1.4} />Masscorn Bay, Paje Coast, Zanzibar Archipelago</li>
              <li className="flex items-center gap-2.5"><Phone size={15} className="text-gold/80" strokeWidth={1.4} />+255 774 000 100</li>
              <li className="flex items-center gap-2.5"><Mail size={15} className="text-gold/80" strokeWidth={1.4} />reservations@masscorn.com</li>
            </ul>
            <form
              className="mt-6"
              onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
            >
              <div className="flex border-b border-ivory/25 pb-2 focus-within:border-gold transition-colors">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
                />
                <button className="text-[11px] tracking-[0.25em] uppercase text-gold hover:text-ivory transition-colors">
                  {subscribed ? "Merci ✓" : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-[11px] tracking-[0.18em] uppercase text-ivory/40 md:flex-row">
          <span>© {new Date().getFullYear()} Masscorn Paradise Beach Resort</span>
          <span className="flex items-center gap-2">
            <CreditCard size={13} strokeWidth={1.4} /> Flutterwave · Visa · Mastercard · Mobile Money · Bank Transfer
          </span>
          <span>English · Français · العربية</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------- AI Concierge ------------------------------- */

type Msg = { role: "guest" | "concierge"; text: string };

export function ConciergeChat() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ role: "concierge", text: t("concierge.greeting") }]);
  }, [open, msgs.length, t]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "guest", text: content }]);
    setBusy(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "concierge", text: data.reply ?? "Allow me a moment…" }]);
    } catch {
      setMsgs((m) => [...m, { role: "concierge", text: "Our concierge desk is momentarily unreachable. Please call +255 774 000 100." }]);
    } finally {
      setBusy(false);
    }
  };

  const chips = ["Available rooms this weekend", "Dining recommendations", "Spa treatments", "What is the weather?", "Local attractions"];

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 18 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="AI Concierge"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-[0_12px_40px_-8px_rgba(198,161,91,0.7)] hover:scale-105 transition-transform"
      >
        {open ? <X size={22} strokeWidth={1.5} /> : <Sparkles size={22} strokeWidth={1.5} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl glass-dark"
          >
            <div className="border-b border-ivory/10 px-5 py-4">
              <div className="font-display text-lg text-ivory">{t("concierge.title")}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-gold/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Always at your service
              </div>
            </div>

            <div ref={boxRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "guest" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      m.role === "guest"
                        ? "bg-gold/90 text-ink rounded-br-sm"
                        : "bg-ivory/10 text-ivory/90 rounded-bl-sm border border-ivory/10"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-ivory/50 text-xs">
                  <Loader2 size={13} className="animate-spin" /> Aurelia is composing…
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="rounded-full border border-ivory/15 px-3 py-1 text-[10px] tracking-wide text-ivory/60 hover:border-gold hover:text-gold transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-ivory/10 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("concierge.placeholder")}
                className="w-full bg-transparent px-2 py-1.5 text-sm text-ivory placeholder:text-ivory/35 focus:outline-none"
              />
              <button aria-label="Send" className="text-gold hover:text-ivory transition-colors">
                <Send size={17} strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* --------------------------------- Chrome --------------------------------- */

export default function Chrome({ user, children }: { user: ChromeUser; children: React.ReactNode }) {
  return (
    <>
      <Header user={user} />
      <main>{children}</main>
      <Footer />
      <ConciergeChat />
    </>
  );
}
