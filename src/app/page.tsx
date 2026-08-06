import Link from "next/link";
import { db } from "@/db";
import { roomTypes, reviews, users } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import {
  ArrowRight, Award, ConciergeBell, Leaf, MapPin, ShieldCheck, UtensilsCrossed, Waves, Sparkles,
} from "lucide-react";
import {
  BookingWidget, Counter, Marquee, ParallaxImg, Reveal, SectionHeading, Testimonials, WeatherWidget,
  type ReviewLite,
} from "@/components/widgets";

export default async function HomePage() {
  const featured = await db.select().from(roomTypes).orderBy(asc(roomTypes.sortOrder)).limit(3);

  const rawReviews = await db
    .select({
      name: users.name,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      tier: users.loyaltyTier,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.approved, true))
    .orderBy(desc(reviews.createdAt))
    .limit(6);

  const testimonials: ReviewLite[] = rawReviews.map((r) => ({
    ...r,
    name: r.name.split(" ")[0] + " " + (r.name.split(" ")[1]?.[0] ?? "") + ".",
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Resort",
    name: "Masscorn Paradise Beach Resort",
    description: "Ultra-luxury beachfront resort with private villas, oceanfront spa, fine dining and destination weddings.",
    url: "https://masscorn-paradise.vercel.app",
    image: "https://i.ibb.co/kVz1rP66/hero.jpg",
    priceRange: "$$$$",
    telephone: "+255774000100",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Masscorn Bay, Paje Coast",
      addressRegion: "Zanzibar",
      addressCountry: "TZ",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Private Beach" },
      { "@type": "LocationFeatureSpecification", name: "Spa" },
      { "@type": "LocationFeatureSpecification", name: "Fine Dining" },
    ],
  };

  return (
    <div className="bg-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://i.ibb.co/kVz1rP66/hero.jpg" alt="Aerial view of Masscorn Paradise Beach Resort at golden hour" className="animate-kenburns h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/10 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-10 pt-40 md:px-10">
          <Reveal delay={0.15}>
            <div className="flex items-center gap-4">
              <span className="hairline-gold w-16" />
              <span className="text-[11px] tracking-[0.4em] uppercase text-gold">A private sanctuary on the Indian Ocean</span>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <h1 className="mt-6 max-w-4xl font-display text-[13vw] font-light leading-[0.98] text-ivory drop-shadow-lg sm:text-7xl md:text-8xl">
              Where the horizon
              <span className="block italic text-shimmer">becomes your own</span>
            </h1>
          </Reveal>
          <Reveal delay={0.45}>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/80 drop-shadow">
              Sixty-two residences and villas drift along 2.4 kilometres of private ivory sand — a world of quiet
              mornings, ocean rituals and dinners beneath a thousand stars.
            </p>
          </Reveal>

          <Reveal delay={0.6} className="mt-10">
            <BookingWidget />
          </Reveal>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <Reveal delay={0.75}>
              <WeatherWidget />
            </Reveal>
            <Reveal delay={0.85} className="hidden md:block">
              <div className="flex items-center gap-8 text-[10px] tracking-[0.3em] uppercase text-ivory/45">
                <span className="flex items-center gap-2"><Award size={13} className="text-gold" /> World Travel Awards 2025</span>
                <span className="flex items-center gap-2"><Leaf size={13} className="text-gold" /> EarthCheck Platinum</span>
                <span className="flex items-center gap-2"><ShieldCheck size={13} className="text-gold" /> Forbes Five-Star</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee items={["Private Beach", "Oceanfront Spa", "Five Restaurants", "Sunset Dhow Cruises", "Paradise Elite Club", "Destination Weddings", "24/7 AI Concierge"]} />

      {/* ------------------------------ WELCOME ------------------------------ */}
      <section className="relative bg-ivory py-28 md:py-36">
        <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
          <div className="relative">
            <Reveal>
              <ParallaxImg src="https://i.ibb.co/tMR6Tm3m/hero.jpg" alt="Resort pools and palm gardens from above" className="aspect-[4/5] rounded-2xl" speed={0.16} />
            </Reveal>
            <Reveal delay={0.2} className="absolute -bottom-10 -right-4 hidden w-64 md:block">
              <div className="overflow-hidden rounded-2xl border-8 border-ivory shadow-2xl">
                <img src="/images/villa.jpg" alt="Private villa at dusk" className="aspect-square w-full object-cover" />
              </div>
            </Reveal>
          </div>
          <div>
            <SectionHeading
              align="left"
              index="01"
              eyebrow="The Resort"
              title={<>Barefoot luxury, <span className="italic text-gold">redefined</span></>}
              sub="Conceived as a village of light and shade, Masscorn Paradise gathers teak pavilions, lagoon pools and hidden courtyards around a crescent of untouched coral sand. Every residence faces the water; every hour bends to your rhythm."
            />
            <Reveal delay={0.25}>
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-ink/10 pt-8">
                {[
                  { v: 62, s: "", label: "Residences & Villas" },
                  { v: 2.4, s: " km", label: "Private Coastline", d: 1 },
                  { v: 4.98, s: "", label: "Guest Rating", d: 2 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-5xl text-ink">
                      <Counter to={s.v} suffix={s.s} decimals={s.d ?? 0} />
                    </div>
                    <div className="mt-2 text-[10px] tracking-[0.28em] uppercase text-ink/50">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <Link href="/about" className="btn-ink mt-12">
                Our story <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------- ACCOMMODATIONS ---------------------------- */}
      <section className="bg-ink py-28 md:py-36">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <SectionHeading
            dark
            index="02"
            eyebrow="Accommodations"
            title={<>Residences shaped <span className="italic text-gold">by the sea</span></>}
            sub="From ocean-view rooms to the three-bedroom Presidential Villa, each address includes a dedicated host, breakfast on your terrace and membership of the Paradise Elite Club."
          />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {featured.map((r, i) => (
              <Reveal key={r.id} delay={0.12 * i}>
                <Link href={`/accommodations/${r.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                    <div className="absolute bottom-0 w-full p-7">
                      <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{r.tagline}</div>
                      <div className="mt-2 font-display text-3xl text-ivory">{r.name}</div>
                      <div className="mt-3 flex items-center justify-between text-xs text-ivory/60">
                        <span>From ${Number(r.basePrice).toLocaleString()} / night</span>
                        <span className="flex items-center gap-2 text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">
                          Discover <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link href="/accommodations" className="btn-ghost">View all accommodations</Link>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- EXPERIENCES ----------------------------- */}
      <section className="bg-ivory py-28 md:py-36">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              index="03"
              eyebrow="Experiences"
              title={<>Days written <span className="italic text-gold">in saltlight</span></>}
            />
            <Reveal delay={0.2}>
              <Link href="/experiences" className="btn-ink">All experiences <ArrowRight size={14} /></Link>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { img: "/images/cruise.jpg", icon: Waves, t: "Sunset Dhow Cruise", d: "Champagne at golden hour aboard a hand-built dhow." },
              { img: "https://i.ibb.co/tMR6Tm3m/hero.jpg", icon: MapPin, t: "Sandbank Picnic", d: "A private chef on a vanishing island at low tide." },
              { img: "/images/aerial.jpg", icon: ConciergeBell, t: "Reef Snorkel Safari", d: "Guided drift over our house reef with marine biologists." },
              { img: "/images/dining.jpg", icon: UtensilsCrossed, t: "Chef's Table", d: "Seven courses where the lagoon meets the flame." },
            ].map((x, i) => (
              <Reveal key={x.t} delay={0.1 * i}>
                <Link href="/experiences" className="group relative block overflow-hidden rounded-2xl">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={x.img} alt={x.t} className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <x.icon size={20} strokeWidth={1.1} className="text-gold" />
                    <div className="mt-3 font-display text-2xl text-ivory">{x.t}</div>
                    <p className="mt-1 text-xs leading-relaxed text-ivory/60">{x.d}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- DINING -------------------------------- */}
      <section className="relative overflow-hidden bg-ink py-32 md:py-44">
        <ParallaxImg src="/images/dining.jpg" alt="Dinner on the beach at Masscorn" className="absolute inset-0 h-full" speed={0.2} />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
          <SectionHeading
            dark
            index="04"
            eyebrow="Dining"
            title={<>Four tables, <span className="italic text-gold">one ocean</span></>}
            sub="The Shore for feet-in-sand breakfasts, Azur for night-fresh seafood, Skyline for rooftop mixology and the Lagoon Bar for long, slow afternoons. Reservations open to resident and visiting guests."
          />
          <Reveal delay={0.25}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/dining" className="btn-gold">Reserve a table</Link>
              <Link href="/dining" className="btn-ghost">Explore menus</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ WELLNESS ------------------------------ */}
      <section className="bg-ivory py-28 md:py-36">
        <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <SectionHeading
              align="left"
              index="05"
              eyebrow="Spa & Wellness"
              title={<>Sanctuaries for <span className="italic text-gold">the senses</span></>}
              sub="Six open-air treatment pavilions rest above the tidal pools. Choose from Ocean Rituals, deep-tissue journeys, sunrise yoga on the jetty — or surrender the whole day to the Wellness Package."
            />
            <Reveal delay={0.25}>
              <div className="mt-10 space-y-4">
                {[
                  { t: "Signature Ocean Ritual", d: "90 min · warm shell massage", p: "$180" },
                  { t: "Couples Sunset Ceremony", d: "120 min · private pavilion", p: "$320" },
                  { t: "Sunrise Yoga on the Jetty", d: "60 min · daily at 06:30", p: "$45" },
                ].map((s) => (
                  <div key={s.t} className="flex items-center justify-between border-b border-ink/10 pb-4">
                    <div>
                      <div className="font-display text-xl text-ink">{s.t}</div>
                      <div className="text-xs text-ink/50">{s.d}</div>
                    </div>
                    <div className="text-gold font-display text-xl">{s.p}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <Link href="/spa" className="btn-ink mt-12">Book a ritual <ArrowRight size={14} /></Link>
            </Reveal>
          </div>
          <Reveal className="order-1 lg:order-2">
            <ParallaxImg src="/images/spa.jpg" alt="Oceanfront spa pavilion" className="aspect-[4/5] rounded-2xl" speed={0.16} />
          </Reveal>
        </div>
      </section>

      {/* --------------------------- WEDDINGS & EVENTS --------------------------- */}
      <section className="bg-ink py-28 md:py-36">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <SectionHeading
            dark
            index="06"
            eyebrow="Weddings & Events"
            title={<>Occasions the ocean <span className="italic text-gold">remembers</span></>}
          />
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {[
              {
                img: "/images/wedding.jpg", k: "Weddings", href: "/weddings",
                t: "Vows on ivory sand", d: "Three signature venues — the Beach Pavilion, Coral Lawn and Rooftop at Skyline — with a dedicated atelier of planners, florists and chefs.",
              },
              {
                img: "/images/conference.jpg", k: "Conferences", href: "/events",
                t: "Boardrooms with a horizon", d: "The 300-delegate Grand Pavilion, breakaway cabanas and corporate retreat charters. Productivity, perfumed by frangipani.",
              },
            ].map((c, i) => (
              <Reveal key={c.k} delay={0.15 * i}>
                <Link href={c.href} className="group relative block overflow-hidden rounded-2xl">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={c.img} alt={c.k} className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                  <div className="absolute bottom-0 p-8">
                    <div className="text-[10px] tracking-[0.35em] uppercase text-gold">{c.k}</div>
                    <div className="mt-2 font-display text-3xl text-ivory md:text-4xl">{c.t}</div>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/65">{c.d}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-gold">
                      Enquire <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- TESTIMONIALS ----------------------------- */}
      <section className="border-y border-ivory/10 bg-ink-deep py-28 md:py-32">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10">
          <SectionHeading dark index="07" eyebrow="Guest Stories" title={<>Voices of <span className="italic text-gold">Paradise</span></>} />
          <div className="mt-14">
            <Testimonials reviews={testimonials} />
          </div>
        </div>
      </section>

      {/* ------------------------------- LOYALTY ------------------------------- */}
      <section className="bg-ink py-28 md:py-36">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <SectionHeading
            dark
            index="08"
            eyebrow="Paradise Elite Club"
            title={<>Loyalty, <span className="italic text-gold">gilded</span></>}
            sub="Every stay earns points toward elevated tiers — member rates, complimentary upgrades, VIP check-in and welcome rituals from the moment you join. Enrolment is instant and free."
          />
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { tier: "Silver", pts: "On enrolment", off: "5% member rate", perks: ["Welcome drink ritual", "Late checkout 13:00", "Digital news privileges"] },
              { tier: "Gold", pts: "2,500 points", off: "10% member rate", perks: ["Room upgrade on arrival", "VIP private check-in", "Sunset cruise — 25% off"], featured: true },
              { tier: "Platinum", pts: "10,000 points", off: "15% member rate", perks: ["Suite upgrade guarantee", "Complimentary airport transfer", "Annual spa credit $300"] },
            ].map((t, i) => (
              <Reveal key={t.tier} delay={0.12 * i}>
                <div className={`relative h-full rounded-2xl p-8 ${t.featured ? "glass-dark border-gold/50 shadow-[0_30px_80px_-30px_rgba(198,161,91,0.4)]" : "glass-dark"}`}>
                  {t.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-[9px] tracking-[0.3em] uppercase text-ink">
                      Most loved
                    </span>
                  )}
                  <Sparkles size={18} className="text-gold" strokeWidth={1.2} />
                  <div className="mt-4 font-display text-3xl text-ivory">{t.tier}</div>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-ivory/45">{t.pts}</div>
                  <div className="mt-5 font-display text-2xl text-gold">{t.off}</div>
                  <ul className="mt-6 space-y-3 text-sm text-ivory/65">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-gold" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link href="/auth" className="btn-gold">Join the club — it is free</Link>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- FINALE -------------------------------- */}
      <section className="relative overflow-hidden bg-ink pt-10 pb-32">
        <div className="mx-auto max-w-[1100px] px-6 text-center md:px-10">
          <Reveal>
            <div className="font-display text-[11vw] font-light leading-none text-ivory/[0.06] md:text-8xl">MASSCORN</div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto -mt-4 max-w-xl text-sm leading-relaxed text-ivory/55 md:-mt-8">
              The tide keeps our secrets. Come and collect them — reservations are open for the season.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/accommodations" className="btn-gold">Reserve your stay</Link>
              <Link href="/contact" className="btn-ghost">Speak with us</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}