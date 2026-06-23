import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await getAdminClient().rpc("enqueue_weekly_digests");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enqueued: data });
}
