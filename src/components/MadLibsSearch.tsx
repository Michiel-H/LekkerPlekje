"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GEZELSCHAP_TAGS, VIBE_TAGS } from "@/lib/tags";

const STAD_OPTIONS = [
  { slug: "amsterdam", name: "Amsterdam", live: true },
  { slug: "utrecht", name: "Utrecht", live: false },
  { slug: "rotterdam", name: "Rotterdam", live: false },
  { slug: "den-haag", name: "Den Haag", live: false },
  { slug: "eindhoven", name: "Eindhoven", live: false },
];

type Slot = "vibe" | "gezelschap" | "stad" | null;

export default function MadLibsSearch() {
  const router = useRouter();
  const [vibe, setVibe] = useState("");
  const [gezelschap, setGezelschap] = useState("");
  const [stad, setStad] = useState("");
  const [openSlot, setOpenSlot] = useState<Slot>(null);

  function handleSearch() {
    const params = new URLSearchParams();
    if (vibe) params.set("vibe", vibe);
    if (gezelschap) params.set("gezelschap", gezelschap);
    if (stad) params.set("stad", stad);
    if (params.toString()) {
      router.push(`/resultaten?${params.toString()}`);
    }
  }

  const slotClass = (value: string) =>
    `inline-block cursor-pointer border-b-2 transition-colors ${
      value
        ? "border-spritz text-spritz font-semibold"
        : "border-espresso/30 text-espresso-light"
    }`;

  const getVibeLabel = (slug: string) => VIBE_TAGS.find((t) => t.slug === slug);
  const getGezelschapLabel = (slug: string) => GEZELSCHAP_TAGS.find((t) => t.slug === slug);
  const getStadLabel = (slug: string) => STAD_OPTIONS.find((s) => s.slug === slug);

  const currentOptions =
    openSlot === "vibe"
      ? VIBE_TAGS
      : openSlot === "gezelschap"
        ? GEZELSCHAP_TAGS
        : openSlot === "stad"
          ? STAD_OPTIONS
          : [];

  return (
    <div className="relative">
      <p className="font-display text-2xl sm:text-3xl md:text-4xl leading-relaxed text-espresso text-center">
        Ik zoek een lekker plekje voor{" "}
        <button
          onClick={() => setOpenSlot(openSlot === "vibe" ? null : "vibe")}
          className={slotClass(vibe)}
        >
          {vibe
            ? getVibeLabel(vibe)?.name
            : "activiteit?"}
        </button>{" "}
        met{" "}
        <button
          onClick={() => setOpenSlot(openSlot === "gezelschap" ? null : "gezelschap")}
          className={slotClass(gezelschap)}
        >
          {gezelschap
            ? getGezelschapLabel(gezelschap)?.name.replace(/^Met /i, "")
            : "gezelschap?"}
        </button>{" "}
        in{" "}
        <button
          onClick={() => setOpenSlot(openSlot === "stad" ? null : "stad")}
          className={slotClass(stad)}
        >
          {stad
            ? getStadLabel(stad)?.name
            : "stad?"}
        </button>
      </p>

      {openSlot && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {currentOptions.map((option) => {
            const isSelected =
              (openSlot === "vibe" && vibe === option.slug) ||
              (openSlot === "gezelschap" && gezelschap === option.slug) ||
              (openSlot === "stad" && stad === option.slug);
            const isComingSoon = openSlot === "stad" && "live" in option && !option.live;

            return (
              <button
                key={option.slug}
                onClick={() => {
                  if (isComingSoon) return;
                  if (openSlot === "vibe") setVibe(isSelected ? "" : option.slug);
                  else if (openSlot === "gezelschap") setGezelschap(isSelected ? "" : option.slug);
                  else if (openSlot === "stad") setStad(isSelected ? "" : option.slug);
                  setOpenSlot(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isComingSoon
                    ? "bg-espresso/5 text-espresso-light/50 cursor-not-allowed"
                    : isSelected
                      ? "bg-groen text-white shadow-md"
                      : "bg-white text-espresso border border-espresso/10 hover:border-groen hover:text-groen"
                }`}
              >
                <span>{option.name}</span>
                {isComingSoon && (
                  <span className="text-xs opacity-50">soon</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {(vibe || gezelschap || stad) && (
        <div className="mt-8 text-center">
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-full bg-spritz px-8 py-3 text-base font-semibold text-white hover:bg-spritz-hover transition-colors shadow-lg shadow-spritz/25"
          >
            Zoek plekjes
          </button>
        </div>
      )}
    </div>
  );
}
