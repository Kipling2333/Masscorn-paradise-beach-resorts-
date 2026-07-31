import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { SectionHeading } from "@/components/widgets";

export default async function DiningPage() {
  let venues: any[] = [];

  try {
    venues = await db.select().from(restaurants);
  } catch (err) {
    console.warn("Database offline or table missing. Loading fallback restaurants.", err);
    venues = [
      {
        id: 1,
        slug: "the-shore",
        name: "The Shore",
        cuisine: "Beachfront Grill",
        description: "Barefoot breakfasts and fire-kissed seafood directly on the coral sand.",
        image: "/images/dining.jpg",
        hours: "07:00 - 22:30",
      },
    ];
  }

  return (
    <div className="bg-ink min-h-screen py-32 px-6 max-w-[1500px] mx-auto">
      <SectionHeading dark eyebrow="Culinary" title={<>Restaurants & <span className="italic text-gold">Bars</span></>} />
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {venues.map((v) => (
          <div key={v.id} className="glass-dark rounded-2xl overflow-hidden p-6">
            <img src={v.image} alt={v.name} className="aspect-video w-full object-cover rounded-xl mb-6" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold">{v.cuisine}</span>
            <h2 className="font-display text-3xl text-ivory mt-2">{v.name}</h2>
            <p className="text-ivory/60 text-sm mt-3">{v.description}</p>
            <div className="mt-6 text-xs text-ivory/40">Hours: {v.hours}</div>
          </div>
        ))}
      </div>
    </div>
  );
}