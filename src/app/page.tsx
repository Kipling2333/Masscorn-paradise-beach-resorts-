import { db } from "@/db";
import { reviews, roomTypes, resortContent } from "@/db/schema";
import Link from "next/link";

export default async function HomePage() {
  const [rawReviews, rooms, content] = await Promise.all([
    db.select().from(reviews),
    db.select().from(roomTypes),
    db.select().from(resortContent),
  ]);

  // Transform raw database reviews to ensure strict non-null strings
  const formattedReviews = rawReviews.map((r) => ({
    ...r,
    name: r.name ?? r.author ?? "Guest",
    title: r.title ?? "Guest Review",
    comment: r.comment ?? r.content ?? "",
    rating: r.rating ?? 5,
    tier: r.tier ?? "Guest",
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-serif text-amber-500 md:text-6xl">
          Masscorn Paradise Beach Resort
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-300">
          Experience world-class luxury, pristine beach views, and exceptional hospitality.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/accommodations"
            className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
          >
            Explore Accommodations
          </Link>
          <Link
            href="/careers"
            className="rounded-md border border-amber-500 px-6 py-3 font-semibold text-amber-500 transition hover:bg-amber-500 hover:text-black"
          >
            Careers
          </Link>
        </div>
      </section>

      {/* Featured Room Types Section */}
      {rooms.length > 0 && (
        <section className="container mx-auto px-6 py-12 border-t border-zinc-800">
          <h2 className="mb-8 text-2xl font-serif text-amber-500">Featured Accommodations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.slice(0, 3).map((room) => (
              <div key={room.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                {room.imageUrl && (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="mb-4 h-48 w-full rounded-md object-cover"
                  />
                )}
                <h3 className="text-xl font-semibold text-amber-400">{room.name}</h3>
                <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                  {room.description || "Enjoy a luxurious stay with premium amenities."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-500">
                    ${room.pricePerNight ?? room.basePrice ?? 0} / night
                  </span>
                  <Link
                    href={`/accommodations/${room.slug || room.id}`}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Guest Reviews Section */}
      <section className="container mx-auto px-6 py-12 border-t border-zinc-800">
        <h2 className="mb-8 text-2xl font-serif text-amber-500">Guest Experiences</h2>
        {formattedReviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formattedReviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-amber-400">{r.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{r.comment}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>By: {r.name}</span>
                  <span className="rounded bg-amber-500/10 px-2 py-1 font-medium text-amber-400">
                    {r.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No guest reviews submitted yet.</p>
        )}
      </section>
    </main>
  );
}