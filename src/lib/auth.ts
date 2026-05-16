import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

interface UserProfile {
  id: string;
  display_name: string;
  pronoun: "vent" | "griet" | "neutraal";
  role: UserRole;
  approved_count: number;
  created_at: string;
  banned_at: string | null;
  preferred_city_id?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

/**
 * Wrapped in React `cache()` so multiple calls within the same server request
 * (e.g. Header + page + layout) share one DB round trip.
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profile) {
    return profile as UserProfile;
  }

  return {
    id: authUser.id,
    display_name: authUser.user_metadata?.display_name || "Nieuw lid",
    pronoun: authUser.user_metadata?.pronoun || "neutraal",
    role: "user",
    approved_count: 0,
    created_at: authUser.created_at,
    banned_at: null,
  } as UserProfile;
});

export function isAdmin(role: UserRole) {
  return role === "admin" || role === "superadmin";
}

export function isSuperAdmin(role: UserRole) {
  return role === "superadmin";
}
