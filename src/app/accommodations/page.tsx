import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function AccommodationsPage() {
  let rooms = [];

  try {
    rooms = await db.select().from(roomTypes).orderBy(asc(roomTypes.sortOrder));
  } catch (err) {
    console.warn("Database offline, using fallback rooms data", err);
    rooms = [
      {
        id: 1,
        slug: "ocean-luxury-villa",
        name: "Ocean Luxury Villa",
        tagline: "Absolute beachfront paradise",
        description: "Wake up to the sound of waves in our premier beachfront villa.",
        basePrice: "350.00",
        capacity: 2,
        sizeSqm: 65,
        bedType: "King",
        viewType: "Ocean",
        image: "/images/hero.jpg",
        amenities: ["Private Pool", "Ocean View", "Butler Service"],
      },
    ];
  }

  return (
    <div className="bg-ink min-h-screen py-32 px-6 max-w-[1500px] mx-auto">
      <h1 className="font-display text-4xl text-ivory mb-8">Accommodations</h1>
      <div className="grid gap-8 md:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="glass-dark p-6 rounded-2xl">
            <h2 className="font-display text-2xl text-ivory">{room.name}</h2>
            <p className="text-ivory/60 text-sm mt-2">{room.description}</p>
            <p className="text-gold mt-4">From ${room.basePrice} / night</p>
          </div>
        ))}
      </div>
    </div>
  );
}