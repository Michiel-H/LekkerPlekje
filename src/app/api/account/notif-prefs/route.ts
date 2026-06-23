import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const COLUMNS = [
  "notif_spot_approved",
  "notif_milestones",
  "notif_city_news",
  "notif_digest",
  "notif_reengage",
] as const;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Whitelist: only accept the known boolean preference columns.
  const update: Record<string, boolean> = {};
  for (const col of COLUMNS) {
    if (typeof body[col] === "boolean") update[col] = body[col];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }

  // RLS allows a user to update their own row; role is locked by a separate trigger.
  const { error } = await supabase
    .from("users")
    .update(update as never)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
