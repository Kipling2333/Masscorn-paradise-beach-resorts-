import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const COOKIE_NAME = "mp_session";
const SESSION_DAYS = 30;

/* ------------------------------ password utils ------------------------------ */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

/* ------------------------------ session utils ------------------------------- */

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type SessionUser = typeof users.$inferSelect;

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ userId, token: hashToken(token), expiresAt });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, hashToken(token)));
  }
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export function isAdmin(user: SessionUser | null): boolean {
  return !!user && (user.role === "admin" || user.role === "staff");
}

export function bookingReference(): string {
  return "MP-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

export function transactionId(): string {
  return "txn_" + crypto.randomBytes(10).toString("hex");
}

export function loyaltyDiscount(tier: string): number {
  if (tier === "platinum") return 15;
  if (tier === "gold") return 10;
  return 5; // silver
}

export async function notify(
  userId: number,
  subject: string,
  body: string,
  channels: ("email" | "sms")[] = ["email"]
) {
  const { notifications } = await import("@/db/schema");
  await db.insert(notifications).values(
    channels.map((channel) => ({ userId, channel, subject, body, status: "sent" }))
  );
}
