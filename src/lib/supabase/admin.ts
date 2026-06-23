import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

let cached: SupabaseClient<Database> | null = null;

/**
 * Service-role client (bypasses RLS) for server-side push/notification work.
 * Created lazily — a missing key surfaces as a runtime error in the handler
 * rather than crashing module load (which would also break `next build`).
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service-role env (SUPABASE_SERVICE_ROLE_KEY) is not configured");
  }
  cached = createClient<Database>(url, key, { auth: { persistSession: false } });
  return cached;
}
