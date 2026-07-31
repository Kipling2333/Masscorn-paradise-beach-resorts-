import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BedDouble, Maximize2, Users } from "lucide-react";
import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { asc } from "drizzle-orm";
import { availableRooms, nightsBetween, seasonalMultiplier } from "@/lib/pricing";
import { BookingWidget, Reveal, SectionHeading } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Accommodations — Villas, Suites & Ocean Rooms",
  description: "Six categories of beachfront residences at Masscorn Paradise — from Ocean View Rooms to the Presidential Villa. Check live availability and member rates.",
};

export default async function AccommodationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const checkIn = sp.checkIn && /^\d{4}-\d{2}-\d{2}$/.test(sp.checkIn) ? sp.checkIn : "";
  const checkOut = sp.checkOut && /^\d{4}-\d{2}-\d{2}$/.test(sp.checkOut) ? sp.checkOut : "";
  const hasDates = checkIn && checkOut && nightsBetween(checkIn, checkOut) > 0;

  const types = await db.select().from(roomTypes).orderBy(asc(roomTypes.sortOrder));

  const availability = new Map<number, number>();
  if (hasDates) {
    for (const t of types) {
      availability.set(t.id, await availableRooms(t.id, checkIn as string, checkOut as string));
    }
  }

  const peak = hasDates ? seasonalMultiplier(new Date(checkIn + "T00:00:00Z")) : 1;

  return (
    <div className="bg-ink pb-28">
      {/* hero */}
      <section className="relative flex min-h-[62svh] items-end overflow-hidden">
        <img src="/images/villa.jpg" alt="Beachfront villas at dusk" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-14 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Accommodations</span>
            <h1 className="mt-4 font-display text-6xl font-light text-ivory md:text-8xl">Rooms, Suites <span className="italic">& Villas</span></h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 md:px-10 -mt-2">
        <Reveal>
          <BookingWidget compact />
        </Reveal>
        {hasDates ? (
          <p className="mt-4 text-center text-xs tracking-[0.2em] uppercase text-ivory/50">
            Live availability · {checkIn} → {checkOut} {peak > 1 && <span className="text-gold">· peak-season rates</span>}
          </p>
        ) : (
          <p className="mt-4 text-center text-xs tracking-[0.2em] uppercase text-ivory/50">Select dates to unveil member pricing</p>
        )}
      </section>

      <section className="mx-auto mt-20 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="The Collection" title={<>Choose your <span className="italic text-gold">view of forever</span></>} />
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((r, i) => {
            const avail = hasDates ? availability.get(r.id) ?? 0 : null;
            const nightly = Math.round(Number(r.basePrice) * peak);
            return (
              <Reveal key={r.id} delay={0.06 * (i % 3)}>
                <Link href={`/accommodations/${r.slug}${hasDates ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ""}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={r.image} alt={r.name} className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    {avail !== null && (
                      <span className={`absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-[10px] tracking-[0.2em] uppercase backdrop-blur-md ${
                        avail === 0 ? "bg-red-500/20 text-red-200 border border-red-300/30" : "bg-emerald-400/15 text-emerald-200 border border-emerald-200/30"
                      }`}>
                        {avail === 0 ? "Fully booked" : `${avail} available`}
                      </span>
                    )}
                    <div className="absolute bottom-4 left-5 text-[10px] tracking-[0.3em] uppercase text-gold">{r.tagline}</div>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl text-ivory group-hover:text-gold transition-colors">{r.name}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-ivory/50">
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-gold/80" /> {r.capacity} guests</span>
                        <span className="flex items-center gap-1.5"><Maximize2 size={12} className="text-gold/80" /> {r.sizeSqm} m²</span>
                        <span className="flex items-center gap-1.5"><BedDouble size={12} className="text-gold/80" /> {r.bedType}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/40">From</div>
                      <div className="font-display text-xl text-ivory">${nightly.toLocaleString()}</div>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-gold">
                        Reserve <ArrowRight size={11} />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
