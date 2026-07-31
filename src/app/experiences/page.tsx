import type { Metadata } from "next";
import Link from "next/link";
import {
  Anchor, Compass, Fish, Flag, Kayak, Sailboat, Shell, Sun, Sunrise, Sunset, Waves, ArrowRight,
} from "lucide-react";
import { ParallaxImg, Reveal, SectionHeading, WeatherWidget } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Experiences — Ocean & Island Adventures",
  description: "Jet ski, kayaking, snorkelling, dhow sunset cruises, fishing charters and cultural tours — curated by the Masscorn experiences team.",
};

const ACTIVITIES = [
  { icon: Waves, t: "Jet Ski Safari", d: "Carve the lagoon on a guided 45-minute run past the northern sandbanks.", p: "$95", img: "/images/hero.jpg", tag: "Adrenaline" },
  { icon: Kayak, t: "Mangrove Kayaking", d: "Silent channels, kingfishers and the hush of the mangrove cathedral.", p: "$35", img: "/images/aerial.jpg", tag: "Nature" },
  { icon: Shell, t: "House Reef Snorkelling", d: "Turtles, rays and 400 species of fish over our protected coral gardens.", p: "$60", img: "/images/cruise.jpg", tag: "Ocean" },
  { icon: Sailboat, t: "Traditional Boat Tour", d: "Island-hop aboard a hand-built ngalawa with our Swahili crew.", p: "$85", img: "/images/cruise.jpg", tag: "Culture" },
  { icon: Fish, t: "Deep-Sea Fishing Charter", d: "Marlin, sailfish and yellowfin on a fully crewed sport fisher.", p: "$220", img: "/images/hero.jpg", tag: "Adrenaline" },
  { icon: Sunset, t: "Sunset Dhow Cruise", d: "Champagne, taarab music and the sky performing its nightly opera.", p: "$75", img: "/images/cruise.jpg", tag: "Signature" },
  { icon: Flag, t: "Stone Town Cultural Tour", d: "Spice markets, carved doors and 1,000 years of Swahili history.", p: "$50", img: "/images/villa.jpg", tag: "Culture" },
  { icon: Sunrise, t: "Sunrise Beach Yoga", d: "Salutations on the jetty as the lagoon turns to liquid gold.", p: "$45", img: "/images/spa.jpg", tag: "Wellness" },
];

const SEASONS = [
  { icon: Sun, t: "Kaskazi · Dec–Mar", d: "Dry northeast monsoon — calm seas due north, whale sharks on migration." },
  { icon: Compass, t: "Kusi · Jun–Sep", d: "Cool southeast trade winds — kitesurfing season and glassy mornings." },
  { icon: Anchor, t: "Year-round", d: "Water at 26–29°C every month. The reef never sleeps." },
];

export default function ExperiencesPage() {
  return (
    <div className="bg-ink pb-28">
      <section className="relative flex min-h-[68svh] items-end overflow-hidden">
        <ParallaxImg src="/images/cruise.jpg" alt="Sunset dhow cruise" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Experiences</span>
            <h1 className="mt-4 max-w-3xl font-display text-6xl font-light text-ivory md:text-8xl">
              Salt, wind <span className="italic">& wonder</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/70">
              Our experiences atelier curates each day around tide, wind and whim. Reserve through your portal or simply ask Aurelia, our AI concierge.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="glass-dark mt-10 inline-flex p-4">
              <WeatherWidget />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="The Atelier" title={<>Curated days, <span className="italic text-gold">unscripted joy</span></>} />
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITIES.map((a, i) => (
            <Reveal key={a.t} delay={0.06 * (i % 4)}>
              <div className="group relative overflow-hidden rounded-2xl">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={a.img} alt={a.t} className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-ink/40 px-3 py-1 text-[9px] tracking-[0.25em] uppercase text-gold backdrop-blur-md">
                  {a.tag}
                </span>
                <div className="absolute bottom-0 w-full p-5">
                  <a.icon size={18} strokeWidth={1.1} className="text-gold" />
                  <div className="mt-2.5 font-display text-xl leading-tight text-ivory">{a.t}</div>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-ivory/60">{a.d}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-lg text-gold">{a.p}</span>
                    <Link href="/portal" className="flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-ivory/70 hover:text-gold transition-colors">
                      Book <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-[1200px] px-6 md:px-10">
        <SectionHeading dark eyebrow="Reading the seasons" title={<>Two winds, <span className="italic text-gold">one paradise</span></>} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SEASONS.map((s, i) => (
            <Reveal key={s.t} delay={0.1 * i}>
              <div className="glass-dark h-full p-7">
                <s.icon size={20} strokeWidth={1.1} className="text-gold" />
                <div className="mt-4 font-display text-xl text-ivory">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ivory/55">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-16 text-center">
          <Link href="/accommodations" className="btn-gold">Plan your stay <ArrowRight size={14} /></Link>
        </Reveal>
      </section>
    </div>
  );
}
