"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GEZELSCHAP_TAGS, VIBE_TAGS, SETTING_TAGS } from "@/lib/tags";

export default function MadLibsSearch() {
  const router = useRouter();
  const [gezelschap, setGezelschap] = useState("");
  const [vibe, setVibe] = useState("");
  const [setting, setSetting] = useState("");
  const [openSlot, setOpenSlot] = useState<
    "gezelschap" | "vibe" | "setting" | null
  >(null);

  function handleSearch() {
    const params = new URLSearchParams();
    if (gezelschap) params.set("gezelschap", gezelschap);
    if (vibe) params.set("vibe", vibe);
    if (setting) params.set("setting", setting);
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

  const getLabel = (slug: string, tags: typeof GEZELSCHAP_TAGS) =>
    tags.find((t) => t.slug === slug);

  return (
    <div className="relative">
      <p className="font-display text-2xl sm:text-3xl md:text-4xl leading-relaxed text-espresso text-center">
        Ik zoek een lekker plekje voor{" "}
        <button
          onClick={() => setOpenSlot(openSlot === "gezelschap" ? null : "gezelschap")}
          className={slotClass(gezelschap)}
        >
          {gezelschap
            ? `${getLabel(gezelschap, GEZELSCHAP_TAGS)?.emoji} ${getLabel(gezelschap, GEZELSCHAP_TAGS)?.name}`
            : "wie?"}
        </button>{" "}
        om{" "}
        <button
          onClick={() => setOpenSlot(openSlot === "vibe" ? null : "vibe")}
          className={slotClass(vibe)}
        >
          {vibe
            ? `${getLabel(vibe, VIBE_TAGS)?.emoji} ${getLabel(vibe, VIBE_TAGS)?.name}`
            : "wat te doen?"}
        </button>{" "}
        het liefst{" "}
        <button
          onClick={() => setOpenSlot(openSlot === "setting" ? null : "setting")}
          className={slotClass(setting)}
        >
          {setting
            ? `${getLabel(setting, SETTING_TAGS)?.emoji} ${getLabel(setting, SETTING_TAGS)?.name}`
            : "welke sfeer?"}
        </button>
      </p>

      {openSlot && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {(openSlot === "gezelschap"
            ? GEZELSCHAP_TAGS
            : openSlot === "vibe"
              ? VIBE_TAGS
              : SETTING_TAGS
          ).map((tag) => {
            const isSelected =
              (openSlot === "gezelschap" && gezelschap === tag.slug) ||
              (openSlot === "vibe" && vibe === tag.slug) ||
              (openSlot === "setting" && setting === tag.slug);

            return (
              <button
                key={tag.slug}
                onClick={() => {
                  if (openSlot === "gezelschap")
                    setGezelschap(isSelected ? "" : tag.slug);
                  else if (openSlot === "vibe")
                    setVibe(isSelected ? "" : tag.slug);
                  else setSetting(isSelected ? "" : tag.slug);
                  setOpenSlot(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-groen text-white shadow-md"
                    : "bg-white text-espresso border border-espresso/10 hover:border-groen hover:text-groen"
                }`}
              >
                <span>{tag.emoji}</span>
                <span>{tag.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {(gezelschap || vibe || setting) && (
        <div className="mt-8 text-center">
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-full bg-spritz px-8 py-3 text-base font-semibold text-white hover:bg-spritz-hover transition-colors shadow-lg shadow-spritz/25"
          >
            Zoek plekjes 🍊
          </button>
        </div>
      )}
    </div>
  );
}
