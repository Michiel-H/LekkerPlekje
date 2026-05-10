"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface VoteButtonsProps {
  locationTagId: string;
  initialLekker: number;
  initialNietLekker: number;
}

export default function VoteButtons({
  locationTagId,
  initialLekker,
  initialNietLekker,
}: VoteButtonsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [lekkerCount, setLekkerCount] = useState(initialLekker);
  const [nietLekkerCount, setNietLekkerCount] = useState(initialNietLekker);

  // Load current user's existing vote and subscribe to live changes
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadCurrentVote() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data } = await supabase
        .from("votes")
        .select("vote_type")
        .eq("user_id", user.id)
        .eq("location_tag_id", locationTagId)
        .maybeSingle();

      if (cancelled) return;
      const v = (data as any)?.vote_type;
      if (v === "up") setVote("up");
      else if (v === "down") setVote("down");
    }

    async function refreshCounts() {
      const { data } = await supabase
        .from("location_tags")
        .select("score, total_votes")
        .eq("id", locationTagId)
        .single();
      if (cancelled || !data) return;
      const row = data as any;
      const score = row.score || 0;
      const total = row.total_votes || 0;
      setLekkerCount(score);
      setNietLekkerCount(total - score);
    }

    loadCurrentVote();

    // Subscribe to vote changes for this location_tag — updates counts live
    const channel = supabase
      .channel(`votes-${locationTagId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `location_tag_id=eq.${locationTagId}`,
        },
        () => {
          refreshCounts();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [locationTagId]);

  async function handleVote(type: "up" | "down") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (vote === type) {
      // Remove vote
      setVote(null);
      if (type === "up") setLekkerCount((c) => c - 1);
      else setNietLekkerCount((c) => c - 1);

      await supabase
        .from("votes")
        .delete()
        .eq("user_id", user.id)
        .eq("location_tag_id", locationTagId);
    } else {
      // Switch or new vote
      if (vote === "up") setLekkerCount((c) => c - 1);
      if (vote === "down") setNietLekkerCount((c) => c - 1);
      setVote(type);
      if (type === "up") setLekkerCount((c) => c + 1);
      else setNietLekkerCount((c) => c + 1);

      await supabase.from("votes").upsert(
        {
          user_id: user.id,
          location_tag_id: locationTagId,
          vote_type: type,
        } as never,
        { onConflict: "user_id,location_tag_id" }
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote("up")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          vote === "up"
            ? "bg-frisgroen text-white"
            : "bg-frisgroen/10 text-frisgroen hover:bg-frisgroen/20"
        }`}
      >
        Lekker {lekkerCount}
      </button>
      <button
        onClick={() => handleVote("down")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          vote === "down"
            ? "bg-koraal text-white"
            : "bg-koraal/10 text-koraal hover:bg-koraal/20"
        }`}
      >
        Niet lekker {nietLekkerCount}
      </button>
    </div>
  );
}
