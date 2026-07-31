import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  bookings, eventInquiries, events, notifications, payments, restaurantReservations,
  restaurants, reviews, rooms, roomTypes, spaBookings, spaServices, users,
} from "@/db/schema";
import { and, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { getSessionUser, isAdmin } from "@/lib/auth";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const allPayments = await db.select().from(payments).where(eq(payments.status, "completed"));
  const allBookings = await db.select().from(bookings);
  const allUsers = await db.select().from(users);
  const allRooms = await db.select().from(rooms);
  const allTypes = await db.select().from(roomTypes);
  const allDining = await db.select().from(restaurantReservations);
  const allSpa = await db
    .select({ booking: spaBookings, serviceName: spaServices.name })
    .from(spaBookings)
    .innerJoin(spaServices, eq(spaBookings.serviceId, spaServices.id));
  const allRestaurants = await db.select().from(restaurants);
  const allReviews = await db
    .select({ review: reviews, userName: users.name })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt))
    .limit(40);
  const allInquiries = await db.select().from(eventInquiries).orderBy(desc(eventInquiries.createdAt)).limit(40);
  const allEvents = await db.select().from(events).orderBy(desc(events.eventDate)).limit(20);
  const allNotes = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(40);

  const now = new Date();

  /* revenue by month — last 8 months */
  const revenueByMonth: { month: string; revenue: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = monthKey(d);
    const revenue = allPayments
      .filter((p) => monthKey(new Date(p.createdAt)) === k)
      .reduce((s, p) => s + Number(p.amount), 0);
    revenueByMonth.push({ month: MONTHS[d.getMonth()], revenue });
  }

  /* occupancy by month — last 6 months */
  const activeRooms = allRooms.filter((r) => r.status === "active").length || 1;
  const occupancyByMonth: { month: string; pct: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const first = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const last = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    let bookedNights = 0;
    for (const b of allBookings) {
      if (b.status === "cancelled") continue;
      const ci = new Date(b.checkIn + "T00:00:00Z");
      const co = new Date(b.checkOut + "T00:00:00Z");
      const start = ci > first ? ci : first;
      const end = co < last ? co : last;
      const nights = Math.max(0, (end.getTime() - start.getTime()) / 86400000);
      bookedNights += nights * b.roomsCount;
    }
    const capacity = activeRooms * last.getDate();
    occupancyByMonth.push({ month: MONTHS[first.getMonth()], pct: Math.min(100, Math.round((bookedNights / capacity) * 100)) });
  }

  /* room revenue share */
  const roomRevenue = allTypes.map((t) => ({
    name: t.name,
    revenue: allPayments.reduce((sum, p) => {
      const booking = allBookings.find((b) => b.id === p.bookingId);
      return booking && booking.roomTypeId === t.id ? sum + Number(p.amount) : sum;
    }, 0),
  })).filter((r) => r.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  /* CRM — guest spend & history */
  const spendByUser = new Map<number, { spend: number; stays: number; nights: number }>();
  for (const b of allBookings) {
    if (b.status === "cancelled") continue;
    const cur = spendByUser.get(b.userId) ?? { spend: 0, stays: 0, nights: 0 };
    cur.spend += Number(b.totalAmount);
    cur.stays += 1;
    cur.nights += Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000));
    spendByUser.set(b.userId, cur);
  }
  const customers = allUsers
    .map((u) => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
      tier: u.loyaltyTier, points: u.loyaltyPoints, joined: u.createdAt,
      ...(spendByUser.get(u.id) ?? { spend: 0, stays: 0, nights: 0 }),
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 60);

  /* recent bookings with guest + room */
  const recentBookings = await db
    .select({ booking: bookings, guestName: users.name, guestEmail: users.email, roomName: roomTypes.name })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
    .orderBy(desc(bookings.createdAt))
    .limit(15);

  /* check-ins / check-outs today */
  const today = now.toISOString().slice(0, 10);
  const checkInsToday = allBookings.filter((b) => b.checkIn === today && b.status !== "cancelled");
  const checkOutsToday = allBookings.filter((b) => b.checkOut === today && b.status !== "cancelled");

  /* restaurant & spa performance */
  const diningPerf = allRestaurants.map((r) => ({
    name: r.name,
    reservations: allDining.filter((d) => d.restaurantId === r.id && d.status !== "cancelled").length,
  }));
  const spaPerfMap = new Map<string, { count: number; revenue: number }>();
  for (const s of allSpa) {
    if (s.booking.status === "cancelled") continue;
    const cur = spaPerfMap.get(s.serviceName) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += Number(s.booking.amount);
    spaPerfMap.set(s.serviceName, cur);
  }
  const spaPerf = Array.from(spaPerfMap.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);

  /* customer growth — last 6 months */
  const customerGrowth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = monthKey(d);
    customerGrowth.push({ month: MONTHS[d.getMonth()], count: allUsers.filter((u) => monthKey(new Date(u.createdAt)) === k).length });
  }

  const totalRevenue = allPayments.reduce((s, p) => s + Number(p.amount), 0);
  const thisMonth = monthKey(now);
  const revenueThisMonth = allPayments.filter((p) => monthKey(new Date(p.createdAt)) === thisMonth).reduce((s, p) => s + Number(p.amount), 0);

  const inventory = await db
    .select({ room: rooms, typeName: roomTypes.name })
    .from(rooms)
    .innerJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id));

  return NextResponse.json({
    stats: {
      totalRevenue, revenueThisMonth,
      bookings: allBookings.filter((b) => b.status !== "cancelled").length,
      cancelledBookings: allBookings.filter((b) => b.status === "cancelled").length,
      guests: allUsers.filter((u) => u.role === "guest").length,
      occupancy: occupancyByMonth[occupancyByMonth.length - 1].pct,
      checkInsToday: checkInsToday.length,
      checkOutsToday: checkOutsToday.length,
      events: allEvents.length,
      diningReservations: allDining.filter((d) => d.status !== "cancelled").length,
      spaBookings: allSpa.length,
      avgRating: allReviews.length ? Math.round((allReviews.reduce((s, r) => s + r.review.rating, 0) / allReviews.length) * 100) / 100 : 5,
    },
    revenueByMonth, occupancyByMonth, roomRevenue, customerGrowth,
    recentBookings, customers, diningPerf, spaPerf,
    reviews: allReviews, inquiries: allInquiries, events: allEvents, notifications: allNotes,
    inventory,
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const action = String(body.action ?? "");

  if (action === "booking_status") {
    const id = Number(body.id);
    const status = String(body.status);
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "review_approve") {
    await db.update(reviews).set({ approved: Boolean(body.approved) }).where(eq(reviews.id, Number(body.id)));
    return NextResponse.json({ ok: true });
  }

  if (action === "inquiry_status") {
    const status = String(body.status);
    if (!["new", "in_review", "confirmed", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db.update(eventInquiries).set({ status }).where(eq(eventInquiries.id, Number(body.id)));
    return NextResponse.json({ ok: true });
  }

  if (action === "user_tier") {
    const tier = String(body.tier);
    if (!["silver", "gold", "platinum"].includes(tier)) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    await db.update(users).set({ loyaltyTier: tier }).where(eq(users.id, Number(body.id)));
    return NextResponse.json({ ok: true });
  }

  if (action === "room_status") {
    const status = String(body.status);
    if (!["active", "maintenance"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    await db.update(rooms).set({ status }).where(eq(rooms.id, Number(body.id)));
    return NextResponse.json({ ok: true });
  }

  if (action === "event_create") {
    const title = String(body.title ?? "").slice(0, 160);
    const eventDate = String(body.eventDate ?? "");
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }
    const [ev] = await db.insert(events).values({
      title,
      eventType: String(body.eventType ?? "celebration").slice(0, 40),
      venue: String(body.venue ?? "Grand Pavilion").slice(0, 140),
      eventDate,
      capacity: Math.min(2000, Math.max(1, Number(body.capacity ?? 50))),
      price: String(Number(body.price ?? 0)),
      description: String(body.description ?? "").slice(0, 800),
      image: String(body.image ?? "/images/aerial.jpg"),
    }).returning();
    return NextResponse.json({ ok: true, event: ev });
  }

  if (action === "event_delete") {
    await db.delete(events).where(eq(events.id, Number(body.id)));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
