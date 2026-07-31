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

  return (
    <main className="min-h-screen bg-[#07221d] text-[#f4efe6] pt-32 pb-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-[#d4af37] mb-4">Accommodations</h1>
        <p className="text-gray-300 max-w-2xl mb-12">
          Experience unrivaled luxury, breathtaking ocean views, and bespoke comfort in our private suites and villas.
        </p>

        {allRooms.length === 0 ? (
          <div className="p-8 border border-[#d4af37]/30 rounded-lg bg-[#0a2e26]/50">
            <h3 className="text-xl font-serif text-[#d4af37] mb-2">Ocean Luxury Villa</h3>
            <p className="text-gray-300 mb-4">Wake up to the sound of waves in our premier beachfront villa.</p>
            <p className="text-[#d4af37] font-medium">From $350.00 / night</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allRooms.map((room) => (
              <div key={room.id} className="border border-[#d4af37]/30 rounded-lg overflow-hidden bg-[#0a2e26]/55 shadow-xl flex flex-col">
                {room.imageUrl && (
                  <div className="relative h-64 w-full">
                    <Image 
                      src={room.imageUrl} 
                      alt={room.roomNumber || "Room"} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-serif text-[#d4af37] mb-2">Room {room.roomNumber}</h3>
                  <p className="text-gray-300 text-sm mb-4 flex-grow">Status: {room.status}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                    <span className="text-[#d4af37] font-semibold">Luxury Suite</span>
                    <Link href={`/reserve?room=${room.id}`} className="px-4 py-2 bg-[#d4af37] text-[#07221d] font-medium rounded hover:bg-[#c39f31] transition-colors">
                      Reserve
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}