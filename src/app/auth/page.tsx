import type { Metadata } from "next";
import { Gem, ShieldCheck, Sparkles } from "lucide-react";
import { AuthForm, Reveal } from "@/components/widgets";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Sign In — Paradise Elite Club",
  description: "Access your Masscorn Paradise account — bookings, member rates, loyalty points and the Paradise Elite Club.",
};

export default function AuthPage() {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink px-6 py-32">
      <img src="/images/villa.jpg" alt="Villa at dusk" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />

      <div className="relative grid w-full max-w-[1100px] items-center gap-14 lg:grid-cols-2">
        <Reveal className="hidden lg:block">
          <LogoMark className="h-24 w-[6.4rem]" />
          <span className="mt-6 block text-[11px] tracking-[0.4em] uppercase text-gold">Paradise Elite Club</span>
          <h1 className="mt-5 font-display text-6xl font-light leading-[1.05] text-ivory">
            Your key to <span className="italic text-shimmer">the bay</span>
          </h1>
          <div className="mt-10 space-y-5">
            {[
              { icon: Sparkles, t: "Member rates instantly", d: "Silver tier and 5% off from your first stay." },
              { icon: Gem, t: "Points that gild", d: "Earn on every night, dinner and ritual." },
              { icon: ShieldCheck, t: "One-tap everything", d: "Bookings, invoices, pickups and favorites in your portal." },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-4">
                <f.icon size={18} strokeWidth={1.2} className="mt-1 text-gold" />
                <div>
                  <div className="font-display text-xl text-ivory">{f.t}</div>
                  <div className="text-sm text-ivory/55">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15} className="flex justify-center lg:justify-end">
          <AuthForm />
        </Reveal>
      </div>
    </div>
  );
}