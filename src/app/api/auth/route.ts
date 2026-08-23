import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createSession, destroySession, getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

function safeUser(u: typeof users.$inferSelect) {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
    loyaltyTier: u.loyaltyTier, loyaltyPoints: u.loyaltyPoints,
    preferredLanguage: u.preferredLanguage, createdAt: u.createdAt,
  };
}

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user: user ? safeUser(user) : null });
  } catch (err) {
    console.warn("Database offline during session check", err);
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const action = String(body.action ?? "");

  try {
    if (action === "logout") {
      await destroySession();
      return NextResponse.json({ ok: true });
    }

    if (action === "register") {
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const phone = String(body.phone ?? "").trim() || null;
      const password = String(body.password ?? "");
      
      if (!name || !email.includes("@") || password.length < 8) {
        return NextResponse.json({ error: "Please provide a name, a valid email and a password of 8+ characters." }, { status: 400 });
      }
      
      const existing = await db.select({ id: users.id }).from(users).where(eq(sql`lower(${users.email})`, email)).limit(1);
      if (existing.length) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      
      const [created] = await db
        .insert(users)
        .values({ name, email, phone, passwordHash: hashPassword(password), role: "guest", loyaltyTier: "silver", loyaltyPoints: 0 })
        .returning();
        
      await createSession(created.id);
      return NextResponse.json({ user: safeUser(created) });
    }

    if (action === "profile") {
      const user = await getSessionUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      
      const name = String(body.name ?? "").trim().slice(0, 160);
      const phone = String(body.phone ?? "").trim().slice(0, 40) || null;
      const preferredLanguage = ["en", "fr", "ar"].includes(String(body.preferredLanguage))
        ? String(body.preferredLanguage) : user.preferredLanguage;
        
      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      
      await db.update(users).set({ name, phone, preferredLanguage }).where(eq(users.id, user.id));
      return NextResponse.json({ ok: true });
    }

    if (action === "login") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      
      const rows = await db.select().from(users).where(eq(sql`lower(${users.email})`, email)).limit(1);
      const user = rows[0];
      
      // Fixed: Added `user.passwordHash ?? ""` to prevent passing null to verifyPassword
      if (!user || !verifyPassword(password, user.passwordHash ?? "")) {
        return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
      }
      
      await createSession(user.id);
      return NextResponse.json({ user: safeUser(user) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Auth Route Critical Error:", err);
    return NextResponse.json(
      { error: "A database error occurred. Please verify your connection." },
      { status: 500 }
    );
  }
}