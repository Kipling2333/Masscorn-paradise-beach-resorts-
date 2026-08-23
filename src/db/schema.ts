import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// 1. Media Gallery (Vercel Blob storage links)
export const mediaGallery = pgTable("media_gallery", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  publicId: text("public_id"),
  title: text("title"),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Resort Content (Dynamic CMS items for all sections)
export const resortContent = pgTable("resort_content", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").unique(), // Matches admin route lookup
  category: text("category").notNull(), 
  title: text("title").notNull(),
  description: text("description"),
  bodyHtml: text("body_html"), // Matches admin update route
  price: text("price"),
  imageUrl: text("image_url"),
  badge: text("badge"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Room Types (Accommodations page data)
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pricePerNight: integer("price_per_night"),
  capacity: integer("capacity"),
  imageUrl: text("image_url"),
  amenities: text("amenities"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Reviews / Guest Feedback
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Users & Guest Profiles (Matches admin auth route requirements)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  loyaltyTier: text("loyalty_tier").default("Member"),
  loyaltyPoints: integer("loyalty_points").default(0),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});