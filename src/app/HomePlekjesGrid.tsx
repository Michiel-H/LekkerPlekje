"use client";

import { useState } from "react";
import PlekjeCard from "@/components/PlekjeCard";
import { createClient } from "@/lib/supabase/client";
import { flairFor } from "@/lib/rewards";

export interface HomePlekje {
  id: string;
  name: string;
  neighborhood?: string | null;
  imageUrl?: string | null;
  tags: { emoji: string; name: string }[];
  toppertjeName?: string;
  toppertjeTitle?: string;
  initialFavorited?: boolean;
  currentUserId?: string | null;
  favoritesCount?: number;
}

interface Props {
  initialPlekjes: HomePlekje[];
  /** Filter on city (e.g. user's preferred city). null = no city filter. */
  cityId: string | null;
  /** Current user id (for favorite-toggle hand-off + batched favorites lookup). */
  currentUserId: string | null;
}

const PAGE_SIZE = 12;

export default function HomePlekjesGrid({
  initialPlekjes,
  cityId,
  currentUserId,
}: Props) {
  const [plekjes, setPlekjes] = useState<HomePlekje[]>(initialPlekjes);
  const [loading, setLoading] = useState(false);
  // Assume more exists if we got a full page; gets corrected after the first
  // "Zie meer" returns fewer than PAGE_SIZE.
  const [hasMore, setHasMore] = useState(initialPlekjes.length === PAGE_SIZE);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("locations")
        .select(
          `id, name, neighborhood, image_url, submitted_by, city_id, favorites_count,
           location_tags (tags (name, emoji)),
           users!locations_submitted_by_fkey (display_name, pronoun, role, points)`
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(plekjes.length, plekjes.length + PAGE_SIZE - 1);

      if (cityId) query = query.eq("city_id", cityId);

      const { data: rows } = await query;
      const newRows = (rows as any[] | null) ?? [];

      // Batch favorites lookup for the newly fetched IDs only
      let favoritedSet = new Set<string>();
      if (currentUserId && newRows.length > 0) {
        const ids = newRows.map((r: any) => r.id);
        const { data: favs } = await supabase
          .from("favorites")
          .select("location_id")
          .eq("user_id", currentUserId)
          .in("location_id", ids);
        favoritedSet = new Set(
          ((favs as any[] | null) ?? []).map((f: any) => f.location_id)
        );
      }

      const mapped: HomePlekje[] = newRows.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        neighborhood: loc.neighborhood,
        imageUrl: loc.image_url,
        tags: (loc.location_tags || []).map((lt: any) => ({
          emoji: lt.tags?.emoji || "",
          name: lt.tags?.name || "",
        })),
        toppertjeName: loc.users?.display_name,
        toppertjeTitle: flairFor({
          role: loc.users?.role,
          pronoun: loc.users?.pronoun,
          points: loc.users?.points,
        }),
        initialFavorited: favoritedSet.has(loc.id),
        currentUserId,
        favoritesCount: loc.favorites_count ?? 0,
      }));

      setPlekjes((prev) => [...prev, ...mapped]);
      if (newRows.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoading(false);
    }
  }

  if (plekjes.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-espresso/8 p-12 text-center max-w-lg mx-auto">
        <p className="font-display text-lg font-semibold text-espresso">
          Nog geen plekjes getipt
        </p>
        <p className="mt-2 text-sm text-espresso-light">
          Word de eerste die een lekker plekje deelt met de community!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plekjes.map((p) => (
          <PlekjeCard key={p.id} {...p} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-creme hover:bg-espresso/90 transition-colors disabled:opacity-60"
          >
            {loading ? (
              "Bezig met laden..."
            ) : (
              <>
                Zie meer
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && plekjes.length > PAGE_SIZE && (
        <p className="mt-8 text-center text-xs text-espresso-light/60">
          Je hebt alle plekjes gezien
        </p>
      )}
    </>
  );
}
