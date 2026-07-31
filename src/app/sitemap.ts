import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://masscorn-paradise.vercel.app";
  const routes = [
    "", "/accommodations", "/experiences", "/dining", "/spa", "/weddings",
    "/events", "/gallery", "/about", "/contact", "/auth", "/portal",
  ];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.8,
  }));
}
