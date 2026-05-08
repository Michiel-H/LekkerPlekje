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
  { name: "Groep (8+)", slug: "groep", emoji: "🎉", category: "gezelschap" },
  { name: "Met collega's", slug: "met-collegas", emoji: "🏢", category: "gezelschap" },

  // Activiteit (vibe)
  { name: "Biertje doen", slug: "biertje-doen", emoji: "🍺", category: "vibe" },
  { name: "Diner", slug: "diner", emoji: "🍽️", category: "vibe" },
  { name: "Casual eten", slug: "casual-eten", emoji: "🍕", category: "vibe" },
  { name: "Koffie", slug: "koffie", emoji: "☕", category: "vibe" },
  { name: "Ontbijt / brunch", slug: "brunch", emoji: "🥞", category: "vibe" },
  { name: "Guinness", slug: "guinness", emoji: "🖤", category: "vibe" },
  { name: "Pre-drinks", slug: "pre-drinks", emoji: "🍹", category: "vibe" },
  { name: "Werklunch", slug: "werklunch", emoji: "💻", category: "vibe" },
  { name: "Terrasje pakken", slug: "terrasje-pakken", emoji: "☀️", category: "vibe" },
  { name: "Studeren / Werken", slug: "studeren-werken", emoji: "📚", category: "vibe" },
  { name: "Cocktails", slug: "cocktails", emoji: "🍸", category: "vibe" },
  { name: "Snelle hap", slug: "snelle-hap", emoji: "🌯", category: "vibe" },
  { name: "Spelletjes spelen", slug: "spelletjes-spelen", emoji: "🎲", category: "vibe" },
  { name: "Speciaalbier", slug: "speciaalbier", emoji: "🍻", category: "vibe" },
  { name: "Dansen", slug: "dansen", emoji: "💃", category: "vibe" },
];

export const GEZELSCHAP_TAGS = TAGS.filter((t) => t.category === "gezelschap");
export const VIBE_TAGS = TAGS.filter((t) => t.category === "vibe");
