"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { GEZELSCHAP_TAGS, VIBE_TAGS } from "@/lib/tags";

const STAD_OPTIONS = [
  { slug: "amsterdam", name: "Amsterdam", live: true },
  { slug: "rotterdam", name: "Rotterdam", live: true },
  { slug: "utrecht", name: "Utrecht", live: true },
  { slug: "den-haag", name: "Den Haag", live: true },
  { slug: "groningen", name: "Groningen", live: true },
  { slug: "leiden", name: "Leiden", live: true },
  { slug: "delft", name: "Delft", live: true },
  { slug: "zwolle", name: "Zwolle", live: true },
  { slug: "eindhoven", name: "Eindhoven", live: false },
  { slug: "enschede", name: "Enschede", live: false },
  { slug: "wageningen", name: "Wageningen", live: false },
  { slug: "tilburg", name: "Tilburg", live: false },
  { slug: "nijmegen", name: "Nijmegen", live: false },
  { slug: "maastricht", name: "Maastricht", live: false },
  { slug: "breda", name: "Breda", live: false },
  { slug: "leeuwarden", name: "Leeuwarden", live: false },
  { slug: "haarlem", name: "Haarlem", live: false },
];

type Slot = "vibe" | "gezelschap" | "stad" | null;

const SLOT_LABEL: Record<Exclude<Slot, null>, string> = {
  vibe: "Kies een activiteit",
  gezelschap: "Kies gezelschap",
  stad: "Kies een stad",
};
const LISTBOX_ID: Record<Exclude<Slot, null>, string> = {
  vibe: "madlibs-vibe-listbox",
  gezelschap: "madlibs-gezelschap-listbox",
  stad: "madlibs-stad-listbox",
};

