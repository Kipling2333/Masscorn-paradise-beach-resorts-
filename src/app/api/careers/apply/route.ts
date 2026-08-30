import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Ensure this points to your Drizzle DB instance
import { jobApplications } from "@/db/schema"; // Ensure this matches your Drizzle schema export
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  console.log("--> [API] Received career application submission");

  try {
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || "";
    const country = (formData.get("country") as string) || "";
    const department = (formData.get("department") as string) || "";
    const position = (formData.get("position") as string) || "";
    const coverLetter = (formData.get("coverLetter") as string) || "";
    const resumeFile = formData.get("resume") as File | null;

    if (!fullName || !email || !resumeFile) {
      return NextResponse.json(
        { error: "Missing required fields (Full Name, Email, or Resume)." },
        { status: 400 }
      );
    }

    // 1. Insert record into Neon database via Drizzle ORM
    console.log("--> [API] Inserting application into Neon database...");
    await db.insert(jobApplications).values({
      fullName,
      email,
      phone,
      country,
      department,
      position,
      coverLetter,
      resumeUrl: resumeFile.name, // Or your upload URL if using Vercel Blob/S3
      status: "pending",
    });
    console.log("--> [API] Database record saved successfully!");

    // 2. Try sending notification email (isolated so DB insert succeeds regardless)
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log("--> [API] Attempting email notification...");
        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Resort Careers" <${process.env.SMTP_USER}>`,
          to: process.env.HRM_RECEIVING_EMAIL || process.env.SMTP_USER,
          replyTo: email,
          subject: `[New Career Application] ${position} - ${fullName}`,
          text: `New application submitted by ${fullName} (${email}).\nCountry: ${country}\nDepartment: ${department}\nPosition: ${position}\n\nCover Letter:\n${coverLetter}`,
          attachments: [
            {
              filename: resumeFile.name,
              content: buffer,
            },
          ],
        });
        console.log("--> [API] Email sent successfully!");
      } else {
        console.log("--> [API] Skipping email: SMTP environment variables not set.");
      }
    } catch (emailErr: any) {
      console.error("--> [API Warning] Email delivery failed, but DB record was saved:", emailErr?.message);
    }

    return NextResponse.json(
      { message: "Application submitted successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("--> [API Error] Application processing failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process application on the server." },
      { status: 500 }
    );
  }
}