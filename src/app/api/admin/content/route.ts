import { NextResponse } from "next/server";
import { db } from "@/db";
import { resortContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, isAdmin } from "@/lib/auth";

// GET handler: Fetch content by section_key (Public or Admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionKey = searchParams.get("section") || "about_us";

    const data = await db
      .select()
      .from(resortContent)
      .where(eq(resortContent.sectionKey, sectionKey));

    return NextResponse.json(data[0] || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST handler: Create or Update resort text (Protected: Admin Only)
export async function POST(req: Request) {
  try {
    // 1. Check authentication using your existing auth library
    const user = await getSessionUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Parse request payload
    const { section_key, title, body_html } = await req.json();

    if (!section_key || !title || !body_html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Upsert content into Neon via Drizzle
    const result = await db
      .insert(resortContent)
      .values({
        sectionKey: section_key,
        title,
        bodyHtml: body_html,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: resortContent.sectionKey,
        set: {
          title,
          bodyHtml: body_html,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({
      message: "Content saved successfully",
      data: result[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}