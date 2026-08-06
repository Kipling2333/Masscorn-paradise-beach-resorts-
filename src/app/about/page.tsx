import type { Metadata } from "next";
import { Award, Fish, HandHeart, Leaf, Recycle, Sun } from "lucide-react";
import { Counter, ParallaxImg, Reveal, SectionHeading } from "@/components/widgets";

export const metadata: Metadata = {
  title: "About — Our Story, Team & Sustainability",
  description: "The story of Masscorn Paradise Beach Resort — built by island hands, powered by the sun, devoted to reef and community.",
};

const TEAM = [
  { n: "Zahra Masscorn", r: "Founder & Custodian", i: "Z" },
  { n: "Elias Venda", r: "General Manager", i: "E" },
  { n: "Amara Kilele", r: "Head of Guest Experience", i: "A" },
  { n: "Chef Baraka Osei", r: "Culinary Director", i: "B" },
];

const AWARDS = [
  "World's Leading Beach Resort — World Travel Awards 2025",
  "Forbes Travel Guide Five-Star 2024 · 2025",
  "Condé Nast Traveller Gold List 2025",
  "EarthCheck Platinum Certification",
];

const PLEDGES = [
  { icon: Sun, t: "92% solar", d: "Our microgrid draws from 4,100 panels with tidal backup." },
  { icon: Recycle, t: "Zero single-use", d: "Glass bottling plant on-site; no plastic since 2022." },
  { icon: Fish, t: "Reef guardians", d: "2,400 coral fragments planted with village marine crews." },
  { icon: HandHeart, t: "Community first", d: "85% of our team are islanders; the spice farm is village-owned." },
];

export default function AboutPage() {
  return (
    <div className="bg-ink pb-28">
      <section className="relative flex min-h-[70svh] items-end overflow-hidden">
        <ParallaxImg src="https://i.ibb.co/kVz1rP66/hero.jpg" alt="Masscorn Paradise from above" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/60 via-[#1A1A1A]/30 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold font-semibold">Our Story</span>
            <h1 className="mt-4 max-w-3xl font-display text-6xl font-light text-ivory md:text-8xl drop-shadow-md">
              Built by island <span className="italic text-gold">hands & heart</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1100px] px-6 md:px-10">
        <SectionHeading
          dark
          eyebrow="Since 2026"
          title={<>Where Luxury Meets the Ocean <span className="italic text-gold">a bay</span></>}
          sub=""
        />
        <Reveal>
          <div className="mt-10 space-y-6 text-[15px] leading-[1.95] text-[#1A1A1A]/80 font-medium">
            <p>
              At Masscorn Paradise Beach Resort, we believe every journey deserves an extraordinary destination. Nestled along a breathtaking coastline, our resort is designed for travelers seeking elegance, relaxation, and unforgettable experiences in one remarkable place.
              
              <em className="text-gold not-italic font-semibold"> Masscorn</em> — “where the moon combs the water”.
            </p>
            <p>
              Inspired by the beauty of the sea and the warmth of genuine hospitality, Masscorn Paradise Beach Resort blends contemporary luxury with the timeless charm of tropical living. From our beautifully appointed accommodations and world-class dining to our wellness experiences and breathtaking sunsets, every detail has been thoughtfully crafted to create memories that last a lifetime.

              Whether you're celebrating a honeymoon, enjoying a family vacation, hosting a destination wedding, planning a corporate retreat, or simply escaping the pace of everyday life, our dedicated team is committed to delivering exceptional service with warmth, professionalism, and care.

              More than a place to stay, Masscorn Paradise Beach Resort is a destination where comfort meets sophistication, where nature inspires serenity, and where every guest is welcomed like family.
            </p>
          </div>
        </Reveal>
        <div className="mt-16 grid grid-cols-2 gap-8 border-y border-[#1A1A1A]/15 py-10 md:grid-cols-4">
          {[
            { v: 14, s: " yrs", l: "Of quiet welcome" },
            { v: 212, s: "", l: "Island team members" },
            { v: 92, s: "%", l: "Solar powered" },
            { v: 2400, s: "", l: "Corals planted" },
          ].map((s) => (
            <Reveal key={s.l}>
              <div className="text-center">
                <div className="font-display text-5xl text-[#1A1A1A]"><Counter to={s.v} suffix={s.s} /></div>
                <div className="mt-2 text-[10px] tracking-[0.28em] uppercase text-[#333333] font-semibold">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="The Custodians" title={<>Guardians of <span className="italic text-gold">your days</span></>} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <Reveal key={m.n} delay={0.08 * i}>
              <div className="glass-light p-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-[#1A1A1A] font-display text-2xl text-gold">
                  {m.i}
                </div>
                <div className="mt-5 font-display text-xl text-[#1A1A1A]">{m.n}</div>
                <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-[#333333] font-semibold">{m.r}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-[1500px] px-6 md:px-10">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" dark eyebrow="Sustainability" title={<>Luxury that <span className="italic text-gold">gives back</span></>} />
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {PLEDGES.map((p, i) => (
                <Reveal key={p.t} delay={0.07 * i}>
                  <div className="glass-light h-full p-6">
                    <p.icon size={19} strokeWidth={1.1} className="text-gold" />
                    <div className="mt-4 font-display text-xl text-[#1A1A1A]">{p.t}</div>
                    <p className="mt-2 text-xs leading-relaxed text-[#333333]">{p.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading align="left" dark eyebrow="Recognition" title={<>Quietly <span className="italic text-gold">honoured</span></>} />
            <div className="mt-12 space-y-5">
              {AWARDS.map((a, i) => (
                <Reveal key={a} delay={0.07 * i}>
                  <div className="flex items-center gap-4 border-b border-[#1A1A1A]/15 pb-5">
                    <Award size={18} strokeWidth={1.1} className="shrink-0 text-gold" />
                    <span className="text-sm text-[#1A1A1A] font-medium">{a}</span>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={0.3}>
                <div className="flex items-center gap-3 pt-2 text-xs text-[#333333] font-medium">
                  <Leaf size={14} className="text-gold" /> Every award funds one classroom on the island.
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}