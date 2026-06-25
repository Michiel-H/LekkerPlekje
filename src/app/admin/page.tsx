import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/adminGuard";
import {
  Card,
  SectionHeading,
  StatTile,
  formatDate,
  formatDateTime,
} from "@/app/admin/ui";
import { auditTargetHref, describeAuditAction } from "@/app/admin/activityLabels";
import TrendChart from "./TrendChart";

const DAY = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

async function countBetween(
  admin: ReturnType<typeof getAdminClient>,
  table: "users" | "locations",
  fromIso: string,
  toIso?: string
) {
  let q = admin.from(table).select("id", { count: "exact", head: true }).gte("created_at", fromIso);
  if (toIso) q = q.lt("created_at", toIso);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  await requireAdminPage();
  const supabase = await createClient();
  const admin = getAdminClient();

  const weekAgo = isoDaysAgo(7);
  const twoWeeksAgo = isoDaysAgo(14);
  const eightWeeksAgo = isoDaysAgo(56);

  const [
    pendingRes,
    publishedRes,
    usersRes,
    toppertjesRes,
    newUsersThis,
    newUsersPrev,
    newSpotsThis,
    newSpotsPrev,
    submissionsRes,
    approvalsRes,
    auditRes,
    queueRes,
    hiddenTagsRes,
    downvotedTagsRes,
  ] = await Promise.all([
    supabase.from("locations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("locations").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "toppertje"),
    countBetween(admin, "users", weekAgo),
    countBetween(admin, "users", twoWeeksAgo, weekAgo),
    countBetween(admin, "locations", weekAgo),
    countBetween(admin, "locations", twoWeeksAgo, weekAgo),
    admin.from("locations").select("created_at").gte("created_at", eightWeeksAgo),
    admin
      .from("locations")
      .select("approved_at")
      .eq("status", "published")
      .not("approved_at", "is", null)
      .gte("approved_at", eightWeeksAgo),
    admin
      .from("admin_audit_log")
      .select("id, action, created_at, admin_id, target_type, target_id, metadata")
      .order("created_at", { ascending: false })
      .limit(12),
    admin
      .from("locations")
      .select("id, name, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5),
    admin
      .from("location_tags")
      .select("id, score, total_votes, hidden_at, location_id, tags(name), locations(name)")
      .not("hidden_at", "is", null)
      .limit(8),
    admin
      .from("location_tags")
      .select("id, score, total_votes, hidden_at, location_id, tags(name), locations(name)")
      .gte("total_votes", 5)
      .order("total_votes", { ascending: false })
      .limit(40),
  ]);

  const pending = pendingRes.count ?? 0;
  const published = publishedRes.count ?? 0;
  const users = usersRes.count ?? 0;
  const toppertjes = toppertjesRes.count ?? 0;

  // 8-week buckets (oldest → newest).
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = Date.now() - (8 - i) * 7 * DAY;
    const end = start + 7 * DAY;
    return { start, end, label: `w${i + 1}`, submissions: 0, approvals: 0 };
  });
  function bucket(iso: string | null): (typeof weeks)[number] | undefined {
    if (!iso) return undefined;
    const t = new Date(iso).getTime();
    return weeks.find((w) => t >= w.start && t < w.end);
  }
  for (const row of (submissionsRes.data ?? []) as { created_at: string }[]) {
    const w = bucket(row.created_at);
    if (w) w.submissions += 1;
  }
  for (const row of (approvalsRes.data ?? []) as { approved_at: string | null }[]) {
    const w = bucket(row.approved_at);
    if (w) w.approvals += 1;
  }

  // Resolve names for the activity feed.
  const auditRows = (auditRes.data ?? []) as {
    id: string;
    action: string;
    created_at: string;
    admin_id: string;
    target_type: string;
    target_id: string | null;
    metadata: Record<string, unknown> | null;
  }[];
  const adminIds = [...new Set(auditRows.map((r) => r.admin_id))];
  const userTargetIds = [
    ...new Set(auditRows.filter((r) => r.target_type === "user" && r.target_id).map((r) => r.target_id!)),
  ];
  const locTargetIds = [
    ...new Set(auditRows.filter((r) => r.target_type === "location" && r.target_id).map((r) => r.target_id!)),
  ];

  const [adminNamesRes, userTargetsRes, locTargetsRes] = await Promise.all([
    adminIds.length
      ? admin.from("users").select("id, display_name").in("id", adminIds)
      : Promise.resolve({ data: [] }),
    userTargetIds.length
      ? admin.from("users").select("id, display_name").in("id", userTargetIds)
      : Promise.resolve({ data: [] }),
    locTargetIds.length
      ? admin.from("locations").select("id, name").in("id", locTargetIds)
      : Promise.resolve({ data: [] }),
  ]);

  const nameById = (rows: { id: string; display_name?: string; name?: string }[]) =>
    Object.fromEntries(rows.map((r) => [r.id, r.display_name ?? r.name ?? ""]));
  const adminNames = nameById((adminNamesRes.data ?? []) as never[]);
  const targetNames = {
    ...nameById((userTargetsRes.data ?? []) as never[]),
    ...nameById((locTargetsRes.data ?? []) as never[]),
  };

  // Needs-attention tags: hidden ones + heavily-downvoted ones (majority 👎).
  type FlagTag = {
    id: string;
    score: number;
    total_votes: number;
    hidden_at: string | null;
    location_id: string;
    tags: { name: string } | null;
    locations: { name: string } | null;
  };
  const hidden = (hiddenTagsRes.data ?? []) as FlagTag[];
  const downvoted = ((downvotedTagsRes.data ?? []) as FlagTag[]).filter(
    (t) => !t.hidden_at && t.score * 2 < t.total_votes
  );
  const flagged = [...hidden, ...downvoted].slice(0, 8);
  const queue = (queueRes.data ?? []) as { id: string; name: string; created_at: string }[];

  return (
    <div className="space-y-6">
      <p className="text-sm text-espresso-light">Overzicht van LekkerPlekje.com</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Wachtrij" value={pending} accent="text-spritz" />
        <StatTile label="Live locaties" value={published} accent="text-groen" />
        <StatTile label="Gebruikers" value={users} accent="text-espresso" />
        <StatTile label="Toppertjes" value={toppertjes} accent="text-frisgroen" />
        <StatTile
          label="Nieuwe leden (7d)"
          value={newUsersThis}
          accent="text-espresso"
          delta={{ value: newUsersThis - newUsersPrev }}
        />
        <StatTile
          label="Nieuwe plekjes (7d)"
          value={newSpotsThis}
          accent="text-espresso"
          delta={{ value: newSpotsThis - newSpotsPrev }}
        />
      </div>

      {/* Trend chart */}
      <Card className="p-5">
        <SectionHeading>Laatste 8 weken</SectionHeading>
        <div className="mt-4">
          <TrendChart weeks={weeks.map((w) => ({ label: w.label, submissions: w.submissions, approvals: w.approvals }))} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity feed */}
        <Card className="p-5">
          <SectionHeading>Recente activiteit</SectionHeading>
          {auditRows.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-light">Nog geen admin-acties.</p>
          ) : (
            <ul className="mt-4 divide-y divide-espresso/5">
              {auditRows.map((r) => {
                const href = auditTargetHref(r.target_type, r.target_id);
                const sentence = describeAuditAction(
                  r.action,
                  adminNames[r.admin_id] ?? "Admin",
                  r.target_id ? targetNames[r.target_id] : null
                );
                return (
                  <li key={r.id} className="py-2.5 text-sm">
                    {href ? (
                      <Link href={href} className="text-espresso hover:text-spritz">
                        {sentence}
                      </Link>
                    ) : (
                      <span className="text-espresso">{sentence}</span>
                    )}
                    <p className="text-xs text-espresso-light">{formatDateTime(r.created_at)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Needs attention */}
        <Card className="p-5">
          <SectionHeading>Vraagt om aandacht</SectionHeading>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-espresso-light">
            Oudste in wachtrij
          </p>
          {queue.length === 0 ? (
            <p className="mt-1 text-sm text-espresso-light">Wachtrij is leeg. 🎉</p>
          ) : (
            <ul className="mt-1 divide-y divide-espresso/5">
              {queue.map((loc) => (
                <li key={loc.id}>
                  <Link
                    href={`/admin/locaties/${loc.id}`}
                    className="flex items-center justify-between gap-3 py-2 text-sm transition-colors hover:text-spritz"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-espresso">{loc.name}</span>
                    <span className="shrink-0 text-xs text-espresso-light">{formatDate(loc.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-espresso-light">
            Gemarkeerde tags
          </p>
          {flagged.length === 0 ? (
            <p className="mt-1 text-sm text-espresso-light">Geen verborgen of zwaar gedownvote tags.</p>
          ) : (
            <ul className="mt-1 divide-y divide-espresso/5">
              {flagged.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/locaties/${t.location_id}`}
                    className="flex items-center justify-between gap-3 py-2 text-sm transition-colors hover:text-spritz"
                  >
                    <span className="min-w-0 flex-1 truncate text-espresso">
                      <span className="font-medium">{t.tags?.name ?? "Tag"}</span>
                      <span className="text-espresso-light"> · {t.locations?.name ?? "plekje"}</span>
                    </span>
                    <span className="shrink-0 text-xs">
                      {t.hidden_at ? (
                        <span className="rounded-full bg-koraal/10 px-2 py-0.5 font-medium text-koraal">Verborgen</span>
                      ) : (
                        <span className="text-koraal">👎 {Math.max(0, t.total_votes - t.score)}/{t.total_votes}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
