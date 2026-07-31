import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  bookings, favorites, notifications, payments, restaurantReservations, restaurants,
  reviews, roomTypes, spaBookings, spaServices,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myBookings = await db
    .select({ booking: bookings, roomName: roomTypes.name, roomImage: roomTypes.image, roomSlug: roomTypes.slug })
    .from(bookings)
    .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt))
    .limit(30);

  const myPayments = await db
    .select({ payment: payments, reference: bookings.reference, checkIn: bookings.checkIn, checkOut: bookings.checkOut, roomName: roomTypes.name, guests: bookings.guests })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .innerJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(payments.createdAt))
    .limit(30);

  const dining = await db
    .select({ reservation: restaurantReservations, restaurantName: restaurants.name })
    .from(restaurantReservations)
    .innerJoin(restaurants, eq(restaurantReservations.restaurantId, restaurants.id))
    .where(eq(restaurantReservations.userId, user.id))
    .orderBy(desc(restaurantReservations.reservationDate))
    .limit(20);

  const spa = await db
    .select({ booking: spaBookings, serviceName: spaServices.name, duration: spaServices.durationMinutes })
    .from(spaBookings)
    .innerJoin(spaServices, eq(spaBookings.serviceId, spaServices.id))
    .where(eq(spaBookings.userId, user.id))
    .orderBy(desc(spaBookings.appointmentDate))
    .limit(20);

  const favs = await db
    .select({ favorite: favorites, room: roomTypes })
    .from(favorites)
    .innerJoin(roomTypes, eq(favorites.roomTypeId, roomTypes.id))
    .where(eq(favorites.userId, user.id));

  const notes = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  const myReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  return NextResponse.json({
    user: {
      id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role,
      loyaltyTier: user.loyaltyTier, loyaltyPoints: user.loyaltyPoints, createdAt: user.createdAt,
    },
    bookings: myBookings,
    payments: myPayments,
    dining,
    spa,
    favorites: favs,
    notifications: notes,
    reviews: myReviews,
  });
}
