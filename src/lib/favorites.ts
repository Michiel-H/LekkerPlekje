import { createClient } from "@/lib/supabase/server";

/**
 * Batch-load favorite status for a list of location IDs for the current user.
 * Returns a Set of location IDs that are favorited. Empty set if not logged in
 * or no IDs.
 *
 * Call this once in a Server Component and pass the result down to PlekjeCard
 * so each FavoriteButton doesn't run its own auth + query.
 */
export async function getFavoritedSet(
  userId: string | null,
  locationIds: string[]
): Promise<Set<string>> {
  if (!userId || locationIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("location_id")
    .eq("user_id", userId)
    .in("location_id", locationIds);
  return new Set(((data as any[]) ?? []).map((f) => f.location_id));
}
