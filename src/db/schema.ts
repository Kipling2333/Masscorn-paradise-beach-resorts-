import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ---------------------------------- users ---------------------------------- */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("guest"), // guest | staff | admin
    loyaltyTier: varchar("loyalty_tier", { length: 20 }).notNull().default("silver"), // silver | gold | platinum
    loyaltyPoints: integer("loyalty_points").notNull().default(0),
    preferredLanguage: varchar("preferred_language", { length: 8 }).notNull().default("en"),
    preferences: jsonb("preferences").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_idx").on(t.token)]
);

/* ---------------------------------- rooms ---------------------------------- */

export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  tagline: varchar("tagline", { length: 200 }),
  description: text("description").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull().default(2),
  sizeSqm: integer("size_sqm").notNull().default(45),
  bedType: varchar("bed_type", { length: 80 }).notNull().default("King"),
  viewType: varchar("view_type", { length: 80 }).notNull().default("Ocean"),
  image: varchar("image", { length: 300 }).notNull().default("/images/hero.jpg"),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomTypeId: integer("room_type_id")
    .notNull()
    .references(() => roomTypes.id, { onDelete: "cascade" }),
  roomNumber: varchar("room_number", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active | maintenance
});

/* --------------------------------- bookings --------------------------------- */

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomTypes.id),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    guests: integer("guests").notNull().default(2),
    roomsCount: integer("rooms_count").notNull().default(1),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    bookingType: varchar("booking_type", { length: 20 }).notNull().default("standard"), // standard | group | package | corporate
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | confirmed | cancelled | completed
    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"), // unpaid | paid | refunded
    specialRequests: text("special_requests"),
    airportPickup: boolean("airport_pickup").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bookings_user_idx").on(t.userId),
    index("bookings_dates_idx").on(t.roomTypeId, t.checkIn, t.checkOut),
  ]
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: varchar("method", { length: 30 }).notNull().default("flutterwave"), // flutterwave | card | mobilemoney | banktransfer | ussd
  transactionId: varchar("transaction_id", { length: 80 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"), // completed | failed | refunded
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  discountPct: integer("discount_pct").notNull(),
  active: boolean("active").notNull().default(true),
});

/* --------------------------------- dining ---------------------------------- */

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  cuisine: varchar("cuisine", { length: 120 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 300 }).notNull().default("/images/dining.jpg"),
  hours: varchar("hours", { length: 120 }).notNull().default("18:30 – 22:30"),
  menu: jsonb("menu").$type<{ course: string; items: { name: string; price: number }[] }[]>().notNull().default([]),
});

export const restaurantReservations = pgTable("restaurant_reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurants.id),
  tableNumber: integer("table_number"),
  reservationDate: date("reservation_date").notNull(),
  reservationTime: varchar("reservation_time", { length: 10 }).notNull(),
  guests: integer("guests").notNull().default(2),
  occasion: varchar("occasion", { length: 120 }),
  specialMeals: text("special_meals"),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // confirmed | cancelled | completed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ----------------------------------- spa ----------------------------------- */

export const spaServices = pgTable("spa_services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  category: varchar("category", { length: 60 }).notNull().default("Massage"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 300 }).notNull().default("/images/spa.jpg"),
});

export const spaBookings = pgTable("spa_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceId: integer("service_id")
    .notNull()
    .references(() => spaServices.id),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: varchar("appointment_time", { length: 10 }).notNull(),
  therapist: varchar("therapist", { length: 80 }),
  guests: integer("guests").notNull().default(1),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------------------------- events ---------------------------------- */

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  eventType: varchar("event_type", { length: 40 }).notNull().default("celebration"), // wedding | conference | birthday | beach_party | corporate_retreat | wellness
  venue: varchar("venue", { length: 140 }).notNull().default("Grand Pavilion"),
  eventDate: date("event_date").notNull(),
  capacity: integer("capacity").notNull().default(50),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  description: text("description").notNull(),
  image: varchar("image", { length: 300 }).notNull().default("/images/aerial.jpg"),
  status: varchar("status", { length: 20 }).notNull().default("upcoming"),
});

export const eventInquiries = pgTable("event_inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  eventType: varchar("event_type", { length: 40 }).notNull(),
  preferredDate: date("preferred_date"),
  guests: integer("guests").notNull().default(50),
  budget: varchar("budget", { length: 60 }),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("new"), // new | in_review | confirmed | declined
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ reviews & misc ------------------------------ */

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roomTypeId: integer("room_type_id").references(() => roomTypes.id, { onDelete: "set null" }),
  rating: integer("rating").notNull().default(5),
  title: varchar("title", { length: 160 }),
  comment: text("comment").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomTypes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("favorites_user_room_idx").on(t.userId, t.roomTypeId)]
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  channel: varchar("channel", { length: 10 }).notNull().default("email"), // email | sms
  subject: varchar("subject", { length: 200 }).notNull(),
  body: text("body").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------------- CMS ------------------------------------ */

export const resortContent = pgTable("resort_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionKey: varchar("section_key", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaGallery = pgTable("media_gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  publicId: varchar("public_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  category: varchar("category", { length: 50 }).default("general"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});