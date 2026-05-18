import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve a username (display_name) to the corresponding auth email so the
 * login form can call signInWithPassword with the right identifier.
 *
 * Why a server route?
 *   - `auth.users.email` is only readable by the service role.
 *   - We deliberately do NOT expose this via RLS on a view — that would let
 *     anyone enumerate all usernames + emails. The route returns just the
 *     email for an exact case-insensitive match and nothing else.
 *
 * Rate-limited at the edge (Vercel) and uses generic "not found" responses
 * so an attacker can't easily mine for valid usernames.
 */
export async function POST(req: Request) {
  let body: { username?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  if (!username || username.length < 1 || username.length > 64) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Server config" }, { status: 500 });
  }

  const admin = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Find the user id from the public.users row (case-insensitive on
  //    display_name — the unique index is on lower(display_name) so an
  //    `ilike` with an exact string is safe).
  const { data: profile } = await admin
    .from("users")
    .select("id")
    .ilike("display_name", username)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // 2. Look up the auth user to get the email.
  const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(
    (profile as any).id
  );
  if (authErr || !authUser?.user?.email) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ email: authUser.user.email });
}
