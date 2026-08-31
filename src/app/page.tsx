import Link from "next/link";
import { db } from "@/db";
import { roomTypes, reviews, users } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import {
  ArrowRight, Award, ConciergeBell, Leaf, MapPin, ShieldCheck, UtensilsCrossed, Waves, Briefcase, Crown, HeartHandshake
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
    name: (r.name ?? "Guest").split(" ")[0] + " " + ((r.name ?? "").split(" ")[1]?.[0] ?? "") + ".",
    rating: r.rating ?? 5,
    title: r.title ?? "",
    comment: r.comment ?? "",
    tier: r.tier ?? undefined,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Resort",
    name: "Masscorn Paradise Beach Resort",
    description: "Ultra-luxury beachfront resort with private villas, oceanfront spa, fine dining and destination weddings.",
    url: "https://masscorn-paradise.vercel.app",
    image: "https://i.ibb.co/tMR6Tm3m/hero.jpg",
    priceRange: "$$$$",
    telephone: "+250792635047",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Marshall highway, Liberia",
      addressRegion: "lower margibi",
      addressCountry: "Liberia",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Private Beach" },
      { "@type": "LocationFeatureSpecification", name: "Spa" },
      { "@type": "LocationFeatureSpecification", name: "Fine Dining" },
      { "@type": "LocationFeatureSpecification", name: "Helipad Transfer" },
      { "@type": "LocationFeatureSpecification", name: "Yacht Charter" },
    ],
  };

  return (
    <div className="bg-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-28">
        <div className="absolute inset-0">
          <img src="https://i.ibb.co/tMR6Tm3m/hero.jpg" alt="Masscorn Paradise Beach Resort view" className="animate-kenburns h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-10 pt-16 md:px-10">
          <Reveal delay={0.15}>
            <div className="flex items-center gap-4">
              <span className="hairline-gold w-16" />
              <span className="text-[11px] tracking-[0.4em] uppercase text-[#FFF159] font-bold drop-shadow-md">A private sanctuary on the Atlantic Coast</span>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <h1 className="mt-6 max-w-4xl font-display text-[13vw] font-light leading-[0.98] text-[#F7F5F0] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] sm:text-7xl md:text-8xl">
              Where Luxury Meet The Ocean
              <span className="block italic text-[#FFF159] drop-shadow-md">Masscorn Paradise Beach Resort</span>
            </h1>
          </Reveal>
          <Reveal delay={0.45}>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#F7F5F0] font-medium drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
              Liberia's crown jewel of coastal prestige. Experience private helipad arrivals, bespoke yacht charters, butler-serviced villas, and starlit fine dining.
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
              <div className="flex items-center gap-8 text-[10px] tracking-[0.3em] uppercase text-[#F7F5F0]/80">
                <span className="flex items-center gap-2"><Award size={13} className="text-[#FFF159]" /> World Travel Awards 2025</span>
                <span className="flex items-center gap-2"><Leaf size={13} className="text-[#FFF159]" /> EarthCheck Platinum</span>
                <span className="flex items-center gap-2"><ShieldCheck size={13} className="text-[#FFF159]" /> Forbes Five-Star</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee items={["Private Beach", "Oceanfront Spa", "Five Restaurants", "Sunset Experiences", "Paradise Elite Club", "Destination Weddings", "24/7 AI Concierge", "Yacht Charters", "Helipad Access"]} />

      {/* ------------------------------ WELCOME ------------------------------ */}
      <section className="relative bg-ivory py-28 md:py-36">
        <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
          <div className="relative grid grid-cols-2 gap-4">
            <Reveal>
              <ParallaxImg src="https://i.ibb.co/tMR6Tm3m/hero.jpg" alt="Resort pools and palm gardens from above" className="aspect-[4/5] rounded-2xl" speed={0.16} />
            </Reveal>
            <Reveal delay={0.2}>
              <ParallaxImg src="https://i.ibb.co/hxJvTnyx/image.jpg" alt="Luxury beachfront lounge area" className="aspect-[4/5] rounded-2xl mt-12" speed={0.22} />
            </Reveal>
          </div>
          <div>
            <SectionHeading
              align="left"
              index="01"
              eyebrow="The Resort"
              title={<>Masscorn luxury, <span className="italic text-gold">redefined</span></>}
              sub="Conceived as a village of light and shade, Masscorn Paradise gathers teak pavilions, lagoon pools, private helipads, and hidden courtyards around a crescent of untouched coral sand. Every residence faces the water; every hour bends to your absolute command."
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
              <div className="mt-12 flex flex-wrap gap-4">
                <Link href="/about" className="btn-ink">
                  Our story <ArrowRight size={14} />
                </Link>
                <Link href="/portal" className="btn-ghost border-ink/20 text-ink hover:bg-ink hover:text-ivory">
                  Paradise Elite Portal <Crown size={14} className="inline ml-1 text-gold" />
                </Link>
              </div>
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
            sub="From ocean-view suites to the ultra-exclusive Presidential Villa, each address includes a 24/7 dedicated butler, private infinity plunge pool, champagne on arrival, and unconditional Paradise Elite Club privileges."
          />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {featured.map((r, i) => (
              <Reveal key={r.id} delay={0.12 * i}>
                <Link href={`/accommodations/${r.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl border border-ivory/10 bg-ink-deep">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                    <div className="absolute top-4 left-4 bg-ink/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-gold border border-gold/20">
                      {r.tagline || "Ultra-Luxury Suite"}
                    </div>
                    <div className="absolute bottom-0 w-full p-7">
                      <div className="text-[10px] tracking-[0.3em] uppercase text-[#FFF159]">Private Sanctuary</div>
                      <div className="mt-2 font-display text-3xl text-ivory">{r.name}</div>
                      <p className="mt-2 text-xs text-ivory/70 line-clamp-2">{r.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-ivory/80 pt-4 border-t border-ivory/10">
                        <span>From ${Number(r.basePrice).toLocaleString()} / night</span>
                        <span className="flex items-center gap-2 text-gold transition-all duration-500 group-hover:translate-x-1">
                          Discover Residence <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link href="/accommodations" className="btn-ghost">View all luxury accommodations</Link>
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
              sub="Curated private excursions designed for discerning voyagers seeking extraordinary coastal moments."
            />
            <Reveal delay={0.2}>
              <Link href="/experiences" className="btn-ink">All experiences <ArrowRight size={14} /></Link>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { img: "https://i.ibb.co/hxJvTnyx/image.jpg", icon: Waves, t: "Sunset Shoreline Walks", d: "Private butler-led champagne stroll along our secluded Atlantic coastline.", link: "/experiences" },
              { img: "https://i.ibb.co/RGmnkhXH/image.jpg", icon: MapPin, t: "Private Sandbank Picnic", d: "Helicopter transfer to a vanishing coral island with a personal Michelin-trained chef.", link: "/experiences" },
              { img: "https://i.ibb.co/mrpPX6mY/image.jpg", icon: ConciergeBell, t: "Yacht & Reef Safari", d: "Charter our 60ft luxury catamaran for deep-sea diving and marine wildlife encounters.", link: "/experiences" },
              { img: "https://i.ibb.co/tMR6Tm3m/hero.jpg", icon: UtensilsCrossed, t: "Starlit Chef's Table", d: "Seven-course culinary odyssey hosted directly over the crashing ocean tide.", link: "/dining" },
            ].map((x, i) => (
              <Reveal key={x.t} delay={0.1 * i}>
                <Link href={x.link} className="group relative block overflow-hidden rounded-2xl border border-ink/10 bg-white">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={x.img} alt={x.t} className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <x.icon size={20} strokeWidth={1.1} className="text-[#FFF159]" />
                    <div className="mt-3 font-display text-2xl text-ivory">{x.t}</div>
                    <p className="mt-1 text-xs leading-relaxed text-ivory/70">{x.d}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-[#FFF159] opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore Experience <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- DINING -------------------------------- */}
      <section className="relative overflow-hidden bg-ink py-32 md:py-44">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80" alt="Fine dining ambiance" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/70" />
        <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
          <SectionHeading
            dark
            index="04"
            eyebrow="Dining & Gastronomy"
            title={<>Four tables, <span className="italic text-gold">one endless ocean</span></>}
            sub="Indulge in culinary artistry across our signature venues: The Shore for feet-in-sand organic breakfasts, Azur for ocean-fresh catch of the day, Skyline Rooftop for vintage mixology, and The Cellar for rare vintage wine pairings."
          />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "The Shore", desc: "Beachfront breakfast & wood-fired grill", time: "07:00 - 23:00" },
              { name: "Azur Restaurant", desc: "Fine dining seafood & coastal tasting menus", time: "18:00 - 23:30" },
              { name: "Skyline Lounge", desc: "Rooftop craft cocktails & sunset panoramic views", time: "16:00 - 02:00" },
              { name: "The Cellar", desc: "Private sommelier-led tastings & rare vintages", time: "By Appointment" },
            ].map((venue, idx) => (
              <Reveal key={venue.name} delay={idx * 0.1}>
                <div className="bg-ink-deep/90 backdrop-blur-md p-6 rounded-2xl border border-ivory/10 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gold">{venue.time}</span>
                    <h3 className="font-display text-2xl text-ivory mt-2">{venue.name}</h3>
                    <p className="text-xs text-ivory/60 mt-2">{venue.desc}</p>
                  </div>
                  <Link href="/dining" className="mt-6 text-xs uppercase tracking-widest text-gold inline-flex items-center gap-1 hover:underline">
                    View Menus <ArrowRight size={12} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.25}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/dining" className="btn-gold">Reserve a table</Link>
              <Link href="/dining" className="btn-ghost">Explore all menus & private dining</Link>
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
              sub="Six open-air treatment pavilions suspended above tranquil tidal pools. Experience ancient West African holistic healing arts, bespoke organic botanicals, and sunrise yoga."
            />
            <Reveal delay={0.25}>
              <div className="mt-10 space-y-4">
                {[
                  { t: "Signature Ocean Ritual", d: "90 min · warm shell massage & coastal aromatherapy", p: "$180" },
                  { t: "Couples Sunset Ceremony", d: "120 min · private overwater pavilion with champagne", p: "$320" },
                  { t: "Sunrise Yoga on the Jetty", d: "60 min · guided mindfulness daily at 06:30", p: "$45" },
                  { t: "Holistic Detox Body Wrap", d: "75 min · mineral-rich local clay & sea salt scrub", p: "$150" },
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
            <ParallaxImg src="https://i.ibb.co/tMR6Tm3m/hero.jpg" alt="Oceanfront spa pavilion" className="aspect-[4/5] rounded-2xl" speed={0.16} />
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- CAREERS & JOIN US ----------------------------- */}
      <section className="bg-ink-deep border-y border-ivory/10 py-24 md:py-32">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="hairline-gold w-10" />
                <span className="text-[11px] tracking-[0.4em] uppercase text-gold font-bold">Global Hospitality Careers</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-ivory">
                Shape the future of <span className="italic text-gold">luxury hospitality</span>
              </h2>
              <p className="mt-4 text-sm text-ivory/70 leading-relaxed">
                At Masscorn Paradise Beach Resort, we look for exceptional individuals driven by passion, elegance, and dedication to flawless service. Join our world-class team across culinary arts, wellness, estate management, and guest relations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/careers" className="btn-gold flex items-center gap-2">
                  <Briefcase size={15} /> View Open Positions & Apply
                </Link>
                <Link href="/contact" className="btn-ghost">
                  HR Talent Team
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ink p-6 rounded-2xl border border-ivory/10">
                <Crown className="text-gold mb-3" size={24} />
                <h3 className="font-display text-xl text-ivory">Prestigious Culture</h3>
                <p className="text-xs text-ivory/60 mt-2">Continuous mentorship and world-class hospitality training programs.</p>
              </div>
              <div className="bg-ink p-6 rounded-2xl border border-ivory/10 mt-6">
                <HeartHandshake className="text-gold mb-3" size={24} />
                <h3 className="font-display text-xl text-ivory">Global Benefits</h3>
                <p className="text-xs text-ivory/60 mt-2">Comprehensive health packages, luxury accommodation support, and growth incentives.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- TESTIMONIALS ----------------------------- */}
      <section className="border-b border-ivory/10 bg-ink-deep py-28 md:py-32">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10">
          <SectionHeading dark index="06" eyebrow="Guest Stories" title={<>Voices of <span className="italic text-gold">Paradise</span></>} />
          <div className="mt-14">
            <Testimonials reviews={testimonials} />
          </div>
        </div>
      </section>

      {/* -------------------------------- FINALE -------------------------------- */}
      <section className="relative overflow-hidden bg-ink pt-20 pb-32">
        <div className="mx-auto max-w-[1100px] px-6 text-center md:px-10">
          <Reveal>
            <div className="font-display text-[11vw] font-light leading-none text-ivory/[0.06] md:text-8xl">MASSCORN</div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto -mt-4 max-w-xl text-sm leading-relaxed text-ivory/55 md:-mt-8">
              The tide keeps our secrets. Come and collect them — reservations are open for the season. Experience the pinnacle of Liberian coastal luxury.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/accommodations" className="btn-gold">Reserve your stay</Link>
              <Link href="/careers" className="btn-ghost border-gold/40 text-gold hover:bg-gold hover:text-ink">Apply for a career</Link>
              <Link href="/contact" className="btn-ghost">Speak with us</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}