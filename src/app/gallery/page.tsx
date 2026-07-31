import type { Metadata } from "next";
import { Clapperboard, Camera } from "lucide-react";
import { Reveal, SectionHeading, VirtualTour } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Gallery & Virtual Tour",
  description: "Photography, film and an immersive 360° virtual tour of Masscorn Paradise Beach Resort.",
};

const ITEMS = [
  { img: "/images/hero.jpg", c: "The Bay at Golden Hour" },
  { img: "/images/villa.jpg", c: "Honeymoon Villa, Dusk" },
  { img: "/images/dining.jpg", c: "Dinner on the Sand" },
  { img: "/images/aerial.jpg", c: "The Lagoon Pools" },
  { img: "/images/room-ocean.jpg", c: "Ocean View Room" },
  { img: "/images/spa.jpg", c: "Spa Pavilion" },
  { img: "/images/wedding.jpg", c: "The Beach Pavilion" },
  { img: "/images/suite.jpg", c: "Presidential Salon" },
  { img: "/images/cruise.jpg", c: "Evening Dhow" },
  { img: "/images/conference.jpg", c: "Boardroom Azur" },
];

export default function GalleryPage() {
  return (
    <div className="bg-ink pb-28">
      <section className="mx-auto max-w-[1500px] px-6 pb-4 pt-40 md:px-10">
        <SectionHeading
          dark
          eyebrow="Gallery"
          title={<>Postcards from <span className="italic text-gold">the edge of blue</span></>}
          sub="Photography, film and drone passages over the bay — refreshed each season by our artists-in-residence."
        />
      </section>

      <section className="mx-auto mt-14 max-w-[1500px] px-6 md:px-10">
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {ITEMS.map((it, i) => (
            <Reveal key={it.c} delay={0.04 * (i % 3)}>
              <figure className="group relative overflow-hidden rounded-2xl break-inside-avoid">
                <img
                  src={it.img}
                  alt={it.c}
                  className={`w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105 ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square"}`}
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/85 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="font-display text-lg text-ivory">{it.c}</span>
                  <Camera size={15} className="text-gold" />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-[1500px] px-6 md:px-10">
        <SectionHeading dark eyebrow="Immersive" title={<>Walk the bay <span className="italic text-gold">from anywhere</span></>} />
        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-ivory/10">
            <VirtualTour />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-24 max-w-[1100px] px-6 md:px-10">
        <Reveal>
          <div className="glass-dark flex flex-col items-center gap-5 p-10 text-center md:flex-row md:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/40">
              <Clapperboard size={22} strokeWidth={1.2} className="text-gold" />
            </div>
            <div>
              <div className="font-display text-2xl text-ivory">The resort film — “Two Winds”</div>
              <p className="mt-1 text-sm text-ivory/55">
                Our seasonal drone passage premieres monthly in the open-air cinema on Coral Lawn, and privately in your villa on request.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
