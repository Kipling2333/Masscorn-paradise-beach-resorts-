import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurantReservations, restaurants } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser, notify } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({ reservation: restaurantReservations, restaurantName: restaurants.name })
    .from(restaurantReservations)
    .innerJoin(restaurants, eq(restaurantReservations.restaurantId, restaurants.id))
    .where(eq(restaurantReservations.userId, user.id))
    .orderBy(desc(restaurantReservations.reservationDate))
    .limit(30);
  return NextResponse.json({ reservations: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to reserve" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const restaurantId = Number(body.restaurantId ?? 0);
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");
  const guests = Math.min(12, Math.max(1, Number(body.guests ?? 2)));
  const occasion = String(body.occasion ?? "").slice(0, 120) || null;
  const specialMeals = String(body.specialMeals ?? "").slice(0, 400) || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Please choose a date" }, { status: 400 });

  const rest = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1);
  if (!rest[0]) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const tableNumber = 1 + Math.floor(Math.random() * 32);
  const [reservation] = await db
    .insert(restaurantReservations)
    .values({ userId: user.id, restaurantId, tableNumber, reservationDate: date, reservationTime: time, guests, occasion, specialMeals, status: "confirmed" })
    .returning();

  await notify(
    user.id,
    `Table confirmed — ${rest[0].name}`,
    `Table ${tableNumber} at ${rest[0].name} is held for ${guests} guest(s) on ${date} at ${time}. ${occasion ? `Occasion: ${occasion}. ` : ""}We can't wait to host you.`,
    ["email", "sms"]
  );

  return NextResponse.json({ reservation, message: `Table ${tableNumber} at ${rest[0].name}, ${date} at ${time} — confirmation sent to your email and phone.` });
}
