import type { LocationStatus, UserRole } from "@/lib/supabase/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Gebruiker",
  toppertje: "Toppertje",
  admin: "Admin",
  superadmin: "Superadmin",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-espresso/5 text-espresso-light",
  toppertje: "bg-spritz/10 text-spritz",
  admin: "bg-groen/10 text-groen",
  superadmin: "bg-frisgroen/10 text-frisgroen",
};

export const STATUS_LABELS: Record<LocationStatus, string> = {
  pending: "Wachtrij",
  published: "Live",
  rejected: "Afgewezen",
};

export const STATUS_COLORS: Record<LocationStatus, string> = {
  pending: "bg-spritz/10 text-spritz",
  published: "bg-frisgroen/10 text-frisgroen",
  rejected: "bg-koraal/10 text-koraal",
};

export const PRONOUN_LABELS: Record<string, string> = {
  vent: "hij/hem",
  griet: "zij/haar",
  neutraal: "die/diens",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

export function StatusBadge({ status }: { status: LocationStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function BannedBadge() {
  return (
    <span className="inline-flex rounded-full bg-koraal/10 px-2.5 py-1 text-xs font-medium text-koraal">
      Gebanned
    </span>
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Initials fallback for avatars. */
export function initialsOf(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-espresso/8 bg-white ${className}`}>
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  accent = "text-espresso",
  delta,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
  delta?: { value: number; suffix?: string } | null;
}) {
  return (
    <div className="rounded-xl border border-espresso/8 bg-white p-5">
      <p className="text-sm text-espresso-light">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={`font-display text-3xl font-bold ${accent}`}>{value}</p>
        {delta != null && <DeltaPill value={delta.value} suffix={delta.suffix} />}
      </div>
    </div>
  );
}

export function DeltaPill({ value, suffix }: { value: number; suffix?: string }) {
  const up = value > 0;
  const flat = value === 0;
  const color = flat
    ? "bg-espresso/5 text-espresso-light"
    : up
      ? "bg-frisgroen/10 text-frisgroen"
      : "bg-koraal/10 text-koraal";
  const arrow = flat ? "→" : up ? "▲" : "▼";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {arrow} {Math.abs(value)}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-base font-semibold text-espresso">{children}</h2>
  );
}
