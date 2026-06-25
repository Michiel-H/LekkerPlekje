import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/adminGuard";
import { isUuid } from "@/lib/uuid";
import { levelInfo } from "@/lib/rewards";
import {
  describeAuditAction,
  pointEventLabel,
} from "@/app/admin/activityLabels";
import {
  BannedBadge,
  Card,
  PRONOUN_LABELS,
  RoleBadge,
  SectionHeading,
  StatusBadge,
  formatDate,
  formatDateTime,
  initialsOf,
} from "@/app/admin/ui";
import type { LocationStatus, Pronoun, UserRole } from "@/lib/supabase/types";
import ProfileActions from "./ProfileActions";

interface Props {
  params: Promise<{ id: string }>;
}

interface ProfileUser {
  id: string;
  display_name: string;
  pronoun: Pronoun;
  role: UserRole;
  bio: string | null;
  avatar_url: string | null;
  approved_count: number;
  created_at: string;
  banned_at: string | null;
  points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_on: string | null;
}

export default async function AdminProfilePage({ params }: Props) {
  const currentUser = await requireAdminPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const admin = getAdminClient();

  const [
    userRes,
    badgesRes,
    locationsRes,
    favoritesRes,
    pointEventsRes,
    votesRes,
    auditRes,
  ] = await Promise.all([
    admin.from("users").select("*").eq("id", id).single(),
    admin
      .from("user_badges")
      .select("badge_slug, earned_at, badges(name, emoji, description)")
      .eq("user_id", id)
      .order("earned_at", { ascending: false }),
    admin
      .from("locations")
      .select("id, name, status, created_at, neighborhood")
      .eq("submitted_by", id)
      .order("created_at", { ascending: false }),
    admin
      .from("favorites")
      .select("location_id, created_at, locations(id, name)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(40),
    admin
      .from("point_events")
      .select("id, kind, points, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(15),
    admin.from("votes").select("id", { count: "exact", head: true }).eq("user_id", id),
    admin
      .from("admin_audit_log")
      .select("id, action, created_at, admin_id, metadata")
      .eq("target_type", "user")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const user = userRes.data as ProfileUser | null;
  if (!user) notFound();

  const badges = (badgesRes.data ?? []) as {
    badge_slug: string;
    earned_at: string;
    badges: { name: string; emoji: string; description: string } | null;
  }[];
  const locations = (locationsRes.data ?? []) as {
    id: string;
    name: string;
    status: LocationStatus;
    created_at: string;
    neighborhood: string | null;
  }[];
  const favorites = (favoritesRes.data ?? []) as {
    location_id: string;
    created_at: string;
    locations: { id: string; name: string } | null;
  }[];
  const pointEvents = (pointEventsRes.data ?? []) as {
    id: string;
    kind: string;
    points: number;
    created_at: string;
  }[];
  const votesCount = votesRes.count ?? 0;
  const auditRows = (auditRes.data ?? []) as {
    id: string;
    action: string;
    created_at: string;
    admin_id: string;
    metadata: Record<string, unknown> | null;
  }[];

  // Resolve admin names for the audit entries in one extra round trip.
  const adminIds = [...new Set(auditRows.map((r) => r.admin_id))];
  let adminNames: Record<string, string> = {};
  if (adminIds.length > 0) {
    const { data } = await admin
      .from("users")
      .select("id, display_name")
      .in("id", adminIds);
    adminNames = Object.fromEntries(
      ((data ?? []) as { id: string; display_name: string }[]).map((u) => [
        u.id,
        u.display_name,
      ])
    );
  }

  const lvl = levelInfo(user.points);
  const publishedCount = locations.filter((l) => l.status === "published").length;
  const pendingCount = locations.filter((l) => l.status === "pending").length;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/community"
        className="inline-flex items-center gap-1 text-sm text-espresso-light transition-colors hover:text-spritz"
      >
        &larr; Terug naar Community
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-spritz/10 text-xl font-bold text-spritz">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initialsOf(user.display_name)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-espresso">
                  {user.display_name}
                </h2>
                <RoleBadge role={user.role} />
                {user.banned_at && <BannedBadge />}
              </div>
              <p className="mt-1 text-sm text-espresso-light">
                {PRONOUN_LABELS[user.pronoun] ?? user.pronoun} · Lid sinds{" "}
                {formatDate(user.created_at)} · Laatst actief{" "}
                {user.last_active_on ? formatDate(user.last_active_on) : "—"}
              </p>
              {user.bio && (
                <p className="mt-2 max-w-prose text-sm text-espresso">{user.bio}</p>
              )}
            </div>
          </div>
          <ProfileActions
            userId={user.id}
            role={user.role}
            bannedAt={user.banned_at}
            currentUserRole={currentUser.role}
            currentUserId={currentUser.id}
          />
        </div>
      </Card>

      {/* Gamification */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Punten" value={user.points} accent="text-spritz" />
        <Stat
          label="Level"
          value={`${lvl.index} · ${lvl.current.name}`}
          accent="text-frisgroen"
        />
        <Stat label="Huidige streak" value={`${user.current_streak} dgn`} />
        <Stat label="Langste streak" value={`${user.longest_streak} dgn`} />
      </div>

      {/* Badges */}
      <Card className="p-6">
        <SectionHeading>Badges ({badges.length})</SectionHeading>
        {badges.length === 0 ? (
          <p className="mt-3 text-sm text-espresso-light">Nog geen badges verdiend.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.badge_slug}
                title={`${b.badges?.description ?? ""} · ${formatDate(b.earned_at)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-espresso/5 px-3 py-1.5 text-sm text-espresso"
              >
                <span>{b.badges?.emoji}</span>
                {b.badges?.name ?? b.badge_slug}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Contributions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <SectionHeading>Plekjes ({locations.length})</SectionHeading>
            <p className="text-xs text-espresso-light">
              {publishedCount} live · {pendingCount} wachtrij · {user.approved_count} goedgekeurd
            </p>
          </div>
          {locations.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-light">Nog geen plekjes toegevoegd.</p>
          ) : (
            <ul className="mt-4 divide-y divide-espresso/5">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <Link
                    href={`/admin/locaties/${loc.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-spritz"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-espresso">
                      {loc.name}
                      {loc.neighborhood && (
                        <span className="font-normal text-espresso-light"> · {loc.neighborhood}</span>
                      )}
                    </span>
                    <StatusBadge status={loc.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeading>Favorieten ({favorites.length})</SectionHeading>
          {favorites.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-light">Nog geen favorieten.</p>
          ) : (
            <ul className="mt-4 divide-y divide-espresso/5">
              {favorites.map((f) => (
                <li key={f.location_id}>
                  <Link
                    href={f.locations ? `/admin/locaties/${f.locations.id}` : "#"}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:text-spritz"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-espresso">
                      {f.locations?.name ?? "Verwijderd plekje"}
                    </span>
                    <span className="text-xs text-espresso-light">{formatDate(f.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <SectionHeading>Recente punten</SectionHeading>
            <p className="text-xs text-espresso-light">{votesCount} stemmen uitgebracht</p>
          </div>
          {pointEvents.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-light">Nog geen activiteit.</p>
          ) : (
            <ul className="mt-4 divide-y divide-espresso/5">
              {pointEvents.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-espresso">{pointEventLabel(e.kind)}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium text-frisgroen">+{e.points}</span>
                    <span className="text-xs text-espresso-light">{formatDate(e.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeading>Moderatie-historie</SectionHeading>
          {auditRows.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-light">
              Geen admin-acties op deze gebruiker.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-espresso/5">
              {auditRows.map((r) => (
                <li key={r.id} className="py-2.5 text-sm">
                  <p className="text-espresso">
                    {describeAuditAction(r.action, adminNames[r.admin_id] ?? "Admin")}
                  </p>
                  {r.action === "change_user_role" && r.metadata && (
                    <p className="text-xs text-espresso-light">
                      {String(r.metadata.from)} → {String(r.metadata.to)}
                    </p>
                  )}
                  <p className="text-xs text-espresso-light">{formatDateTime(r.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-espresso",
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-espresso/8 bg-white p-5">
      <p className="text-sm text-espresso-light">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
