import { db } from "@/db";
import { reviews, roomTypes, resortContent } from "@/db/schema";

export default async function HomePage() {
  const [rawReviews, rooms, content] = await Promise.all([
    db.select().from(reviews),
    db.select().from(roomTypes),
    db.select().from(resortContent),
  ]);

  // Transform raw database reviews to ensure strict non-null strings for 'name' and 'tier'
  const formattedReviews = rawReviews.map((r) => ({
    ...r,
    name: r.name ?? r.author ?? "Guest",
    title: r.title ?? "Guest Review",
    comment: r.comment ?? r.content ?? "",
    rating: r.rating ?? 5,
    tier: r.tier ?? "Guest",
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* 1. Formatted array safe for ReviewLite props */}
      {/* <ReviewLite reviews={formattedReviews} /> */}

      {/* 2. Direct map rendering safe from 'possibly null' errors */}
      <section className="container mx-auto py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formattedReviews.map((r) => (
            <div key={r.id} className="rounded-lg border p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>By: {r.name}</span>
                <span className="rounded bg-primary/10 px-2 py-1 font-medium text-primary">
                  {r.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}