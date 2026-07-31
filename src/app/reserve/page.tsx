import type { Metadata } from "next";
import { Reveal, SectionHeading } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Reserve Your Stay — Masscorn Paradise",
  description: "Book your luxury villa, suite, or pavilion at Masscorn Paradise Beach Resort.",
};

export default function ReservePage() {
  return (
    <div className="bg-ink min-h-screen pt-32 pb-28 px-6 md:px-10 text-ivory">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          dark
          eyebrow="Reservation Portal"
          title={<>Secure your <span className="italic text-gold">sanctuary</span></>}
          sub="Complete your booking details below or sign in to your Paradise Elite Club account for instant member rates."
        />
        <div className="mt-12 glass-dark p-8 rounded-xl border border-ivory/10">
          <p className="text-ivory/70 text-center py-12">
            Reservation booking engine loading... Please select your dates and accommodation choice from our rooms or spa menus.
          </p>
        </div>
      </div>
    </div>
  );
}