export default function MadLibsSearch() {
  const router = useRouter();
  const [vibe, setVibe] = useState("");
  const [gezelschap, setGezelschap] = useState("");
  const [stad, setStad] = useState("");
  const [openSlot, setOpenSlot] = useState<Slot>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxRef = useRef<HTMLDivElement | null>(null);

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
    `inline-block cursor-pointer border-b-[3px] transition-colors ${
      value
        ? "border-spritz text-spritz font-semibold"
        : "border-espresso/60 text-espresso-light hover:border-espresso"
    }`;

  const getVibeLabel = (slug: string) => VIBE_TAGS.find((t) => t.slug === slug);
  const getGezelschapLabel = (slug: string) =>
    GEZELSCHAP_TAGS.find((t) => t.slug === slug);
  const getStadLabel = (slug: string) => STAD_OPTIONS.find((s) => s.slug === slug);

  const currentOptions =
    openSlot === "vibe"
      ? VIBE_TAGS
      : openSlot === "gezelschap"
        ? GEZELSCHAP_TAGS
        : openSlot === "stad"
          ? STAD_OPTIONS
          : [];

  // Click-outside to dismiss — keeps the listbox from hanging around
  // after the user moves on.
  useEffect(() => {
    if (!openSlot) return;
    function handle(e: MouseEvent) {
      if (
        listboxRef.current &&
        !listboxRef.current.contains(e.target as Node)
      ) {
        // The slot triggers themselves are siblings of listboxRef — keep
        // them clickable by ignoring clicks that originate on a button
        // with the right aria-controls attribute.
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-madlibs-slot]")) return;
        setOpenSlot(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openSlot]);

  function selectOption(slug: string, isComingSoon: boolean) {
    if (isComingSoon) return;
    if (openSlot === "vibe") setVibe(vibe === slug ? "" : slug);
    else if (openSlot === "gezelschap")
      setGezelschap(gezelschap === slug ? "" : slug);
    else if (openSlot === "stad") setStad(stad === slug ? "" : slug);
    setOpenSlot(null);
  }

  function handleListboxKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!openSlot) return;
    const max = currentOptions.length - 1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((i) => (i >= max ? 0 : i + 1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? max : i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(max);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = currentOptions[activeIndex];
      if (!opt) return;
      const comingSoon =
        openSlot === "stad" && "live" in opt && !opt.live;
      selectOption(opt.slug, comingSoon);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpenSlot(null);
    }
  }

  function toggleSlot(slot: Exclude<Slot, null>) {
    setOpenSlot(openSlot === slot ? null : slot);
    // Reset the keyboard cursor whenever the open slot changes.
    setActiveIndex(0);
  }

  function activeOptionId(slot: Exclude<Slot, null>): string | undefined {
    if (openSlot !== slot) return undefined;
    const opt = currentOptions[activeIndex];
    if (!opt) return undefined;
    return `${LISTBOX_ID[slot]}-${opt.slug}`;
  }

  return (
    <div className="relative">
      <p className="font-display text-2xl sm:text-3xl md:text-4xl leading-relaxed text-espresso text-center">
        Ik zoek een lekker plekje voor{" "}
        <button
          data-madlibs-slot
          type="button"
          onClick={() => toggleSlot("vibe")}
          className={slotClass(vibe)}
          aria-haspopup="listbox"
          aria-expanded={openSlot === "vibe"}
          aria-controls={LISTBOX_ID.vibe}
          aria-label={vibe ? `Activiteit: ${getVibeLabel(vibe)?.name}` : SLOT_LABEL.vibe}
        >
          {vibe ? getVibeLabel(vibe)?.name : "activiteit?"}
        </button>{" "}
        met{" "}
        <button
          data-madlibs-slot
          type="button"
          onClick={() => toggleSlot("gezelschap")}
          className={slotClass(gezelschap)}
          aria-haspopup="listbox"
          aria-expanded={openSlot === "gezelschap"}
          aria-controls={LISTBOX_ID.gezelschap}
          aria-label={
            gezelschap
              ? `Gezelschap: ${getGezelschapLabel(gezelschap)?.name.replace(/^Met /i, "")}`
              : SLOT_LABEL.gezelschap
          }
        >
          {gezelschap
            ? getGezelschapLabel(gezelschap)?.name.replace(/^Met /i, "")
            : "gezelschap?"}
        </button>{" "}
        in{" "}
        <button
          data-madlibs-slot
          type="button"
          onClick={() => toggleSlot("stad")}
          className={slotClass(stad)}
          aria-haspopup="listbox"
          aria-expanded={openSlot === "stad"}
          aria-controls={LISTBOX_ID.stad}
          aria-label={stad ? `Stad: ${getStadLabel(stad)?.name}` : SLOT_LABEL.stad}
        >
          {stad ? getStadLabel(stad)?.name : "stad?"}
        </button>
      </p>

      {openSlot && (
        <div
          ref={listboxRef}
          id={LISTBOX_ID[openSlot]}
          role="listbox"
          tabIndex={-1}
          aria-label={SLOT_LABEL[openSlot]}
          aria-activedescendant={activeOptionId(openSlot)}
          onKeyDown={handleListboxKey}
          className="mt-6 flex flex-wrap justify-center gap-2 focus:outline-none"
        >
          {currentOptions.map((option, idx) => {
            const isSelected =
              (openSlot === "vibe" && vibe === option.slug) ||
              (openSlot === "gezelschap" && gezelschap === option.slug) ||
              (openSlot === "stad" && stad === option.slug);
            const isComingSoon =
              openSlot === "stad" && "live" in option && !option.live;
            const isActive = idx === activeIndex;
            return (
              <button
                key={option.slug}
                id={`${LISTBOX_ID[openSlot]}-${option.slug}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={isComingSoon || undefined}
                onClick={() => selectOption(option.slug, isComingSoon)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isComingSoon
                    ? "bg-espresso/5 text-espresso-light/50 cursor-not-allowed"
                    : isSelected
                      ? "bg-groen text-white shadow-md"
                      : isActive
                        ? "bg-white text-groen border border-groen"
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
            type="button"
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
