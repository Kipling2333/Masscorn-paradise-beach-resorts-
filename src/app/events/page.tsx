import type { Metadata } from "next";
import { CalendarDays, Mic2, Presentation, Users } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { asc, gte } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { InquiryForm, ParallaxImg, Reveal, SectionHeading } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Conferences & Events",
  description: "The Grand Pavilion seats 300 delegates; corporate retreats, beach parties and milestone celebrations at Masscorn Paradise.",
};

const SPACES = [
  { name: "Grand Pavilion", cap: "300 delegates", size: "480 m²", note: "Theatre or banquet, 6m ceilings, hybrid broadcast studio" },
  { name: "Boardroom Azur", cap: "18 executives", size: "72 m²", note: "Oceanside boardroom with private terrace" },
  { name: "Skyline Rooftop", cap: "200 reception", size: "360 m²", note: "Sunset receptions and product launches" },
  { name: "Beach Marquee", cap: "400 guests", size: "Open air", note: "Galas, beach parties and festival stages" },
];

export default async function EventsPage() {
  const today = new Date().toISOString().slice(0, 10);
  let upcoming: any[] = [];
  
  try {
    upcoming = await db
      .select()
      .from(events)
      .where(gte(events.eventDate, today))
      .orderBy(asc(events.eventDate))
      .limit(6);
  } catch (err) {
    console.warn("Database offline or table missing, using fallback events data", err);
    upcoming = [
      {
        id: 1,
        title: "Full Moon Beach Gala",
        eventType: "Entertainment",
        venue: "Coral Lawn",
        eventDate: "2026-08-15",
        capacity: 120,
        price: "150.00",
        description: "An evening of live acoustic music, cocktails, and a six-course tasting menu under the full moon.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80",
      },
      {
        id: 2,
        title: "Masterclass Mixology Sunset",
        eventType: "Workshop",
        venue: "Skyline Rooftop",
        eventDate: "2026-08-20",
        capacity: 25,
        price: "75.00",
        description: "Learn to craft island-inspired botanical cocktails with our head mixologist.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80",
      },
    ];
  }

  const user = await getSessionUser();

  return (
    <div className="bg-ink pb-28">
      <section className="relative flex min-h-[68svh] items-end overflow-hidden">
        <ParallaxImg src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80" alt="Oceanfront conference room" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink" />
        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 md:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.4em] uppercase text-gold">Conferences & Events</span>
            <h1 className="mt-4 max-w-3xl font-display text-6xl font-light text-ivory md:text-8xl">
              Work, perfumed <span className="italic">by frangipani</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/70">
              Summits, incentives and celebrations engineered by our events office — with corporate rates and full buyout options.
            </p>
          </Reveal>
        </div>
      </section>

      {/* spaces */}
      <section className="mx-auto mt-24 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="Meeting Spaces" title={<>Rooms with <span className="italic text-gold">a horizon</span></>} />
        <div className="mt-14 overflow-x-auto">
          <Reveal>
            <table className="table-lux w-full min-w-[720px] text-ivory [&_td]:border-ivory/10">
              <thead>
                <tr className="[&_th]:text-ivory/40">
                  <th>Space</th><th>Capacity</th><th>Size</th><th>Signature</th>
                </tr>
              </thead>
              <tbody>
                {SPACES.map((s) => (
                  <tr key={s.name} className="transition-colors hover:bg-ivory/[0.03]">
                    <td className="font-display text-xl text-ivory">{s.name}</td>
                    <td>{s.cap}</td>
                    <td>{s.size}</td>
                    <td className="text-ivory/60">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* upcoming events */}
      <section className="mx-auto mt-24 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="The Calendar" title={<>Upcoming at <span className="italic text-gold">the resort</span></>} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e, i) => (
            <Reveal key={e.id} delay={0.07 * i}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-ivory/10">
                <img src={e.image} alt={e.title} className="aspect-[16/9] w-full object-cover opacity-70 transition-transform duration-[1400ms] group-hover:scale-105" />
                <div className="p-6">
                  <div className="flex items-center justify-between text-[10px] tracking-[0.25em] uppercase">
                    <span className="text-gold">{e.eventType?.replace(/_/g, " ")}</span>
                    <span className="flex items-center gap-1.5 text-ivory/50"><CalendarDays size={12} /> {e.eventDate}</span>
                  </div>
                  <div className="mt-3 font-display text-2xl text-ivory">{e.title}</div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ivory/55">{e.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-ivory/50">
                    <span className="flex items-center gap-1.5"><Users size={12} className="text-gold" /> up to {e.capacity}</span>
                    <span className="text-gold">{Number(e.price) > 0 ? `$${Number(e.price).toLocaleString()} pp` : "By invitation"}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          {upcoming.length === 0 && (
            <p className="text-ivory/50">The calendar is being composed — ask the concierge for private dates.</p>
          )}
        </div>
      </section>

      {/* corporate packages strip */}
      <section className="mx-auto mt-24 max-w-[1500px] px-6 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Presentation, t: "Day Delegate — $95 pp", d: "Meeting space, two coffee rituals, lunch at The Shore and lagoon Wi-Fi." },
            { icon: Mic2, t: "Summit Package — $240 pp", d: "Grand Pavilion, staging, interpretation booths and gala dinner on the sand." },
            { icon: Users, t: "Corporate Retreat", d: "Buyout of 20+ villas with team expeditions, bonfires and awards night." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={0.08 * i}>
              <div className="glass-dark h-full p-7">
                <c.icon size={20} strokeWidth={1.1} className="text-gold" />
                <div className="mt-4 font-display text-xl text-ivory">{c.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ivory/55">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* booking requests */}
      <section className="mx-auto mt-24 max-w-[1100px] px-6 md:px-10">
        <SectionHeading
          dark
          eyebrow="Request proposal"
          title={<>Tell us about <span className="italic text-gold">your gathering</span></>}
          sub="Conferences, retreats, birthdays and beach parties — our events office replies within 24 hours."
        />
        <div className="mt-12">
          <Reveal>
            <InquiryForm
              defaultType="conference"
              user={user ? { name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier } : null}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}