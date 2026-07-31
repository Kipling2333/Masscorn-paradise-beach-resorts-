import { NextResponse } from "next/server";
import { db } from "@/db";
import { spaBookings, spaServices } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser, notify } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select({ booking: spaBookings, serviceName: spaServices.name, duration: spaServices.durationMinutes })
    .from(spaBookings)
    .innerJoin(spaServices, eq(spaBookings.serviceId, spaServices.id))
    .where(eq(spaBookings.userId, user.id))
    .orderBy(desc(spaBookings.appointmentDate))
    .limit(30);
  return NextResponse.json({ bookings: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to book" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const serviceId = Number(body.serviceId ?? 0);
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");
  const therapist = String(body.therapist ?? "No preference").slice(0, 80);
  const guests = Math.min(4, Math.max(1, Number(body.guests ?? 1)));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Please choose a date" }, { status: 400 });

  const svc = await db.select().from(spaServices).where(eq(spaServices.id, serviceId)).limit(1);
  if (!svc[0]) return NextResponse.json({ error: "Treatment not found" }, { status: 404 });

  const amount = Number(svc[0].price) * guests;
  const [booking] = await db
    .insert(spaBookings)
    .values({ userId: user.id, serviceId, appointmentDate: date, appointmentTime: time, therapist, guests, amount: String(amount), status: "confirmed" })
    .returning();

  await notify(
    user.id,
    `Spa ritual confirmed — ${svc[0].name}`,
    `${svc[0].name} (${svc[0].durationMinutes} min) on ${date} at ${time}, therapist: ${therapist}. Total $${amount.toLocaleString()}. Arrive 15 minutes early for the foot ritual.`
  );

  return NextResponse.json({ booking, message: `${svc[0].name} on ${date} at ${time} — $${amount.toLocaleString()} settled. Your confirmation is on its way.` });
}
