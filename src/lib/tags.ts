import type { TagCategory } from "@/lib/supabase/types";

export interface TagOption {
  name: string;
  slug: string;
  emoji: string;
  category: TagCategory;
}

export const TAGS: TagOption[] = [
  // Gezelschap
  { name: "Date", slug: "date", emoji: "💕", category: "gezelschap" },
  { name: "Met vrienden", slug: "met-vrienden", emoji: "👯", category: "gezelschap" },
  { name: "Met je ouders", slug: "met-je-ouders", emoji: "👨‍👩‍👦", category: "gezelschap" },
  { name: "Zakelijk", slug: "zakelijk", emoji: "💼", category: "gezelschap" },
  { name: "Solo", slug: "solo", emoji: "🧘", category: "gezelschap" },
  { name: "Met kids", slug: "met-kids", emoji: "👶", category: "gezelschap" },
  { name: "Groep (8+)", slug: "groep", emoji: "🎉", category: "gezelschap" },

  // Vibe
  { name: "Uitbrakken", slug: "uitbrakken", emoji: "🥴", category: "vibe" },
  { name: "Gezellig borrelen", slug: "borrelen", emoji: "🍻", category: "vibe" },
  { name: "Fancy dineren", slug: "fancy-dineren", emoji: "🥂", category: "vibe" },
  { name: "Casual eten", slug: "casual-eten", emoji: "🍕", category: "vibe" },
  { name: "Koffie & taart", slug: "koffie-taart", emoji: "☕", category: "vibe" },
  { name: "Ontbijt / brunch", slug: "brunch", emoji: "🥞", category: "vibe" },
  { name: "Late night", slug: "late-night", emoji: "🌙", category: "vibe" },
  { name: "Pre-drinks", slug: "pre-drinks", emoji: "🍹", category: "vibe" },
  { name: "Werklunch", slug: "werklunch", emoji: "💻", category: "vibe" },

  // Setting
  { name: "In de zon", slug: "in-de-zon", emoji: "☀️", category: "setting" },
  { name: "Binnentuin", slug: "binnentuin", emoji: "🌿", category: "setting" },
  { name: "Aan het water", slug: "aan-het-water", emoji: "🌊", category: "setting" },
  { name: "Open haard", slug: "open-haard", emoji: "🔥", category: "setting" },
  { name: "Hond mee", slug: "hond-mee", emoji: "🐕", category: "setting" },
  { name: "Dakterras", slug: "dakterras", emoji: "🏙️", category: "setting" },
  { name: "Rustig", slug: "rustig", emoji: "🤫", category: "setting" },
  { name: "Instagrammable", slug: "instagrammable", emoji: "📸", category: "setting" },
];

export const GEZELSCHAP_TAGS = TAGS.filter((t) => t.category === "gezelschap");
export const VIBE_TAGS = TAGS.filter((t) => t.category === "vibe");
export const SETTING_TAGS = TAGS.filter((t) => t.category === "setting");
