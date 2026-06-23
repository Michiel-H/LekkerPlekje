import "server-only";
import webpush from "web-push";
import { getAdminClient } from "@/lib/supabase/admin";

export type PushPayload = { title: string; body: string; url?: string; tag?: string; icon?: string };

type SubRow = { endpoint: string; p256dh: string; auth: string };

// Configure VAPID once, lazily, so a missing key doesn't crash module load / build.
let vapidReady = false;
function ensureVapid() {
  if (vapidReady) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidReady = true;
}

/** Send a notification to every subscription belonging to a user. Cleans up dead endpoints. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureVapid();
  const admin = getAdminClient();
  const { data } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);
  // The repo's hand-written Database type doesn't infer select rows, so cast.
  const subs = (data ?? []) as SubRow[];
  if (!subs.length) return;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // Subscription expired/unsubscribed — remove it.
          await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    })
  );
}
