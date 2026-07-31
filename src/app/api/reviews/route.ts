import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const rows = await db
    .select({ name: users.name, rating: reviews.rating, title: reviews.title, comment: reviews.comment, createdAt: reviews.createdAt })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.approved, true))
    .orderBy(desc(reviews.createdAt))
    .limit(24);
  return NextResponse.json({ reviews: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const rating = Math.min(5, Math.max(1, Number(body.rating ?? 5)));
  const title = String(body.title ?? "").slice(0, 160) || null;
  const comment = String(body.comment ?? "").trim().slice(0, 1500);
  if (comment.length < 10) return NextResponse.json({ error: "Please tell us a little more" }, { status: 400 });

  await db.insert(reviews).values({ userId: user.id, rating, title, comment, approved: false });
  return NextResponse.json({ ok: true });
}
