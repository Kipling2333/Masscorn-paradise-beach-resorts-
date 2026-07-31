import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, roomTypes, spaServices } from "@/db/schema";
import { asc } from "drizzle-orm";

const money = (n: number) => "$" + n.toLocaleString();

export async function POST(req: Request) {
  let message = "";
  try {
    const body = await req.json();
    message = String(body.message ?? "").toLowerCase();
  } catch {
    return NextResponse.json({ reply: "I didn't quite catch that — could you repeat it?" });
  }

  const has = (...words: string[]) => words.some((w) => message.includes(w));

  /* --------------------------------- payment (before rooms so "pay" is caught) ---- */
  if (has("pay", "payment", "flutterwave", "mobile money", "mpesa", "visa", "mastercard", "charge", "checkout")) {
    return NextResponse.json({
      reply: "We accept payments securely via Flutterwave — Visa, Mastercard, mobile money (M-Pesa, MTN, Airtel), USSD and bank transfers are all supported. When you click 'Reserve & pay via Flutterwave', you'll be redirected to Flutterwave's secure checkout. Once your payment is confirmed, your booking is guaranteed instantly. All currencies are supported.",
    });
  }

  /* ------------------------------- availability ------------------------------ */
  if (has("room", "suite", "villa", "availab", "book", "stay", "price", "weekend", "night")) {
    const types = await db.select().from(roomTypes).orderBy(asc(roomTypes.sortOrder)).limit(6);
    const lines = types.map((t) => `• ${t.name} — from ${money(Number(t.basePrice))}/night, sleeps ${t.capacity}`).join("\n");
    return NextResponse.json({
      reply: `With pleasure — our current collection:\n\n${lines}\n\nEvery rate includes breakfast on your terrace and Paradise Elite member pricing (5–15% off) applies instantly once you sign in. You can check live availability and reserve on the Accommodations page — may I suggest the Honeymoon Villa for something truly unforgettable?`,
    });
  }

  /* --------------------------------- dining --------------------------------- */
  if (has("restaurant", "dinner", "lunch", "eat", "food", "menu", "dining", "table", "wine", "breakfast")) {
    const list = await db.select().from(restaurants).limit(4);
    const lines = list.map((r) => `• ${r.name} — ${r.cuisine} (${r.hours})`).join("\n");
    return NextResponse.json({
      reply: `Tonight the kitchens are in fine form:\n\n${lines}\n\nMy personal recommendation: the catch-of-the-day at Azur, served with coconut-lobster risotto as the tide comes in. Shall I point you to the Dining page to reserve a table?`,
    });
  }

  /* ----------------------------------- spa ----------------------------------- */
  if (has("spa", "massage", "facial", "wellness", "yoga", "treatment", "relax")) {
    const svcs = await db.select().from(spaServices).limit(7);
    const lines = svcs.map((s) => `• ${s.name} — ${s.durationMinutes} min, ${money(Number(s.price))}`).join("\n");
    return NextResponse.json({
      reply: `The spa pavilion reads the tide as well as any sailor. Our rituals:\n\n${lines}\n\nThe Signature Ocean Ritual at sunset is pure poetry. You may reserve on the Spa & Wellness page — mornings book out quickly.`,
    });
  }

  /* --------------------------------- weather --------------------------------- */
  if (has("weather", "rain", "sun", "temperature", "forecast", "hot", "climate")) {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-6.26&longitude=39.47&current_weather=true&hourly=relativehumidity_2m&forecast_days=1",
        { cache: "no-store" }
      );
      const data = await res.json();
      const w = data.current_weather;
      return NextResponse.json({
        reply: `At this very moment over Masscorn Bay: ${Math.round(w.temperature)}°C with a gentle ${Math.round(w.windspeed)} km/h ocean breeze. Expect warm evenings — perfect for dinner on the sand. I keep the full forecast on the Experiences page.`,
      });
    } catch {
      return NextResponse.json({ reply: "The bay is its usual self today — around 29°C, light trade winds and a sky too blue to describe politely." });
    }
  }

  /* -------------------------------- weddings --------------------------------- */
  if (has("wedding", "marry", "marriage", "bride", "groom", "engagement", "honeymoon")) {
    return NextResponse.json({
      reply: "How wonderful — congratulations. Our wedding atelier offers three signature collections: Barefoot Vows (from $9,500), Coral Garden (from $24,000) and The Grand Horizon (from $58,000, up to 200 guests). Ceremonies take place at the Beach Pavilion, Coral Lawn or on a sandbank at low tide. The Weddings page has a private inquiry form — our planners reply within 24 hours.",
    });
  }

  /* ------------------------------- conferences ------------------------------- */
  if (has("conference", "meeting", "corporate", "retreat", "event", "party", "birthday")) {
    return NextResponse.json({
      reply: "The Grand Pavilion seats 300 delegates with an ocean horizon, Boardroom Azur hosts 18 executives, and the Beach Marquee fits 400 for gala evenings. Day-delegate packages begin at $95 per person. Share your dates via the Events page and our events office will compose a proposal within 24 hours.",
    });
  }

  /* --------------------------------- loyalty --------------------------------- */
  if (has("loyalty", "points", "elite", "member", "discount", "club", "tier")) {
    return NextResponse.json({
      reply: "Paradise Elite Club enrols you instantly at Silver — a 5% member rate. Gold (2,500 points) brings 10% off, arrival upgrades and VIP check-in; Platinum (10,000 points) unlocks 15%, suite upgrades and complimentary airport transfers. Points accrue on every night, dinner and spa ritual automatically.",
    });
  }

  /* ------------------------------- attractions ------------------------------- */
  if (has("attract", "nearby", "town", "visit", "see", "tour", "island", "excursion", "do")) {
    return NextResponse.json({
      reply: "Beyond the bay, I adore: Stone Town's carved-door maze (45 min), the Jozani red colobus forest (25 min), spice-farm tastings in the hills, and swimming with dolphins at Kizimkazi at dawn. Our experiences team arranges private guides for each — the Experiences page has the full atelier list.",
    });
  }

  /* --------------------------------- contact --------------------------------- */
  if (has("contact", "phone", "email", "whatsapp", "call", "human", "person")) {
    return NextResponse.json({
      reply: "Of course — our human team: +255 774 000 100, WhatsApp +255 774 000 101, or reservations@masscorn.com. The Contact page also offers an interactive map and a direct note form.",
    });
  }

  /* --------------------------------- greeting -------------------------------- */
  if (has("hello", "hi", "hey", "good morning", "good evening", "bonjour", "salut", "jambo", "hola")) {
    return NextResponse.json({
      reply: "Jambo, and welcome to Masscorn Paradise. I can help with availability and member rates, dining and spa reservations, weddings and conferences, the weather over the bay, or the island's hidden corners. What shall we arrange first?",
    });
  }

  return NextResponse.json({
    reply: "I would be delighted to help. Perhaps ask me about available rooms and member rates, tonight's dining, spa rituals, weddings, conferences, the weather, or island attractions — these are my specialties.",
  });
}
