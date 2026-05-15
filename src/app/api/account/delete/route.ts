import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { reportError } from "@/lib/reportError";

/**
 * Fully delete the current user's account.
 *
 * Flow:
 *   1. Verify the request is from an authed session (cookie-based).
 *   2. Use a service-role admin client to delete the auth.users row.
 *      The DB cascades to public.users via ON DELETE CASCADE, and all
 *      dependent rows (locations submitted, votes, favorites) follow
 *      their own cascade rules.
 *
 * Requires env var SUPABASE_SERVICE_ROLE_KEY (set in .env.local and Vercel).
 */
export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    reportError(new Error("account/delete: missing service-role env vars"));
    return NextResponse.json(
      { error: "Server is niet geconfigureerd voor account-verwijdering." },
      { status: 500 }
    );
  }

  // Service-role client — bypasses RLS, can call admin endpoints
  const admin = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Delete the public profile row first so any FK cascades fire predictably
  //    (some FKs are ON DELETE SET NULL, others CASCADE)
  await admin.from("users").delete().eq("id", user.id);

  // 2. Delete the auth user — this frees the email for future re-registration
  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    reportError(authError, { where: "account/delete", userId: user.id });
    return NextResponse.json(
      { error: "Account-verwijdering is mislukt. Probeer het later opnieuw." },
      { status: 500 }
    );
  }

  // 3. Sign the cookie session out
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
