"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { reportError } from "@/lib/reportError";

interface Props {
  locationId: string;
  size?: "sm" | "md";
  /**
   * If the parent already knows the favorite state (server-fetched in batch),
   * pass it here to skip the per-button auth/favorites round trip.
   */
  initialFavorited?: boolean;
  /**
   * If known, pass to skip the auth.getUser() call. `null` = not logged in.
   * `undefined` = unknown, button will fetch.
   */
  currentUserId?: string | null;
}

export default function FavoriteButton({
  locationId,
  size = "md",
  initialFavorited,
  currentUserId,
}: Props) {
  const knownAuth = currentUserId !== undefined;
  const [favorited, setFavorited] = useState(initialFavorited ?? false);
  const [loaded, setLoaded] = useState(initialFavorited !== undefined);
  const [authed, setAuthed] = useState<boolean>(knownAuth ? !!currentUserId : false);
  const [userId, setUserId] = useState<string | null>(knownAuth ? currentUserId ?? null : null);

  useEffect(() => {
    // Skip the round trip when parent already provided state
    if (knownAuth && initialFavorited !== undefined) return;

    const supabase = createClient();
    let cancelled = false;

    async function check() {
      let uid = userId;
      if (!knownAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setAuthed(false);
          setLoaded(true);
          return;
        }
        uid = user.id;
        setAuthed(true);
        setUserId(uid);
      }
      if (!uid) {
        setLoaded(true);
        return;
      }
      if (initialFavorited === undefined) {
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", uid)
          .eq("location_id", locationId)
          .maybeSingle();
        if (cancelled) return;
        setFavorited(!!data);
      }
      setLoaded(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [locationId, knownAuth, currentUserId, initialFavorited]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!authed || !userId) {
      window.location.href = "/login";
      return;
    }

    const next = !favorited;
    setFavorited(next); // optimistic

    const supabase = createClient();
    try {
      if (next) {
        const { error } = await supabase.from("favorites").insert({
          user_id: userId,
          location_id: locationId,
        } as never);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("location_id", locationId);
        if (error) throw error;
      }
    } catch (err) {
      // Roll back optimistic update
      setFavorited(!next);
      reportError(err, { where: "FavoriteButton", locationId });
    }
  }

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={toggle}
      className={`${dim} inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      aria-label={favorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      <svg
        className={`${icon} transition-colors ${
          favorited ? "fill-koraal text-koraal" : "fill-none text-espresso-light"
        }`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
