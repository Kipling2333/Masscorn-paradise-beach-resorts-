import type { Metadata } from "next";
import { Clock, Leaf, Moon, Sun, Waves } from "lucide-react";
import { db } from "@/db";
import { spaServices } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { ParallaxImg, Reveal, SectionHeading, SpaForm } from "@/components/widgets";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Spa & Wellness — Ocean Rituals",
  description: "Six open-air treatment pavilions above the tidal pools. Massages, facials, wellness packages and sunrise yoga at Masscorn Paradise.",
};

export default async function SpaPage() {
  let services: any[] = [];
  try {
    services = await db.select().from(spaServices);
  } catch (error) {
    console.error("Failed to load spa services:", error);
  }

  const user = await getSessionUser();

  return (
    <div className="bg-ink pb-28">
      <section className="relative flex min-h-[68svh] items-end overflow-hidden">
        <ParallaxImg src="/images/spa.jpg" alt="Oceanfront spa pavilion" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Spa & Wellness</span>
            <h1 className="mt-4 max-w-3xl font-display text-6xl font-light text-ivory md:text-8xl">
              The art of <span className="italic">slowing down</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/70">
              Therapies guided by tide and moon, performed to a soundtrack of the sea itself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* pillars */}
      <section className="mx-auto mt-16 max-w-[1500px] px-6 md:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Waves, t: "Ocean Pharmacy", d: "Mineral-rich sea water, algae and coral salts." },
            { icon: Sun, t: "Circadian Rituals", d: "Treatments timed to sunrise and dusk light." },
            { icon: Leaf, t: "Island Botanicals", d: "Cold-pressed coconut, clove and frangipani." },
            { icon: Moon, t: "Sleep Journeys", d: "Evening ceremonies for the deepest rest." },
          ].map((p, i) => (
            <Reveal key={p.t} delay={0.08 * i}>
              <div className="glass-dark h-full p-6">
                <p.icon size={20} strokeWidth={1.1} className="text-gold" />
                <div className="mt-4 font-display text-xl text-ivory">{p.t}</div>
                <p className="mt-2 text-xs leading-relaxed text-ivory/55">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* treatments */}
      <section className="mx-auto mt-24 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="The Rituals" title={<>Choose your <span className="italic text-gold">ceremony</span></>} />
        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={0.06 * (i % 3)}>
              <div className="group border border-ivory/10 rounded-lg overflow-hidden bg-ink/40 pb-8 flex flex-col h-full shadow-xl">
                {s.imageUrl && (
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image 
                      src={s.imageUrl} 
                      alt={s.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{s.category}</div>
                      <h3 className="mt-2 font-display text-2xl text-ivory group-hover:text-gold transition-colors">{s.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl text-gold">${Number(s.price).toLocaleString()}</div>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-ivory/45">
                        <Clock size={11} /> {s.durationMinutes} min
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/55 flex-grow">{s.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* booking */}
      <section className="mx-auto mt-28 max-w-[1100px] px-6 md:px-10">
        <SectionHeading
          dark
          eyebrow="Reserve"
          title={<>Stillness, <span className="italic text-gold">scheduled</span></>}
          sub="Select your ritual, therapist and hour. Pay online now or charge to your suite — Paradise Elite members save on every treatment."
        />
        <div className="mt-12">
          <Reveal>
            <SpaForm
              services={services.map((s) => ({ id: s.id, name: s.name, durationMinutes: s.durationMinutes, price: s.price }))}
              user={user ? { name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier } : null}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}