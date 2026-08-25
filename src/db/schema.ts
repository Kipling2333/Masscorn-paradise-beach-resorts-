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

// 4. Physical Rooms Inventory
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomTypeId: integer("room_type_id").notNull(),
  roomNumber: text("room_number").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  roomTypeId: integer("room_type_id").notNull(),
  userId: integer("user_id"),
  guestName: text("guest_name"),
  guestEmail: text("guest_email"),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  roomsCount: integer("rooms_count").notNull().default(1),
  status: text("status").notNull().default("confirmed"),
  totalPrice: integer("total_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Coupons
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPct: integer("discount_pct").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. Concierge Requests
export const conciergeRequests = pgTable("concierge_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  guestName: text("guest_name"),
  requestType: text("request_type").notNull(),
  details: text("details"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Spa Services & Bookings
export const spaServices = pgTable("spa_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  createdAt: timestamp("created_at").defaultNow(),
});

export const spaBookings = pgTable("spa_bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  userId: integer("user_id"),
  bookingDate: text("booking_date").notNull(),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 9. Reviews / Guest Feedback
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

// 10. Sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 11. Users
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