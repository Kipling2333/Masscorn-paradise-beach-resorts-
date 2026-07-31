import type { Metadata } from "next";
import { Check, Flower2, Gem, HeartHandshake } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ImageCarousel, InquiryForm, ParallaxImg, Reveal, SectionHeading } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Weddings — Destination Celebrations",
  description: "Three signature venues, a dedicated wedding atelier and the Indian Ocean as witness. Plan your Masscorn Paradise wedding.",
};

const PACKAGES = [
  {
    icon: HeartHandshake, name: "Barefoot Vows", price: "from $9,500",
    d: "An intimate ceremony for two to twenty, toes in the sand.",
    features: ["Beach Pavilion ceremony", "Floral arch & aisle styling", "Champagne & canapés", "Sunset photo session", "Officiant coordination"],
  },
  {
    icon: Flower2, name: "Coral Garden", price: "from $24,000",
    d: "Up to 80 guests among frangipani and candlelit lawns.",
    features: ["Coral Lawn venue buyout", "Five-course banquet", "Live taarab ensemble", "Dedicated wedding atelier", "Two-night villa for the couple"],
  },
  {
    icon: Gem, name: "The Grand Horizon", price: "from $58,000",
    d: "Full-resort magic for up to 200 of your dearest.",
    features: ["Resort partial buyout", "Rooftop reception at Skyline", "Fireworks & dhow arrival", "Three-day celebration program", "Platinum Elite status for the couple"],
  },
];

const VENUES = [
  { img: "/images/wedding.jpg", t: "The Beach Pavilion", c: "Up to 120 guests" },
  { img: "/images/villa.jpg", t: "Coral Lawn", c: "Up to 80 guests" },
  { img: "/images/dining.jpg", t: "Skyline Rooftop", c: "Up to 200 guests" },
  { img: "/images/hero.jpg", t: "The Sandbank", c: "Up to 30 guests" },
];

export default async function WeddingsPage() {
  const user = await getSessionUser();
  return (
    <div className="bg-ink pb-28">
      <section className="relative flex min-h-[72svh] items-end overflow-hidden">
        <ParallaxImg src="/images/wedding.jpg" alt="Beach wedding at golden hour" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Weddings at Masscorn</span>
            <h1 className="mt-4 max-w-3xl font-display text-6xl font-light text-ivory md:text-8xl">
              Vows, with <span className="italic">the ocean as witness</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/70">
              A dedicated atelier of planners, florists, chefs and storytellers — so your only task is to say yes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* packages */}
      <section className="mx-auto mt-24 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="Signature Packages" title={<>Three ways to say <span className="italic text-gold">forever</span></>} />
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.name} delay={0.1 * i}>
              <div className={`glass-dark h-full p-8 ${i === 1 ? "border-gold/50 shadow-[0_30px_80px_-30px_rgba(198,161,91,0.35)]" : ""}`}>
                <p.icon size={22} strokeWidth={1.1} className="text-gold" />
                <div className="mt-5 font-display text-3xl text-ivory">{p.name}</div>
                <div className="mt-1 text-[11px] tracking-[0.3em] uppercase text-gold">{p.price}</div>
                <p className="mt-4 text-sm leading-relaxed text-ivory/60">{p.d}</p>
                <ul className="mt-7 space-y-3 border-t border-ivory/10 pt-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-ivory/70">
                      <Check size={14} className="mt-0.5 text-gold" strokeWidth={1.5} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* venues gallery */}
      <section className="mx-auto mt-28 max-w-[1500px] px-6 md:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-ivory/10 bg-ivory/5 p-2">
              <ImageCarousel images={VENUES.map((v) => v.img)} aspect="aspect-[4/3] rounded-xl" />
            </div>
          </Reveal>
          <div>
            <SectionHeading align="left" dark eyebrow="Venues" title={<>Four settings, <span className="italic text-gold">one horizon</span></>} />
            <div className="mt-10 space-y-5">
              {VENUES.map((v, i) => (
                <Reveal key={v.t} delay={0.07 * i}>
                  <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                    <span className="font-display text-xl text-ivory">{v.t}</span>
                    <span className="text-xs tracking-[0.2em] uppercase text-ivory/45">{v.c}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* inquiry */}
      <section className="mx-auto mt-28 max-w-[1100px] px-6 md:px-10">
        <SectionHeading
          dark
          eyebrow="Begin the journey"
          title={<>Tell us your <span className="italic text-gold">love story</span></>}
          sub="Share your date, party and dreams — our wedding atelier replies within 24 hours with a bespoke proposal."
        />
        <div className="mt-12">
          <Reveal>
            <InquiryForm
              defaultType="wedding"
              user={user ? { name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier } : null}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
