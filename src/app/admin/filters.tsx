"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URL-synced filter state shared by the admin list tables. Filters live in the
 * query string so a filtered view is shareable and survives refresh. We use
 * `router.replace` (not push) with `scroll: false` so tweaking a filter doesn't
 * spam the back-stack or jump the page.
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const get = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams]
  );

  return { searchParams, setParams, get };
}

export interface ActiveChip {
  key: string;
  label: string;
}

/**
 * Active-filter chip row with one-click removal + a "clear all" button and a
 * result count. Shown above every list.
 */
export function ActiveFilters({
  chips,
  onRemove,
  onClearAll,
  count,
  noun,
}: {
  chips: ActiveChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  count: number;
  noun: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-espresso">
        {count} {noun}
      </span>
      {chips.length > 0 && <span className="text-espresso/20">·</span>}
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 rounded-full bg-spritz/10 px-2.5 py-1 text-xs font-medium text-spritz transition-colors hover:bg-spritz/20 focus:outline-none focus:ring-2 focus:ring-spritz/50"
        >
          {chip.label}
          <span aria-hidden className="text-spritz/70">✕</span>
        </button>
      ))}
      {chips.length > 0 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-espresso-light underline-offset-2 hover:text-koraal hover:underline"
        >
          Wis alles
        </button>
      )}
    </div>
  );
}

export const SELECT_CLASS =
  "rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50";
export const INPUT_CLASS =
  "rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50";
