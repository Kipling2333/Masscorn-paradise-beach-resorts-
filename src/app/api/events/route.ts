import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventInquiries, events } from "@/db/schema";
import { asc, gte } from "drizzle-orm";
import { getSessionUser, notify } from "@/lib/auth";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const list = await db.select().from(events).where(gte(events.eventDate, today)).orderBy(asc(events.eventDate)).limit(24);
  return NextResponse.json({ events: list });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 160);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const phone = String(body.phone ?? "").trim().slice(0, 40) || null;
  const eventType = String(body.eventType ?? "celebration").slice(0, 40);
  const preferredDate = typeof body.preferredDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.preferredDate) ? body.preferredDate : null;
  const guests = Math.min(2000, Math.max(2, Number(body.guests ?? 50)));
  const budget = String(body.budget ?? "").slice(0, 60) || null;
  const message = String(body.message ?? "").slice(0, 1500) || null;

  if (!name || !email.includes("@")) {
    return NextResponse.json({ error: "Please share your name and a valid email" }, { status: 400 });
  }

  await db.insert(eventInquiries).values({
    userId: user?.id ?? null, name, email, phone, eventType, preferredDate, guests, budget, message, status: "new",
  });

  if (user) {
    await notify(
      user.id,
      "Your inquiry has been received",
      `Thank you, ${name}. Our events atelier is composing a proposal for your ${eventType.replace(/_/g, " ")}${preferredDate ? ` around ${preferredDate}` : ""}. Expect our reply within 24 hours.`
    );
  }

  return NextResponse.json({ message: "Our events atelier will reply within 24 hours with a bespoke proposal." });
}
