"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LIVE_CITIES = [
  { slug: "amsterdam", name: "Amsterdam" },
  { slug: "rotterdam", name: "Rotterdam" },
  { slug: "utrecht", name: "Utrecht" },
  { slug: "den-haag", name: "Den Haag" },
  { slug: "groningen", name: "Groningen" },
  { slug: "leiden", name: "Leiden" },
  { slug: "delft", name: "Delft" },
  { slug: "zwolle", name: "Zwolle" },
];

export default function CitiesMenu({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (mobile) {
    // Render as flat list in mobile menu
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-espresso-light/70">
          Steden
        </span>
        {LIVE_CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/resultaten?stad=${c.slug}`}
            className="text-sm text-espresso-light hover:text-espresso"
          >
            {c.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm font-medium text-espresso-light hover:text-espresso transition-colors"
      >
        Steden
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl bg-white border border-espresso/10 shadow-lg py-2 z-50">
          {LIVE_CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/resultaten?stad=${c.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-espresso hover:bg-spritz/5 hover:text-spritz transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
