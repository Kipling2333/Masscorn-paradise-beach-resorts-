import "server-only";
import { db } from "@/db";
import { bookings, coupons, rooms } from "@/db/schema";
import { and, eq, gte, lt, ne, sql } from "drizzle-orm";

/** Seasonal rate multiplier - peak (Dec-Feb, Jul-Aug), shoulder (Mar-May, Sep), low (Oct-Nov, Jun). */
export function seasonalMultiplier(date: Date): number {
  const m = date.getMonth(); // 0-based
  if (m === 11 || m === 0 || m === 1 || m === 6 || m === 7) return 1.25;
  if (m === 2 || m === 3 || m === 4 || m === 8) return 1.1;
  return 1.0;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

/** Price a stay night-by-night with seasonal rates, loyalty discount and coupon. */
export function priceStay(
  basePrice: number,
  checkIn: string,
  checkOut: string,
  opts: { loyaltyPct?: number; couponPct?: number } = {}
): { nights: number; subtotal: number; loyaltyOff: number; couponOff: number; total: number } {
  const nights = nightsBetween(checkIn, checkOut);
  let subtotal = 0;
  const start = new Date(checkIn + "T00:00:00Z");
  for (let i = 0; i < nights; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    subtotal += basePrice * seasonalMultiplier(d);
  }
  subtotal = Math.round(subtotal * 100) / 100;
  const loyaltyOff = Math.round(subtotal * ((opts.loyaltyPct ?? 0) / 100) * 100) / 100;
  const afterLoyalty = subtotal - loyaltyOff;
  const couponOff = Math.round(afterLoyalty * ((opts.couponPct ?? 0) / 100) * 100) / 100;
  return { nights, subtotal, loyaltyOff, couponOff, total: afterLoyalty - couponOff };
}

/** Count active physical rooms of a type, minus overlapping booked rooms. */
export async function availableRooms(
  roomTypeId: number,
  checkIn: string,
  checkOut: string
): Promise<number> {
  const inv = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rooms)
    .where(and(eq(rooms.roomTypeId, roomTypeId), eq(rooms.status, "active")));
  const totalInventory = inv[0]?.count ?? 0;

  // Strict overlap: existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
  const strict = await db
    .select({ count: sql<number>`coalesce(sum(${bookings.roomsCount}),0)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.roomTypeId, roomTypeId),
        ne(bookings.status, "cancelled"),
        lt(bookings.checkIn, checkOut),
        sql`${bookings.checkOut} > ${checkIn}`
      )
    );
  return Math.max(0, totalInventory - (strict[0]?.count ?? 0));
}

export async function validateCoupon(code: string): Promise<number> {
  if (!code) return 0;
  const rows = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.active, true)))
    .limit(1);
  return rows[0]?.discountPct ?? 0;
}

export const LOYALTY_THRESHOLDS = { silver: 0, gold: 2500, platinum: 10000 } as const;

export function tierForPoints(points: number): "silver" | "gold" | "platinum" {
  if (points >= LOYALTY_THRESHOLDS.platinum) return "platinum";
  if (points >= LOYALTY_THRESHOLDS.gold) return "gold";
  return "silver";
}