import type { Pronoun, UserRole } from "@/lib/supabase/types";

const TITLES: Record<Pronoun, string> = {
  vent: "Lekker ventje",
  griet: "Lekker grietje",
  neutraal: "Toppertje",
};

export function toppertjeTitle(pronoun: Pronoun | string | null | undefined): string {
  const key = (pronoun ?? "neutraal") as Pronoun;
  return TITLES[key] ?? TITLES.neutraal;
}

export function isToppertjeLike(role: UserRole | string | null | undefined): boolean {
  return role === "toppertje" || role === "admin" || role === "superadmin";
}

export function toppertjeTitleForRole(
  role: UserRole | string | null | undefined,
  pronoun: Pronoun | string | null | undefined
): string | undefined {
  return isToppertjeLike(role) ? toppertjeTitle(pronoun) : undefined;
}
