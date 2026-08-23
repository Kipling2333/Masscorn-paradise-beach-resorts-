CREATE TABLE "concierge_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"guest_name" text,
	"request_type" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"public_id" text,
	"title" text,
	"category" text DEFAULT 'general',
	"uploaded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resort_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_key" text,
	"category" text DEFAULT 'general',
	"title" text,
	"description" text,
	"body_html" text,
	"price" text,
	"image_url" text,
	"badge" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "resort_content_section_key_unique" UNIQUE("section_key")
);
--> statement-breakpoint
ALTER TABLE "event_inquiries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "favorites" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "restaurant_reservations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "restaurants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "event_inquiries" CASCADE;--> statement-breakpoint
DROP TABLE "events" CASCADE;--> statement-breakpoint
DROP TABLE "favorites" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "payments" CASCADE;--> statement-breakpoint
DROP TABLE "restaurant_reservations" CASCADE;--> statement-breakpoint
DROP TABLE "restaurants" CASCADE;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_reference_unique";--> statement-breakpoint
ALTER TABLE "room_types" DROP CONSTRAINT "room_types_slug_unique";--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_room_type_id_room_types_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_room_type_id_room_types_id_fk";
--> statement-breakpoint
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_room_type_id_room_types_id_fk";
--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP CONSTRAINT "spa_bookings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP CONSTRAINT "spa_bookings_service_id_spa_services_id_fk";
--> statement-breakpoint
DROP INDEX "bookings_user_idx";--> statement-breakpoint
DROP INDEX "bookings_dates_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "check_in" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "check_out" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'confirmed';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "title" SET DEFAULT 'Guest Review';--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "comment" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "approved" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "approved" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "tagline" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "base_price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "base_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "capacity" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "capacity" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "image" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "amenities" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "amenities" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "amenities" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ALTER COLUMN "sort_order" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "room_number" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "status" SET DEFAULT 'confirmed';--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "spa_bookings" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "spa_services" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "spa_services" ALTER COLUMN "duration_minutes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "spa_services" ALTER COLUMN "price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "spa_services" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "loyalty_tier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "loyalty_tier" SET DEFAULT 'Member';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "loyalty_tier" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "loyalty_points" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferred_language" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferred_language" SET DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferred_language" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferences" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferences" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guest_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guest_email" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total_price" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "author" text DEFAULT 'Guest' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "name" text DEFAULT 'Guest' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "tier" text DEFAULT 'Guest' NOT NULL;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "price_per_night" integer;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "room_types" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "spa_bookings" ADD COLUMN "booking_date" text NOT NULL;--> statement-breakpoint
ALTER TABLE "spa_services" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "reference";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "guests";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "coupon_code";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "booking_type";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "payment_status";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "special_requests";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "airport_pickup";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "room_type_id";--> statement-breakpoint
ALTER TABLE "room_types" DROP COLUMN "size_sqm";--> statement-breakpoint
ALTER TABLE "room_types" DROP COLUMN "bed_type";--> statement-breakpoint
ALTER TABLE "room_types" DROP COLUMN "view_type";--> statement-breakpoint
ALTER TABLE "room_types" DROP COLUMN "featured";--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP COLUMN "appointment_date";--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP COLUMN "appointment_time";--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP COLUMN "therapist";--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP COLUMN "guests";--> statement-breakpoint
ALTER TABLE "spa_bookings" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "spa_services" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "spa_services" DROP COLUMN "image";