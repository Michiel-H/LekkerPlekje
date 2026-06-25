"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/types";

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Gebruiker",
  toppertje: "Toppertje",
  admin: "Admin",
  superadmin: "Superadmin",
};

function sectionTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/wachtrij")) return "Wachtrij";
  if (pathname.startsWith("/admin/locaties")) {
    return pathname === "/admin/locaties" ? "Alle Locaties" : "Locatie";
  }
  if (pathname.startsWith("/admin/community")) {
    return pathname === "/admin/community" ? "Community" : "Profiel";
  }
  if (pathname.startsWith("/admin/beheerders")) return "Beheerders & Rechten";
  return "Admin";
}

type Scope = "plekjes" | "mensen";

export default function AdminTopBar({
  user,
}: {
  user: { display_name: string; role: UserRole; avatar_url?: string | null };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("plekjes");
  const [term, setTerm] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced navigation: typing routes to the matching list with ?q=, so the
  // URL-synced filter toolbars there pick it up. Empty input is a no-op.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = term.trim();
    if (!q) return;
    debounce.current = setTimeout(() => {
      const base = scope === "mensen" ? "/admin/community" : "/admin/locaties";
      router.push(`${base}?q=${encodeURIComponent(q)}`);
    }, 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [term, scope, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    const base = scope === "mensen" ? "/admin/community" : "/admin/locaties";
    router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  }

  const initials = user.display_name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-espresso/10 bg-creme/80 px-6 backdrop-blur lg:px-8">
      <h1 className="font-display text-lg font-bold text-espresso shrink-0">
        {sectionTitle(pathname)}
      </h1>

      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md items-center gap-2">
        <div className="hidden shrink-0 rounded-lg border border-espresso/15 bg-white p-0.5 sm:flex">
          {(["plekjes", "mensen"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                scope === s ? "bg-spritz/10 text-spritz" : "text-espresso-light hover:text-espresso"
              }`}
            >
              {s === "plekjes" ? "Plekjes" : "Mensen"}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-light/60"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={scope === "mensen" ? "Zoek een persoon..." : "Zoek een plekje..."}
            className="w-full rounded-lg border border-espresso/15 bg-white py-2 pl-9 pr-3 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50"
          />
        </div>
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-espresso">{user.display_name}</p>
          <p className="text-xs leading-tight text-espresso-light">{ROLE_LABELS[user.role]}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-spritz/10 text-sm font-semibold text-spritz">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
