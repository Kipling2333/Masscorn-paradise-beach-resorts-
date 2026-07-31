import { db } from "@/db";
import { rooms } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";

export default async function AccommodationsPage() {
  let allRooms: any[] = [];
  try {
    allRooms = await db.select().from(rooms);
  } catch (error) {
    console.error("Failed to fetch accommodations:", error);
  }

  // Using your custom images and verified fallback visuals
  const customImages = [
    "/images/villa.jpg", // First card fallback
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", 
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
  ];

  return (
    <main className="min-h-screen bg-[#07221d] text-[#f4efe6] pt-32 pb-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-[#d4af37] mb-4">Accommodations</h1>
        <p className="text-gray-300 max-w-2xl mb-12">
          Experience unrivaled luxury, breathtaking ocean views, and bespoke comfort in our private suites and villas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Ocean Luxury Villa", desc: "Wake up to the sound of waves in our premier beachfront villa.", price: "350.00", img: customImages[0] },
            { name: "Sunset Horizon Suite", desc: "Panoramic golden hour views with an infinity plunge pool.", price: "480.00", img: customImages[1] },
            { name: "Tidal Pool Pavilion", desc: "Secluded sanctuary suspended directly over crystal turquoise waters.", price: "520.00", img: customImages[2] }
          ].map((room, idx) => (
            <div key={idx} className="border border-[#d4af37]/30 rounded-lg overflow-hidden bg-[#0a2e26]/55 shadow-xl flex flex-col">
              <div className="relative h-64 w-full">
                <Image src={room.img} alt={room.name} fill className="object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-serif text-[#d4af37] mb-2">{room.name}</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">{room.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                  <span className="text-[#d4af37] font-semibold">${room.price} / night</span>
                  <Link href="/reserve" className="px-4 py-2 bg-[#d4af37] text-[#07221d] font-medium rounded hover:bg-[#c39f31] transition-colors">
                    Reserve
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