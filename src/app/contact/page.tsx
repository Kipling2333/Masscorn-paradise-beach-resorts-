import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { InquiryForm, Reveal, SectionHeading, WeatherWidget } from "@/components/widgets";

export const metadata: Metadata = {
  title: "Contact — Maps, WhatsApp & Concierge",
  description: "Reach the Masscorn Paradise team — WhatsApp, phone, email, live chat with our AI concierge and an interactive map of the bay.",
};

export default async function ContactPage() {
  const user = await getSessionUser();
  return (
    <div className="bg-ink pb-28">
      <section className="mx-auto max-w-[1500px] px-6 pt-40 md:px-10">
        <SectionHeading dark eyebrow="Contact" title={<>We are never <span className="italic text-gold">far away</span></>} />
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Phone, t: "Reservations", v: "+255 774 000 100", s: "24 hours, every day" },
            { icon: MessageCircle, t: "WhatsApp", v: "+255 774 000 101", s: "Replies within minutes" },
            { icon: Mail, t: "Email", v: "reservations@masscorn.com", s: "Within 24 hours" },
            { icon: Sparkles, t: "Live chat", v: "Aurelia, AI concierge", s: "Gold button, bottom-right" },
          ].map((c, i) => (
            <Reveal key={c.t} delay={0.07 * i}>
              <div className="glass-dark h-full p-6">
                <c.icon size={19} strokeWidth={1.1} className="text-gold" />
                <div className="mt-4 text-[10px] tracking-[0.3em] uppercase text-ivory/45">{c.t}</div>
                <div className="mt-1.5 font-display text-lg text-ivory">{c.v}</div>
                <div className="mt-1 text-xs text-ivory/45">{c.s}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1500px] gap-14 px-6 md:px-10 lg:grid lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-ivory/10">
              <iframe
                title="Map of Masscorn Paradise Beach Resort"
                src="https://www.openstreetmap.org/export/embed.html?bbox=39.35%2C-6.35%2C39.60%2C-6.18&layer=mapnik&marker=-6.265%2C39.475"
                className="h-[420px] w-full grayscale-[40%] contrast-[1.05]"
                loading="lazy"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="glass-dark p-6">
                <MapPin size={17} className="text-gold" strokeWidth={1.2} />
                <div className="mt-3 text-sm text-ivory/80">Masscorn Bay, Paje Coast</div>
                <div className="text-xs text-ivory/45">Zanzibar Archipelago, Tanzania</div>
              </div>
              <div className="glass-dark p-6">
                <Clock size={17} className="text-gold" strokeWidth={1.2} />
                <div className="mt-3 text-sm text-ivory/80">45 min from Abeid Amani Karume Intl.</div>
                <div className="text-xs text-ivory/45">Resort transfers & helipad on request</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="glass-dark mt-6 inline-flex p-4">
              <WeatherWidget />
            </div>
          </Reveal>
        </div>

        <div>
          <SectionHeading align="left" dark eyebrow="Write to us" title={<>A note, a wish, <span className="italic text-gold">a question</span></>} />
          <div className="mt-10">
            <Reveal delay={0.1}>
              <InquiryForm
                defaultType="birthday"
                user={user ? { name: user.name, email: user.email, role: user.role, loyaltyTier: user.loyaltyTier } : null}
              />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
