import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/adminGuard";
import { isUuid } from "@/lib/uuid";
import {
  Card,
  RoleBadge,
  SectionHeading,
  StatusBadge,
  formatDateTime,
} from "@/app/admin/ui";
import type { LocationStatus, UserRole } from "@/lib/supabase/types";
import LocationActions from "./LocationActions";
import TagModerationButton from "./TagModerationButton";

interface Props {
  params: Promise<{ id: string }>;
}

interface LocationTag {
  id: string;
  score: number;
  total_votes: number;
  motivation: string | null;
  hidden_at: string | null;
  tags: { name: string; emoji: string; category: string } | null;
}

interface LocationRow {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  city_id: string;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  favorites_count: number;
  status: LocationStatus;
  submitted_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  cities: { name: string } | null;
  location_tags: LocationTag[];
}

export default async function AdminLocationDetailPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const admin = getAdminClient();
  const { data } = await admin
    .from("locations")
    .select(
      "id, name, address, neighborhood, city_id, lat, lng, image_url, favorites_count, status, submitted_by, approved_by, approved_at, created_at, cities(name), location_tags(id, score, total_votes, motivation, hidden_at, tags(name, emoji, category))"
    )
    .eq("id", id)
    .single();

  const loc = data as LocationRow | null;
  if (!loc) notFound();

  // Resolve submitter + approver names (separate to avoid FK-alias guessing).
  const ids = [loc.submitted_by, loc.approved_by].filter(Boolean) as string[];
  const { data: peopleData } = await admin
    .from("users")
    .select("id, display_name, role")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const people = Object.fromEntries(
    ((peopleData ?? []) as { id: string; display_name: string; role: UserRole }[]).map((u) => [
      u.id,
      u,
    ])
  );
  const submitter = people[loc.submitted_by];
  const approver = loc.approved_by ? people[loc.approved_by] : null;

  const hasCoords = typeof loc.lat === "number" && typeof loc.lng === "number";
  const d = 0.008;
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${loc.lng! - d}%2C${loc.lat! - d}%2C${loc.lng! + d}%2C${loc.lat! + d}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`
    : null;

  const tags = [...loc.location_tags].sort((a, b) => b.total_votes - a.total_votes);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/locaties"
        className="inline-flex items-center gap-1 text-sm text-espresso-light transition-colors hover:text-spritz"
      >
        &larr; Terug naar Locaties
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: media */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-groen/10">
              {loc.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={loc.image_url} alt={loc.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-groen/40">
                  Geen afbeelding
                </div>
              )}
            </div>
          </Card>

          {mapSrc ? (
            <Card className="overflow-hidden">
              <iframe
                title="Kaart"
                src={mapSrc}
                className="h-64 w-full border-0"
                loading="lazy"
              />
              <div className="flex items-center justify-between px-4 py-2 text-xs text-espresso-light">
                <span>
                  {loc.lat!.toFixed(5)}, {loc.lng!.toFixed(5)}
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=17/${loc.lat}/${loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-spritz"
                >
                  Open in kaart ↗
                </a>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-sm text-espresso-light">
              Geen coördinaten bekend voor dit plekje.
            </Card>
          )}
        </div>

        {/* Right: info + actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-espresso">{loc.name}</h2>
              <StatusBadge status={loc.status} />
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Adres" value={loc.address} />
              <Row label="Buurt" value={loc.neighborhood ?? "—"} />
              <Row label="Stad" value={loc.cities?.name ?? "—"} />
              <div className="flex justify-between gap-4">
                <dt className="text-espresso-light">Ingezonden door</dt>
                <dd className="text-right">
                  {submitter ? (
                    <Link
                      href={`/admin/community/${loc.submitted_by}`}
                      className="inline-flex items-center gap-1.5 font-medium text-espresso hover:text-spritz"
                    >
                      {submitter.display_name}
                      <RoleBadge role={submitter.role} />
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <Row label="Toegevoegd" value={formatDateTime(loc.created_at)} />
              <Row
                label="Goedgekeurd door"
                value={approver ? `${approver.display_name}` : "—"}
              />
              <Row label="Goedgekeurd op" value={formatDateTime(loc.approved_at)} />
              <Row label="Favorieten" value={String(loc.favorites_count)} />
            </dl>
          </Card>

          <Card className="p-5">
            <SectionHeading>Moderatie</SectionHeading>
            <div className="mt-3">
              <LocationActions
                id={loc.id}
                status={loc.status}
                name={loc.name}
                address={loc.address}
                neighborhood={loc.neighborhood}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Tags */}
      <Card className="p-5">
        <SectionHeading>Tags &amp; stemmen ({tags.length})</SectionHeading>
        {tags.length === 0 ? (
          <p className="mt-3 text-sm text-espresso-light">Nog geen tags op dit plekje.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tags.map((lt) => {
              const lekker = lt.score;
              const nietLekker = Math.max(0, lt.total_votes - lt.score);
              const isHidden = !!lt.hidden_at;
              return (
                <li
                  key={lt.id}
                  className={`rounded-xl border p-4 ${
                    isHidden ? "border-koraal/20 bg-koraal/5" : "border-espresso/8 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium text-espresso">
                        <span>{lt.tags?.emoji}</span>
                        {lt.tags?.name ?? "Onbekende tag"}
                        {isHidden && (
                          <span className="rounded-full bg-koraal/10 px-2 py-0.5 text-xs font-medium text-koraal">
                            Verborgen
                          </span>
                        )}
                      </p>
                      {lt.motivation && (
                        <p className="mt-1.5 max-w-prose text-sm text-espresso-light">
                          &ldquo;{lt.motivation}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-frisgroen">
                        👍 {lekker}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-koraal">
                        👎 {nietLekker}
                      </span>
                      <TagModerationButton id={lt.id} hidden={isHidden} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-espresso-light">{label}</dt>
      <dd className="text-right font-medium text-espresso">{value}</dd>
    </div>
  );
}
