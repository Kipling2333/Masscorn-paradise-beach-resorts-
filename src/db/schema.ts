import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// 1. Media Gallery
export const mediaGallery = pgTable("media_gallery", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  publicId: text("public_id"),
  title: text("title"),
  category: text("category").default("general"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Resort Content (CMS)
export const resortContent = pgTable("resort_content", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").unique(),
  category: text("category").default("general"),
  title: text("title"),
  description: text("description"),
  bodyHtml: text("body_html"),
  price: text("price"),
  imageUrl: text("image_url"),
  badge: text("badge"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Room Types
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  tagline: text("tagline"),
  pricePerNight: integer("price_per_night"),
  basePrice: integer("base_price"),
  capacity: integer("capacity"),
  imageUrl: text("image_url"),
  image: text("image").notNull().default(""),
  amenities: text("amenities"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Reviews / Guest Feedback
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  author: text("author").notNull().default("Guest"),
  name: text("name").notNull().default("Guest"),
  title: text("title").notNull().default("Guest Review"),
  comment: text("comment").notNull().default(""),
  content: text("content").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  userId: integer("user_id"),
  approved: boolean("approved").default(true),
  tier: text("tier").notNull().default("Guest"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username"),
  passwordHash: text("password_hash"),
  role: text("role").default("admin"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  loyaltyTier: text("loyalty_tier").default("Member"),
  loyaltyPoints: integer("loyalty_points").default(0),
  preferredLanguage: text("preferred_language").default("en"),
  preferences: text("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});