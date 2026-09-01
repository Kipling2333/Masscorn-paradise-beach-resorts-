CREATE TABLE "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"country" text NOT NULL,
	"department" text NOT NULL,
	"position" text NOT NULL,
	"cover_letter" text,
	"resume_url" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurant_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer,
	"user_id" integer,
	"guest_name" text,
	"reservation_date" text NOT NULL,
	"party_size" integer DEFAULT 2,
	"status" text DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"user_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"event_date" text,
	"guest_count" integer,
	"message" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" text,
	"location" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"type" text DEFAULT 'info',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"user_id" integer,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'completed',
	"provider" text DEFAULT 'flutterwave',
	"transaction_ref" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cuisine" text,
	"opening_hours" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
