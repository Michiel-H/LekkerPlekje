import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/send";

export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH = 200;
const WEEKLY_CAP = 5; // applies to capped categories only
const PREF_COLUMN: Record<string, string> = {
  spot_approved: "notif_spot_approved",
  almost_toppertje: "notif_milestones",
  upvote_milestone: "notif_milestones",
  city_live: "notif_city_news",
  digest: "notif_digest",
  reengage: "notif_reengage",
};
// High-value, low-frequency categories bypass the weekly cap.
const CAP_EXEMPT = new Set(["spot_approved", "city_live"]);

type QueueRow = {
  id: string;
  user_id: string;
  category: string;
  payload: Record<string, unknown>;
};

function isQuietHourNL(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Amsterdam",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  return hour >= 22 || hour < 8; // 22:00–08:00 NL = no sends
}

function authorized(req: Request): boolean {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (isQuietHourNL()) return NextResponse.json({ deferred: "quiet-hours" });

  const admin = getAdminClient();

  const { data } = await admin
    .from("notification_queue")
    .select("id, user_id, category, payload")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH);

  // The repo's hand-written Database type doesn't infer select rows, so cast.
  const rows = (data ?? []) as QueueRow[];
  if (!rows.length) return NextResponse.json({ sent: 0, skipped: 0 });

  let sent = 0, skipped = 0;

  for (const row of rows) {
    // 1) Preference check
    const prefCol = PREF_COLUMN[row.category];
    const { data: user } = await admin
      .from("users")
      .select(`id, ${prefCol}`)
      .eq("id", row.user_id)
      .single();
    if (!user || (user as Record<string, unknown>)[prefCol] === false) {
      await admin.from("notification_queue").update({ status: "skipped" } as never).eq("id", row.id);
      skipped++; continue;
    }

    // 2) Weekly frequency cap (capped categories only)
    if (!CAP_EXEMPT.has(row.category)) {
      const since = new Date(Date.now() - 7 * 864e5).toISOString();
      const { count } = await admin
        .from("notification_queue")
        .select("id", { count: "exact", head: true })
        .eq("user_id", row.user_id)
        .eq("status", "sent")
        .gte("sent_at", since);
      if ((count ?? 0) >= WEEKLY_CAP) {
        await admin.from("notification_queue").update({ status: "skipped" } as never).eq("id", row.id);
        skipped++; continue;
      }
    }

    // 3) Send (reuses sender; prunes dead endpoints itself)
    try {
      await sendPushToUser(row.user_id, row.payload as never);
      await admin
        .from("notification_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() } as never)
        .eq("id", row.id);
      sent++;
    } catch {
      await admin
        .from("notification_queue")
        .update({ status: "failed", attempts: 1 } as never)
        .eq("id", row.id);
    }
  }

  return NextResponse.json({ sent, skipped, processed: rows.length });
}
