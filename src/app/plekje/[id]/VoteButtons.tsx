"use client";

import { useState } from "react";

interface VoteButtonsProps {
  tagName: string;
}

export default function VoteButtons({ tagName }: VoteButtonsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [upCount, setUpCount] = useState(
    Math.floor(Math.random() * 20) + 5
  );
  const [downCount, setDownCount] = useState(
    Math.floor(Math.random() * 5)
  );

  function handleVote(type: "up" | "down") {
    if (vote === type) {
      setVote(null);
      if (type === "up") setUpCount((c) => c - 1);
      else setDownCount((c) => c - 1);
    } else {
      if (vote === "up") setUpCount((c) => c - 1);
      if (vote === "down") setDownCount((c) => c - 1);
      setVote(type);
      if (type === "up") setUpCount((c) => c + 1);
      else setDownCount((c) => c + 1);
    }
    // TODO: persist vote to Supabase
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
        aria-label={`${tagName} is lekker`}
      >
        👍 {upCount}
      </button>
      <button
        onClick={() => handleVote("down")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          vote === "down"
            ? "bg-koraal text-white"
            : "bg-koraal/10 text-koraal hover:bg-koraal/20"
        }`}
        aria-label={`${tagName} is niet zo lekker`}
      >
        👎 {downCount}
      </button>
    </div>
  );
}
