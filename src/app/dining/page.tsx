import type { Metadata } from "next";
import { Clock, Utensils, Wine } from "lucide-react";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { ParallaxImg, Reveal, ReservationForm, SectionHeading } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Dining — Four Restaurants & Bars",
  description: "Beach restaurant, night-fresh seafood, rooftop lounge and pool bar. View menus and reserve your table at Masscorn Paradise.",
};

const IMAGES = ["/images/dining.jpg", "/images/hero.jpg", "/images/suite.jpg", "/images/aerial.jpg"];

export default async function DiningPage() {
  const list = await db.select().from(restaurants);
  const user = await getSessionUser();

  return (
    <div className="bg-ink pb-28">
      <section className="relative flex min-h-[68svh] items-end overflow-hidden">
        <ParallaxImg src="/images/dining.jpg" alt="Beachfront dining at sunset" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Restaurants & Bars</span>
            <h1 className="mt-4 max-w-3xl font-display text-6xl font-light text-ivory md:text-8xl">
              Dinner where <span className="italic">the tide applauds</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/70">
              Four kitchens, one philosophy — the day&apos;s catch, the island&apos;s spice and the theatre of the open flame.
            </p>
          </Reveal>
        </div>
      </section>

      {/* restaurants */}
      <section className="mx-auto mt-20 max-w-[1500px] space-y-24 px-6 md:px-10">
        {list.map((r, i) => (
          <div key={r.id} className={`grid items-center gap-12 lg:grid-cols-2`}>
            <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={IMAGES[i % IMAGES.length]}
                  alt={r.name}
                  className="aspect-[16/11] w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
                />
              </div>
            </Reveal>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <Reveal>
                <div className="flex items-center gap-4">
                  <span className="font-display text-5xl text-gold/40">0{i + 1}</span>
                  <div>
                    <div className="text-[10px] tracking-[0.35em] uppercase text-gold">{r.cuisine}</div>
                    <h2 className="font-display text-4xl text-ivory">{r.name}</h2>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-[1.9] text-ivory/65">{r.description}</p>
                <div className="mt-5 flex items-center gap-6 text-xs text-ivory/50">
                  <span className="flex items-center gap-2"><Clock size={13} className="text-gold" /> {r.hours}</span>
                  <span className="flex items-center gap-2"><Wine size={13} className="text-gold" /> Sommelier on duty</span>
                </div>
              </Reveal>
              {r.menu.length > 0 && (
                <Reveal delay={0.15}>
                  <div className="glass-dark mt-8 p-7">
                    <div className="flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-gold">
                      <Utensils size={13} /> A taste of the menu
                    </div>
                    <div className="mt-5 space-y-5">
                      {r.menu.map((c) => (
                        <div key={c.course}>
                          <div className="text-[10px] tracking-[0.3em] uppercase text-ivory/40">{c.course}</div>
                          <div className="mt-2 space-y-1.5">
                            {c.items.map((it) => (
                              <div key={it.name} className="flex items-baseline justify-between gap-4 text-sm">
                                <span className="text-ivory/80">{it.name}</span>
                                <span className="flex-1 border-b border-dotted border-ivory/20" />
                                <span className="text-gold">${it.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* reservation */}
      <section className="mx-auto mt-28 max-w-[1100px] px-6 md:px-10">
        <SectionHeading
          dark
          eyebrow="Reservations"
          title={<>Your table, <span className="italic text-gold">held to the minute</span></>}
          sub="Choose your kitchen, hour and party size — special menus and dietary journeys are arranged with pleasure. Confirmation arrives by email and SMS."
        />
        <div className="mt-12">
          <Reveal>
            <ReservationForm
              restaurants={list.map((r) => ({ id: r.id, name: r.name }))}
              user={user ? { name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier } : null}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
