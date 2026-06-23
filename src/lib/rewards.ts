import { isToppertjeLike, toppertjeTitle } from "@/lib/titleMap";

// Keep these thresholds in sync with public.level_for_points in the DB.
export const LEVELS = [
  { min: 0, name: "Nieuwsgierig" },
  { min: 100, name: "Verkenner" },
  { min: 400, name: "Kenner" },
  { min: 750, name: "Local Hero" },
  { min: 2000, name: "Legende" },
] as const;

export function levelIndex(points: number): number {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) if (points >= LEVELS[k].min) i = k;
  return i;
}

export function levelInfo(points: number) {
  const i = levelIndex(points);
  const next = LEVELS[i + 1] ?? null;
  return {
    index: i,
    current: LEVELS[i],
    next,
    toNext: next ? next.min - points : 0,
    progress: next ? (points - LEVELS[i].min) / (next.min - LEVELS[i].min) : 1,
  };
}

/**
 * Flair shown after a contributor's name on cards.
 * Toppertje-like roles keep their pronoun-based title (e.g. "Lekker ventje").
 * Regular users show level flair once they reach level 1 (100+ pts), so
 * brand-new contributors stay clean (matches the old "no flair" behaviour).
 */
export function flairFor(opts: {
  role?: string | null;
  pronoun?: string | null;
  points?: number | null;
}): string | undefined {
  if (isToppertjeLike(opts.role)) return toppertjeTitle(opts.pronoun);
  const i = levelIndex(opts.points ?? 0);
  if (i === 0) return undefined;
  return LEVELS[i].name;
}
