import { db } from "@/db";
import { roomTypes } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Users, Maximize2 } from "lucide-react";

export const metadata = {
  title: "Accommodations | Masscorn Paradise Beach Resort",
  description: "Experience unrivaled luxury, breathtaking ocean views, and bespoke comfort in our private suites and villas.",
};

export default async function AccommodationsPage() {
  let rooms: any[] = [];
  
  try {
    rooms = await db.select().from(roomTypes).orderBy(asc(roomTypes.sortOrder));
  } catch (error) {
    console.error("Failed to fetch accommodations from database:", error);
  }

  // Fallback data if database is empty or unreachable
  const fallbackRooms = [
    {
      slug: "ocean-luxury-villa",
      name: "Ocean Luxury Villa",
      tagline: "Premier Beachfront",
      description: "Wake up to the sound of waves in our premier beachfront villa with private terrace and direct access to the shore.",
      basePrice: "350.00",
      maxGuests: 2,
      sqm: 120,
      image: "https://i.ibb.co/tMR6Tm3m/hero.jpg",
    },
    {
      slug: "sunset-horizon-suite",
      name: "Sunset Horizon Suite",
      tagline: "Panoramic Views",
      description: "Panoramic golden hour views with an infinity plunge pool suspended above the coastline.",
      basePrice: "480.00",
      maxGuests: 3,
      sqm: 160,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
    },
    {
      slug: "tidal-pool-pavilion",
      name: "Tidal Pool Pavilion",
      tagline: "Overwater Sanctuary",
      description: "Secluded sanctuary suspended directly over crystal turquoise waters with glass floor viewing panels.",
      basePrice: "520.00",
      maxGuests: 4,
      sqm: 210,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const displayRooms = rooms.length > 0 ? rooms : fallbackRooms;

  return (
    <main className="min-h-screen bg-[#07221d] text-[#f4efe6] pt-32 pb-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="h-[1px] w-12 bg-[#d4af37]" />
          <span className="text-[11px] tracking-[0.4em] uppercase text-[#d4af37] font-bold">Private Sanctuaries</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif text-[#d4af37] mb-4">Accommodations</h1>
        <p className="text-gray-300 max-w-2xl mb-12">
          Experience unrivaled luxury, breathtaking ocean views, and bespoke comfort in our private suites and villas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayRooms.map((room) => (
            <div 
              key={room.id || room.slug} 
              className="border border-[#d4af37]/30 rounded-xl overflow-hidden bg-[#0a2e26]/55 shadow-xl flex flex-col group"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07221d]/80 via-transparent to-transparent" />
                {room.tagline && (
                  <div className="absolute top-4 left-4 bg-[#07221d]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-[#d4af37] border border-[#d4af37]/20">
                    {room.tagline}
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-serif text-[#d4af37] mb-2">{room.name}</h3>
                <p className="text-gray-300 text-sm mb-6 flex-grow line-clamp-2">{room.description}</p>
                
                {room.maxGuests && (
                  <div className="flex items-center gap-6 text-xs text-gray-400 mb-6">
                    <span className="flex items-center gap-1.5"><Users size={13} className="text-[#d4af37]" /> {room.maxGuests} Guests</span>
                    {room.sqm && <span className="flex items-center gap-1.5"><Maximize2 size={13} className="text-[#d4af37]" /> {room.sqm} sqm</span>}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block">From</span>
                    <span className="text-[#d4af37] font-semibold text-lg">${Number(room.basePrice).toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ night</span></span>
                  </div>
                  <Link 
                    href={`/accommodations/${room.slug}`} 
                    className="px-4 py-2 bg-[#d4af37] text-[#07221d] font-medium text-xs uppercase tracking-wider rounded hover:bg-[#c39f31] transition-colors flex items-center gap-2"
                  >
                    Explore <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}