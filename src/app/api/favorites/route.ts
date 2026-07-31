import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, roomTypes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({ favorite: favorites, room: roomTypes })
    .from(favorites)
    .innerJoin(roomTypes, eq(favorites.roomTypeId, roomTypes.id))
    .where(eq(favorites.userId, user.id));
  return NextResponse.json({ favorites: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const roomTypeId = Number(body.roomTypeId ?? 0);
  if (!roomTypeId) return NextResponse.json({ error: "Invalid room" }, { status: 400 });

  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.roomTypeId, roomTypeId)))
    .limit(1);
  if (existing.length) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    return NextResponse.json({ favorited: false });
  }
  await db.insert(favorites).values({ userId: user.id, roomTypeId });
  return NextResponse.json({ favorited: true });
}
