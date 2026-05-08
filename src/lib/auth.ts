import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

interface UserProfile {
  id: string;
  display_name: string;
  pronoun: "vent" | "griet" | "neutraal";
  role: UserRole;
  approved_count: number;
  created_at: string;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
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

  return profile as UserProfile | null;
}

export function isAdmin(role: UserRole) {
  return role === "admin" || role === "superadmin";
}

export function isSuperAdmin(role: UserRole) {
  return role === "superadmin";
}
