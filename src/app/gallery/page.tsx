import type { Metadata } from "next";
import { Clapperboard } from "lucide-react";
import { Reveal, SectionHeading, VirtualTour } from "@/components/widgets";
import { DynamicGalleryGrid } from "@/components/DynamicGalleryGrid";

export const metadata: Metadata = {
  title: "Gallery & Virtual Tour",
  description: "Photography, film and an immersive 360° virtual tour of Masscorn Paradise Beach Resort.",
};

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
        <DynamicGalleryGrid />
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