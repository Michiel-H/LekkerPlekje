"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/types";

/**
 * Inline moderation for a single profile. Reuses the existing role/ban API
 * routes (which own all the permission + audit logic) — this component only
 * mirrors `CommunityTable`'s client-side guards so we don't show buttons that
 * the server would reject anyway.
 */
export default function ProfileActions({
  userId,
  role,
  bannedAt,
  currentUserRole,
  currentUserId,
}: {
  userId: string;
  role: UserRole;
  bannedAt: string | null;
  currentUserRole: UserRole;
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBanned = !!bannedAt;

  function canBan(): boolean {
    if (userId === currentUserId) return false;
    if (role === "superadmin") return false;
    if (role === "admin" && currentUserRole !== "superadmin") return false;
    return true;
  }

  async function changeRole(newRole: UserRole) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Rolwijziging mislukt.");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rolwijziging mislukt.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan() {
    if (!isBanned) {
      const ok = window.confirm(
        "Weet je zeker dat je deze gebruiker wil verbannen? Ze kunnen daarna niet meer stemmen of plekjes toevoegen."
      );
      if (!ok) return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isBanned ? "unban" : "ban" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Ban-actie mislukt.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ban-actie mislukt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {role === "user" && (
          <button
            onClick={() => changeRole("toppertje")}
            disabled={loading}
            className="rounded-lg bg-spritz/10 px-3 py-1.5 text-xs font-medium text-spritz transition-colors hover:bg-spritz/20 disabled:opacity-50"
          >
            Promoveer tot Toppertje
          </button>
        )}
        {role === "toppertje" && (
          <button
            onClick={() => changeRole("user")}
            disabled={loading}
            className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
          >
            Demoveer naar Gebruiker
          </button>
        )}
        {canBan() && (
          <button
            onClick={toggleBan}
            disabled={loading}
            className={
              isBanned
                ? "rounded-lg bg-groen/10 px-3 py-1.5 text-xs font-medium text-groen transition-colors hover:bg-groen/20 disabled:opacity-50"
                : "rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
            }
          >
            {isBanned ? "Debannen" : "Verban"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-koraal">{error}</p>}
    </div>
  );
}
