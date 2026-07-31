/* Masscorn Paradise — database seed */
import { Pool } from "pg";
import crypto from "node:crypto";
import { config } from "dotenv";

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const q = (text, params) => pool.query(text, params);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function iso(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

const pick = (arr, i) => arr[i % arr.length];

async function main() {
  console.log("› clearing existing data…");
  await q(`TRUNCATE TABLE notifications, favorites, reviews, event_inquiries, events,
    spa_bookings, spa_services, restaurant_reservations, restaurants, coupons,
    payments, bookings, rooms, room_types, sessions, users RESTART IDENTITY CASCADE`);

  /* --------------------------------- users --------------------------------- */
  console.log("› users…");
  const pw = hashPassword("paradise2026");
  const userRows = await q(
    `INSERT INTO users (name, email, phone, password_hash, role, loyalty_tier, loyalty_points, created_at)
     VALUES
       ('Zahra Masscorn','admin@masscorn.com','+255774000100',$1,'admin','platinum',12500, NOW() - INTERVAL '380 days'),
       ('Amelia Fortune','guest@masscorn.com','+15550101010',$1,'guest','gold',3240, NOW() - INTERVAL '210 days'),
       ('Jean-Luc Moreau','jl.moreau@example.com','+33655501234',$1,'guest','silver',540, NOW() - INTERVAL '150 days'),
       ('Priya Raghavan','priya.r@example.com','+918855001100',$1,'guest','platinum',11200, NOW() - INTERVAL '120 days'),
       ('Omar El-Sayed','omar.elsayed@example.com','+971555001122',$1,'guest','gold',2780, NOW() - INTERVAL '90 days'),
       ('Sofia Delacroix','sofia.d@example.com','+33655507788',$1,'guest','silver',180, NOW() - INTERVAL '40 days')
     RETURNING id, email`,
    [pw]
  );
  const users = userRows.rows;
  const adminId = users.find((u) => u.email === "admin@masscorn.com").id;
  const guestIds = users.filter((u) => u.email !== "admin@masscorn.com").map((u) => u.id);
  const demoGuestId = users.find((u) => u.email === "guest@masscorn.com").id;

  /* --------------------------------- rooms --------------------------------- */
  console.log("› room types & inventory…");
  const types = [
    { slug: "ocean-view-room", name: "Ocean View Room", tagline: "Awaken to the horizon", base: 420, cap: 2, size: 52, bed: "King", count: 24, img: "/images/room-ocean.jpg",
      desc: "Perched along the upper crescent, each Ocean View Room frames the lagoon through floor-to-ceiling glass. A deep terrazzo soaking tub, hand-loomed textiles and a private terrace daybed complete the ritual of slow mornings.", am: ["Ocean-facing terrace", "Terrazzo soaking tub", "Rainforest shower", "Nespresso & tea atelier", "Silent climate control", "Daily breakfast on terrace"] },
    { slug: "deluxe-suite", name: "Deluxe Suite", tagline: "Space to breathe", base: 680, cap: 3, size: 78, bed: "King + Daybed", count: 16, img: "/images/suite.jpg",
      desc: "A generous salon flows into a sea-gazing bedroom, with a reading nook by the window and a walk-in wardrobe of scented cedar. Evening turndown arrives with spiced chocolate and the sound of distant taarab.", am: ["Separate living salon", "Window reading nook", "Cedar walk-in wardrobe", "Double vanity bathroom", "Private bar cabinet", "Turndown ritual"] },
    { slug: "executive-suite", name: "Executive Suite", tagline: "Work, suspended above water", base: 920, cap: 2, size: 96, bed: "King", count: 10, img: "/images/suite.jpg",
      desc: "For those who bring the world with them — a dedicated study with ocean sightlines, concealed meeting screen, and a lounge that converts for private dinners for six.", am: ["Ocean-view study", "Private dining for six", "Concealed AV suite", "Espresso bar", "Garment pressing", "Late checkout priority"] },
    { slug: "family-villa", name: "Family Villa", tagline: "Two generations, one tide", base: 1450, cap: 6, size: 180, bed: "2 King + 2 Twin", count: 6, img: "/images/villa.jpg",
      desc: "Two pavilions joined by a shaded courtyard pool — grandparents, children and sandy feet all at home. A private chef on call and a games trunk curated by our younger guests in chief.", am: ["Two private pavilions", "Courtyard plunge pool", "Private chef on call", "Children's adventure trunk", "Outdoor shower garden", "Beach pathway"] },
    { slug: "presidential-villa", name: "Presidential Villa", tagline: "The crest of the bay", base: 3800, cap: 8, size: 420, bed: "3 King + 2 Twin", count: 2, img: "/images/suite.jpg",
      desc: "The estate within the estate: three suites, a 25-metre infinity edge, cinema salon, study, gym and a staff of six including private chef and sommelier. Arrivals by dhow or helicopter, as you wish.", am: ["25m infinity pool", "Cinema salon & gym", "Private chef & sommelier", "Dedicated butler team", "Helipad coordination", "Full privacy crescent"] },
    { slug: "honeymoon-villa", name: "Honeymoon Villa", tagline: "For two, at the edge of blue", base: 2150, cap: 2, size: 150, bed: "Four-poster King", count: 4, img: "/images/villa.jpg",
      desc: "A villa built entirely around a view: the bed, the bath and the pool all face the open ocean. Champagne arrives chilled at sunset without being asked for twice.", am: ["Overwater-style deck", "Sunset-facing soaking bath", "Private plunge pool", "Daily champagne ritual", "Couples spa credit", "Star-bed on the deck"] },
  ];

  const typeIds = [];
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const r = await q(
      `INSERT INTO room_types (slug, name, tagline, description, base_price, capacity, size_sqm, bed_type, view_type, image, amenities, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Ocean',$9,$10,$11,$12) RETURNING id`,
      [t.slug, t.name, t.tagline, t.desc, t.base, t.cap, t.size, t.bed, t.img, JSON.stringify(t.am), i < 3, i]
    );
    const id = r.rows[0].id;
    typeIds.push({ id, base: t.base, name: t.name });
    const prefix = (i + 1).toString();
    for (let n = 1; n <= t.count; n++) {
      const num = `${prefix}${String(n).padStart(2, "0")}`;
      await q(`INSERT INTO rooms (room_type_id, room_number, status) VALUES ($1,$2,'active')`, [id, num]);
    }
  }

  /* --------------------------------- coupons --------------------------------- */
  await q(`INSERT INTO coupons (code, discount_pct, active) VALUES ('PARADISE10',10,true),('ELOPE15',15,true),('ELITE5',5,true)`);

  /* ------------------------------- restaurants ------------------------------- */
  console.log("› restaurants…");
  const restaurantData = [
    { slug: "the-shore", name: "The Shore", cuisine: "Beach Restaurant · All-day coastal", hours: "07:00 – 22:00",
      desc: "Feet in sand, eyes on the tide. Breakfast unfolds with tropical fruit towers and Swahili beignets; lunches drift toward grilled lobster flatbreads beneath the palm canopy.",
      menu: JSON.stringify([
        { course: "Morning", items: [{ name: "Spice Island Breakfast", price: 28 }, { name: "Coconut Chia & Mango", price: 18 }] },
        { course: "Afternoon", items: [{ name: "Lobster Flatbread", price: 34 }, { name: "Zanzibar Caesar, grilled lime", price: 24 }] },
      ]) },
    { slug: "azur-seafood", name: "Azur", cuisine: "Seafood · Night-fresh catch", hours: "18:30 – 22:30",
      desc: "Fishermen land the catch at our jetty at five; by seven it is on your plate. A temple of open flame, charcoal and citrus set directly on the waterline.",
      menu: JSON.stringify([
        { course: "Signature", items: [{ name: "Charcoal Octopus, tamarind glaze", price: 42 }, { name: "Coconut-Lobster Risotto", price: 54 }] },
        { course: "From the coals", items: [{ name: "Whole Red Snapper, spiced salt", price: 68 }, { name: "King Prawns, pilipili butter", price: 46 }] },
      ]) },
    { slug: "skyline-rooftop", name: "Skyline", cuisine: "Rooftop Lounge · Mixology", hours: "17:00 – 00:30",
      desc: "The highest point of the bay — a roof garden of copper stills, rare rums and a 270° horizon. Sunset is standing-room-only poetry.",
      menu: JSON.stringify([
        { course: "Cocktails", items: [{ name: "Masscorn Old Fashioned", price: 21 }, { name: "Hibiscus & Cardamom Spritz", price: 19 }] },
        { course: "Small plates", items: [{ name: "Yellowfin Tataki, wasabi leaf", price: 29 }, { name: "Truffle & Halloumi Skewers", price: 24 }] },
      ]) },
    { slug: "lagoon-pool-bar", name: "The Lagoon Bar", cuisine: "Pool Bar · Slow afternoons", hours: "10:00 – 18:00",
      desc: "Swim up, drift off, repeat. Cold-pressed juices, single-origin iced coffees and plates small enough for a lounger.",
      menu: JSON.stringify([
        { course: "Refresh", items: [{ name: "Watermelon, lime & kaffir", price: 14 }, { name: "Cold Brew Coconut Latte", price: 12 }] },
        { course: "Lounger plates", items: [{ name: "Prawn Tacos, mango salsa", price: 22 }, { name: "Poke of the Day", price: 26 }] },
      ]) },
  ];
  const restIds = [];
  for (const r of restaurantData) {
    const res = await q(
      `INSERT INTO restaurants (slug, name, cuisine, description, image, hours, menu) VALUES ($1,$2,$3,$4,'/images/dining.jpg',$5,$6) RETURNING id`,
      [r.slug, r.name, r.cuisine, r.desc, r.hours, r.menu]
    );
    restIds.push(res.rows[0].id);
  }

  /* ------------------------------- spa services ------------------------------ */
  console.log("› spa services…");
  const spaData = [
    { name: "Signature Ocean Ritual", cat: "Massage", dur: 90, price: 180, desc: "Warm cowrie shells and long tide-stroke massage beneath the pavilion roof, ending with a marine mineral facial mist." },
    { name: "Deep Tissue Voyage", cat: "Massage", dur: 75, price: 150, desc: "Slow, deliberate pressure along the meridians — designed for post-flight shoulders and sun-drenched backs." },
    { name: "Hot Stone & Spice", cat: "Massage", dur: 90, price: 165, desc: "Basalt stones warmed in clove and cinnamon oil, placed along the spine as the sea keeps time." },
    { name: "Radiance Marine Facial", cat: "Facial", dur: 60, price: 140, desc: "Algae, pearl extract and cold gua-sha stones to rebuild the glow the sun borrowed." },
    { name: "Couples Sunset Ceremony", cat: "Couples", dur: 120, price: 320, desc: "Two therapists, one pavilion, the horizon turning amber. Champagne and a petal bath follow." },
    { name: "Sunrise Yoga on the Jetty", cat: "Yoga", dur: 60, price: 45, desc: "Salutations at 06:30 as fishermen glide past. Mats, silence and lemongrass tea included." },
    { name: "Wellness Day Package", cat: "Package", dur: 240, price: 390, desc: "Yoga, ritual massage, marine facial and a wagamama-of-the-sea lunch — a full day given to yourself." },
  ];
  const spaIds = [];
  for (const s of spaData) {
    const res = await q(
      `INSERT INTO spa_services (name, category, duration_minutes, price, description, image) VALUES ($1,$2,$3,$4,$5,'/images/spa.jpg') RETURNING id`,
      [s.name, s.cat, s.dur, s.price, s.desc]
    );
    spaIds.push({ id: res.rows[0].id, price: s.price });
  }

  /* --------------------------------- events --------------------------------- */
  console.log("› events…");
  const eventData = [
    { t: "Full Moon Beach Gathering", ty: "beach_party", v: "Beach Marquee", d: 18, c: 400, p: 40, img: "/images/dining.jpg", desc: "Bonfires, taarab fusion and barefoot dancing as the moon climbs from the lagoon." },
    { t: "Sunset Jazz on the Jetty", ty: "celebration", v: "The Jetty", d: 11, c: 120, p: 25, img: "/images/cruise.jpg", desc: "A quartet at golden hour with a raw bar and champagne sabrage." },
    { t: "Wine & Tide — Sommelier Table", ty: "celebration", v: "Azur", d: 25, c: 24, p: 180, img: "/images/dining.jpg", desc: "Seven pours, seven courses, one unbroken horizon." },
    { t: "Island Wellness Retreat", ty: "wellness", v: "Spa Pavilions", d: 40, c: 30, p: 1450, img: "/images/spa.jpg", desc: "Three nights of yoga, ritual spa journeys and lagoon nutrition with our resident practitioner." },
    { t: "Ocean Leadership Summit", ty: "conference", v: "Grand Pavilion", d: 55, c: 300, p: 0, img: "/images/conference.jpg", desc: "A two-day corporate summit with breakaway cabanas and gala dinner on the sand." },
  ];
  for (const e of eventData) {
    await q(
      `INSERT INTO events (title, event_type, venue, event_date, capacity, price, description, image, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'upcoming')`,
      [e.t, e.ty, e.v, iso(e.d), e.c, e.p, e.desc.replace("a.raw", "a raw"), e.img]
    );
  }

  /* --------------------------------- bookings -------------------------------- */
  console.log("› bookings, payments & notifications…");
  const methods = ["card", "card", "mobilemoney", "banktransfer", "flutterwave"];
  let made = 0;
  const ranges = [
    // [userIdx, typeIdx, dayOffset, nights, status]
    [1, 0, -230, 5, "completed"], [2, 1, -205, 4, "completed"], [3, 4, -190, 7, "completed"],
    [4, 2, -176, 3, "completed"], [1, 5, -160, 6, "completed"], [0, 3, -150, 4, "completed"],
    [5, 0, -132, 2, "completed"], [3, 1, -118, 5, "completed"], [2, 2, -104, 4, "completed"],
    [1, 4, -95, 8, "completed"], [4, 3, -82, 3, "completed"], [0, 1, -70, 5, "completed"],
    [5, 5, -61, 4, "completed"], [3, 0, -48, 6, "completed"], [1, 1, -39, 3, "completed"],
    [2, 4, -30, 5, "completed"], [0, 2, -21, 4, "completed"], [4, 5, -14, 2, "completed"],
    [1, 0, 6, 4, "confirmed"], [3, 5, 12, 5, "confirmed"], [2, 1, 20, 3, "confirmed"],
    [5, 3, 27, 6, "confirmed"], [0, 4, 34, 7, "confirmed"], [4, 0, -8, 3, "cancelled"],
    [1, 2, 48, 4, "confirmed"], [3, 1, 62, 3, "confirmed"],
  ];
  for (let i = 0; i < ranges.length; i++) {
    const [u, t, off, n, status] = ranges[i];
    const userId = u === 0 ? demoGuestId : guestIds[u % guestIds.length];
    const type = typeIds[t];
    const seasonal = (d) => {
      const m = d.getMonth();
      return m === 11 || m === 0 || m === 1 || m === 6 || m === 7 ? 1.25 : m >= 2 && m <= 4 || m === 8 ? 1.1 : 1;
    };
    let total = 0;
    for (let k = 0; k < n; k++) total += type.base * seasonal(new Date(Date.now() + (off + k) * 86400000));
    total = Math.round(total * 100) / 100;
    const ref = "MP-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const ci = iso(off);
    const co = iso(off + n);
    const bq = await q(
      `INSERT INTO bookings (reference, user_id, room_type_id, check_in, check_out, guests, rooms_count, total_amount, status, payment_status, booking_type, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,1,$7,$8,$9,$10,$11) RETURNING id`,
      [ref, userId, type.id, ci, co, 1 + (i % 3), total, status, status === "cancelled" ? "refunded" : "paid",
       i % 6 === 5 ? "corporate" : i % 4 === 3 ? "package" : "standard", new Date(Date.now() + (off - 9) * 86400000)]
    );
    await q(
      `INSERT INTO payments (booking_id, amount, method, transaction_id, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [bq.rows[0].id, total, pick(methods, i), "txn_" + crypto.randomBytes(10).toString("hex"), status === "cancelled" ? "refunded" : "completed", new Date(Date.now() + (off - 9) * 86400000)]
    );
    await q(
      `INSERT INTO notifications (user_id, channel, subject, body, status, created_at)
       VALUES ($1,'email',$2,$3,'sent',$4),($1,'sms',$2,$5,'sent',$4)`,
      [userId, `Reservation ${status === "cancelled" ? "cancelled" : "confirmed"} — ${ref}`,
       `Your stay in ${type.name} (${ci} → ${co}) — $${total.toLocaleString()}. We look forward to welcoming you to the bay.`,
       new Date(Date.now() + (off - 9) * 86400000),
       `${ref} ${status} · ${type.name} ${ci}→${co} · $${total.toLocaleString()} · Masscorn Paradise`]
    );
    made++;
  }
  console.log(`  · ${made} bookings`);

  /* --------------------------- dining & spa for guests ------------------------ */
  const diningSeeds = [
    [demoGuestId, restIds[1], 8, "19:30", 2], [demoGuestId, restIds[2], 13, "19:00", 2],
    [guestIds[2], restIds[0], 3, "12:30", 4], [guestIds[3], restIds[1], -40, "20:00", 2],
    [guestIds[4], restIds[3], 5, "13:00", 3], [demoGuestId, restIds[0], -60, "19:30", 2],
  ];
  for (let i = 0; i < diningSeeds.length; i++) {
    const [u, r, off, t, g] = diningSeeds[i];
    await q(
      `INSERT INTO restaurant_reservations (user_id, restaurant_id, table_number, reservation_date, reservation_time, guests, occasion, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed')`,
      [u, r, 4 + i, iso(off), t, g, i % 2 ? "Anniversary" : null]
    );
  }
  const spaSeeds = [
    [demoGuestId, spaIds[0].id, 9, "10:00", "Amara K.", 1], [demoGuestId, spaIds[5].id, 10, "06:30", "No preference", 2],
    [guestIds[3], spaIds[4].id, -35, "17:00", "Leila N.", 2], [guestIds[2], spaIds[1].id, 4, "15:00", "Yusuf M.", 1],
  ];
  for (const [u, s, off, t, th, g] of spaSeeds) {
    const svc = spaIds.find((x) => x.id === s);
    await q(
      `INSERT INTO spa_bookings (user_id, service_id, appointment_date, appointment_time, therapist, guests, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed')`,
      [u, s, iso(off), t, th, g, svc.price * g]
    );
  }

  /* -------------------------------- favorites -------------------------------- */
  await q(`INSERT INTO favorites (user_id, room_type_id) VALUES ($1,$2),($1,$3)`, [demoGuestId, typeIds[5].id, typeIds[3].id]);

  /* --------------------------------- reviews --------------------------------- */
  console.log("› reviews…");
  const reviewData = [
    [demoGuestId, 5, "A slice of heaven", "We arrived as guests and left as family. The sandbank breakfast alone justifies the flight — I have never been so gently, thoroughly cared for.", true],
    [guestIds[1], 5, "Beyond five stars", "Our butler remembered my daughter's love of starfish and arranged a private reef walk with a marine biologist. Where else does that happen?", true],
    [guestIds[2], 5, "The quietest luxury", "No lobby, no queues, no noise — just the bay, the light and people who seem to anticipate thoughts. The Presidential Villa is worth every cent.", true],
    [guestIds[3], 5, "Wedding of our dreams", "One hundred and twenty guests and not a single wrong note. The Coral Lawn at dusk is the most beautiful place on earth to make promises.", true],
    [guestIds[4], 4, "Very nearly perfect", "The Ocean Ritual at the spa rearranged my priorities in ninety minutes. Restaurant booking slots fill quickly at peak — plan ahead.", true],
    [guestIds[4], 5, "Honeymoon, perfected", "Champagne appeared at sunset without a word being exchanged. The villa's star-bed made us miss our own wedding night, happily.", true],
    [guestIds[2], 5, "Conference that felt like a reward", "Our board still talks about the summit. Minutes in the morning, dhows by four. Productivity through the roof.", false],
  ];
  for (const [u, r, t, c, a] of reviewData) {
    await q(`INSERT INTO reviews (user_id, rating, title, comment, approved) VALUES ($1,$2,$3,$4,$5)`, [u, r, t, c, a]);
  }

  /* --------------------------------- inquiries -------------------------------- */
  await q(
    `INSERT INTO event_inquiries (user_id, name, email, phone, event_type, preferred_date, guests, budget, message, status)
     VALUES
       (NULL,'Clara Whitfield','clara.w@example.com','+447700900123','wedding',$1,110,'$45,000','We dream of a ceremony on the sandbank at low tide with a dhow arrival for the groom.','new'),
       ($2,'TechFront Ltd','events@techfront.io',NULL,'corporate_retreat',$3,60,'$80,000','Annual leadership retreat — 3 nights, breakaway sessions and a closing gala.','in_review'),
       (NULL,'Nadia Bakari','nadia.b@example.com','+255755001244','birthday',$4,35,'$8,000','50th birthday dinner with live taarab band on Coral Lawn.','confirmed')`,
    [iso(120), demoGuestId, iso(75), iso(30)]
  );

  console.log("✓ seed complete");
  console.log("  admin:  admin@masscorn.com / paradise2026");
  console.log("  guest:  guest@masscorn.com / paradise2026");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
