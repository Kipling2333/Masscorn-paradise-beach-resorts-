import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { mediaGallery } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "";
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload directly to Vercel Blob CDN
    const blob = await put(`gallery/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // Save permanent CDN URL to Neon DB
    const newImage = await db
      .insert(mediaGallery)
      .values({
        imageUrl: blob.url,
        publicId: blob.pathname,
        title,
        category,
      })
      .returning();

    return NextResponse.json({ message: "Image uploaded permanently!", image: newImage[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}