import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lekkerplekje.com";

export const revalidate = 3600; // re-generate at most once an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Published locations
  const { data: locations } = await supabase
    .from("locations")
    .select("id, approved_at")
    .eq("status", "published")
    .order("approved_at", { ascending: false })
    .limit(5000);

  // Live cities
  const { data: cities } = await supabase
    .from("cities")
    .select("slug")
    .eq("status", "live");

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/hoe-het-werkt`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/voorwaarden`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/meldingen`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cityUrls: MetadataRoute.Sitemap = ((cities as { slug: string }[] | null) ?? []).map((c) => ({
    url: `${SITE_URL}/resultaten?stad=${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const locationUrls: MetadataRoute.Sitemap = (
    (locations as { id: string; approved_at: string | null }[] | null) ?? []
  ).map((loc) => ({
    url: `${SITE_URL}/plekje/${loc.id}`,
    lastModified: loc.approved_at ? new Date(loc.approved_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...cityUrls, ...locationUrls];
}
