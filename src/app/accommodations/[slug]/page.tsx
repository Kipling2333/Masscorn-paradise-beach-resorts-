import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath, BedDouble, Check, Coffee, Maximize2, MountainSnow, Users, Waves, Wifi, ConciergeBell,
} from "lucide-react";
import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { asc, eq, ne } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { BookingRoomPanel, ImageCarousel, Reveal, SectionHeading } from "@/components/widgets";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rows = await db.select().from(roomTypes).where(eq(roomTypes.slug, slug)).limit(1);
  const room = rows[0];
  if (!room) return { title: "Residence" };
  return {
    title: `${room.name} — ${room.tagline ?? "Beachfront residence"}`,
    description: room.description.slice(0, 155),
  };
}

const POOL = ["/images/room-ocean.jpg", "/images/villa.jpg", "/images/suite.jpg", "/images/hero.jpg", "/images/aerial.jpg"];

export default async function RoomDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const rows = await db.select().from(roomTypes).where(eq(roomTypes.slug, slug)).limit(1);
  const room = rows[0];
  if (!room) notFound();

  const others = await db.select().from(roomTypes).where(ne(roomTypes.id, room.id)).orderBy(asc(roomTypes.sortOrder)).limit(3);
  const user = await getSessionUser();

  const gallery = [room.image, ...POOL.filter((p) => p !== room.image)].slice(0, 4);
  const amenityIcons = [Wifi, Coffee, Bath, Waves, MountainSnow, ConciergeBell];

  return (
    <div className="bg-ink pb-28">
      {/* hero gallery */}
      <section className="relative pt-24 md:pt-28">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <Reveal>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-ivory/50">
              <Link href="/accommodations" className="hover:text-gold transition-colors">Accommodations</Link>
              <span className="text-gold">·</span>
              <span className="text-gold">{room.name}</span>
            </div>
          </Reveal>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <Reveal>
              <div className="rounded-2xl border border-ivory/10 bg-ivory/5 p-2">
                <ImageCarousel images={gallery} aspect="aspect-[16/10] rounded-xl" />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <BookingRoomPanel
                room={{ id: room.id, slug: room.slug, name: room.name, basePrice: room.basePrice, capacity: room.capacity }}
                user={user ? { name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier } : null}
                initial={{ checkIn: sp.checkIn, checkOut: sp.checkOut, guests: sp.guests ? Number(sp.guests) : undefined }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* story + amenities */}
      <section className="mx-auto mt-20 max-w-[1500px] px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionHeading align="left" dark eyebrow={room.tagline ?? "Residence"} title={room.name} />
            <Reveal>
              <p className="mt-8 text-[15px] leading-[1.9] text-ivory/65">{room.description}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10 grid grid-cols-3 gap-6 border-y border-ivory/10 py-8">
                {[
                  { icon: Users, l: "Sleeps", v: `${room.capacity} guests` },
                  { icon: Maximize2, l: "Space", v: `${room.sizeSqm} m²` },
                  { icon: BedDouble, l: "Bedding", v: room.bedType },
                ].map((f) => (
                  <div key={f.l}>
                    <f.icon size={20} strokeWidth={1.1} className="text-gold" />
                    <div className="mt-3 text-[10px] tracking-[0.3em] uppercase text-ivory/40">{f.l}</div>
                    <div className="mt-1 font-display text-xl text-ivory">{f.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <h3 className="mt-12 text-[11px] tracking-[0.35em] uppercase text-gold">Included with every stay</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {room.amenities.map((a, i) => {
                  const Icon = amenityIcons[i % amenityIcons.length];
                  return (
                    <div key={a} className="flex items-center gap-3 text-sm text-ivory/70">
                      <Icon size={16} strokeWidth={1.2} className="text-gold/80" /> {a}
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 text-sm text-ivory/70">
                  <Check size={16} strokeWidth={1.2} className="text-gold/80" /> Dedicated host, around the clock
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="glass-dark p-8">
              <div className="text-[11px] tracking-[0.35em] uppercase text-gold">A note from your host</div>
              <p className="mt-5 font-display text-2xl leading-relaxed text-ivory/90 italic">
                “Ask for breakfast on the sandbank at low tide — the sea sets our table better than any linen ever could.”
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 font-display text-lg text-gold">A</div>
                <div>
                  <div className="text-sm text-ivory">Amara K.</div>
                  <div className="text-xs text-ivory/45">Head of Guest Experience</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* related */}
      <section className="mx-auto mt-24 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="Continue exploring" title={<>You may also <span className="italic text-gold">adore</span></>} />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {others.map((o, i) => (
            <Reveal key={o.id} delay={0.1 * i}>
              <Link href={`/accommodations/${o.slug}`} className="group block">
                <div className="overflow-hidden rounded-2xl">
                  <img src={o.image} alt={o.name} className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-display text-xl text-ivory group-hover:text-gold transition-colors">{o.name}</div>
                  <div className="text-sm text-ivory/50">from ${Number(o.basePrice).toLocaleString()}</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
