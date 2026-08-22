import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/db";
import { mediaGallery } from "@/db/schema";
import { getSessionUser, isAdmin } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "";
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "masscorn_resort" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    const savedImage = await db
      .insert(mediaGallery)
      .values({
        imageUrl: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        title,
        category,
      })
      .returning();

    return NextResponse.json({ message: "Image uploaded successfully", image: savedImage[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}