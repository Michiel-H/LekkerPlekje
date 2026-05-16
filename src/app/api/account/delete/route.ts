import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { reportError } from "@/lib/reportError";

/**
 * Fully delete the current user's account.
 *
 * Flow:
 *   1. Verify the request is from an authed session (cookie-based).
 *   2. Use a service-role admin client to remove the user's storage
 *      objects (locations/<id>/* and avatars/<id>/*) — required by AVG
 *      since photos are personal data and the buckets are public.
 *   3. Delete the public.users profile row (FK cascades handle dependent
 *      rows per their own ON DELETE rules).
 *   4. Delete the auth.users row — frees the email for future re-use.
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

  // 1. Best-effort cleanup of the user's storage objects. Failures are
  //    reported but don't block the rest of deletion — an orphaned blob
  //    is recoverable, but leaving an undeletable account is worse.
  await Promise.all([
    deleteUserFolder(admin, "locations", user.id),
    deleteUserFolder(admin, "avatars", user.id),
  ]);

  // 2. Delete the public profile row first so any FK cascades fire
  //    predictably (some FKs are ON DELETE SET NULL, others CASCADE).
  await admin.from("users").delete().eq("id", user.id);

  // 3. Delete the auth user — this frees the email for future re-registration.
  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    reportError(authError, { where: "account/delete", userId: user.id });
    return NextResponse.json(
      { error: "Account-verwijdering is mislukt. Probeer het later opnieuw." },
      { status: 500 }
    );
  }

  // 4. Sign the cookie session out
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}

async function deleteUserFolder(
  admin: SupabaseClient,
  bucket: string,
  userId: string
) {
  try {
    const { data: files, error: listError } = await admin.storage
      .from(bucket)
      .list(userId, { limit: 1000 });
    if (listError || !files || files.length === 0) return;
    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error: removeError } = await admin.storage
      .from(bucket)
      .remove(paths);
    if (removeError) {
      reportError(removeError, {
        where: "account/delete: storage cleanup",
        bucket,
        userId,
        count: paths.length,
      });
    }
  } catch (err) {
    reportError(err, {
      where: "account/delete: storage cleanup",
      bucket,
      userId,
    });
  }
}
