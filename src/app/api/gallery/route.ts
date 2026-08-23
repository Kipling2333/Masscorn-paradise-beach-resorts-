import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaGallery } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const images = await db
      .select()
      .from(mediaGallery)
      .orderBy(desc(mediaGallery.id));

    return NextResponse.json({ images });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}