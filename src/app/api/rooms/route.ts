import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, roomTypes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSessionUser, loyaltyDiscount } from "@/lib/auth";
import { availableRooms, priceStay, validateCoupon } from "@/lib/pricing";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const couponCode = url.searchParams.get("coupon") ?? "";

  const rows = await db.select().from(roomTypes).where(eq(roomTypes.slug, slug)).limit(1);
  const room = rows[0];
  if (!room) return NextResponse.json({ error: "Residence not found" }, { status: 404 });

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(checkIn) && /^\d{4}-\d{2}-\d{2}$/.test(checkOut);

  const inv = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rooms)
    .where(and(eq(rooms.roomTypeId, room.id), eq(rooms.status, "active")));
  const roomsTotal = inv[0]?.count ?? 0;

  const user = await getSessionUser();
  const loyaltyPct = user ? loyaltyDiscount(user.loyaltyTier) : 0;
  const couponPct = couponCode ? await validateCoupon(couponCode) : 0;

  let pricing = { nights: 0, subtotal: 0, loyaltyOff: 0, couponOff: 0, total: 0 };
  let available = roomsTotal;
  let seasonal = false;

  if (dateOk) {
    available = await availableRooms(room.id, checkIn, checkOut);
    pricing = priceStay(Number(room.basePrice), checkIn, checkOut, { loyaltyPct, couponPct });
    const m = new Date(checkIn + "T00:00:00Z").getMonth();
    seasonal = [11, 0, 1, 6, 7].includes(m);
  }

  return NextResponse.json({
    available,
    roomsTotal,
    loyaltyPct,
    couponPct,
    seasonal,
    ...pricing,
  });
}
