"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  locationId: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({ locationId, size = "md" }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setAuthed(false);
        setLoaded(true);
        return;
      }
      setAuthed(true);
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("location_id", locationId)
        .maybeSingle();
      if (cancelled) return;
      setFavorited(!!data);
      setLoaded(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (favorited) {
      setFavorited(false);
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("location_id", locationId);
    } else {
      setFavorited(true);
      await supabase.from("favorites").insert({
        user_id: user.id,
        location_id: locationId,
      } as never);
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
