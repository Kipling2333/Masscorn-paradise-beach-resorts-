import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import Chrome from "@/components/chrome";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://masscorn-paradise.vercel.app"),
  title: {
    default: "Masscorn Paradise Beach Resort — Ultra-Luxury Beachfront Sanctuary",
    template: "%s · Masscorn Paradise",
  },
  description:
    "Masscorn Paradise Beach Resort — a private 2.4 km ivory-sand sanctuary with signature villas, five-star dining, an oceanfront spa, destination weddings and curated experiences on the edge of the Indian Ocean.",
  keywords: [
    "luxury beach resort", "beachfront villas", "honeymoon villa", "destination wedding resort",
    "ocean view suites", "luxury spa resort", "conference resort", "Masscorn Paradise",
  ],
  openGraph: {
    type: "website",
    siteName: "Masscorn Paradise Beach Resort",
    title: "Masscorn Paradise Beach Resort",
    description: "Barefoot luxury, redefined — private villas, oceanfront dining and curated ocean experiences.",
    images: [{ url: "/images/hero.jpg", width: 1600, height: 900, alt: "Masscorn Paradise Beach Resort aerial" }],
  },
  twitter: { card: "summary_large_image", title: "Masscorn Paradise Beach Resort", images: ["/images/hero.jpg"] },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-ivory font-body text-ink antialiased">
        <LanguageProvider>
          <Chrome user={user ? { name: user.name, role: user.role } : null}>{children}</Chrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
