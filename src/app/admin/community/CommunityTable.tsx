"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeLike } from "@/lib/utils";
import type { UserRole } from "@/lib/supabase/types";

interface User {
  id: string;
  display_name: string;
  role: UserRole;
  approved_count: number;
  created_at: string;
  banned_at: string | null;
}

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Gebruiker",
  toppertje: "Toppertje",
  admin: "Admin",
  superadmin: "Superadmin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-espresso/5 text-espresso-light",
  toppertje: "bg-spritz/10 text-spritz",
  admin: "bg-groen/10 text-groen",
  superadmin: "bg-frisgroen/10 text-frisgroen",
};

export default function CommunityTable({
  currentUserRole,
  currentUserId,
}: {
  currentUserRole: UserRole;
  currentUserId: string;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageIdx: number, replace: boolean) => {
      setLoadingMore(true);
      const supabase = createClient();
      let query = supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageIdx * PAGE_SIZE, pageIdx * PAGE_SIZE + PAGE_SIZE - 1);

      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      if (statusFilter === "banned") query = query.not("banned_at", "is", null);
      else if (statusFilter === "active") query = query.is("banned_at", null);
      const term = sanitizeLike(search.trim());
      if (term) query = query.ilike("display_name", `%${term}%`);

      const { data } = await query;
      const rows = (data as User[] | null) ?? [];
      setUsers((prev) => (replace ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      setLoadingMore(false);
    },
    [search, roleFilter, statusFilter]
  );

  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const next = page + 1;
          setPage(next);
          fetchPage(next, false);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [page, hasMore, loadingMore, fetchPage]);

  const [actionError, setActionError] = useState<string | null>(null);

  async function changeRole(userId: string, newRole: UserRole) {
    setActionLoading(userId);
    setActionError(null);
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
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Rolwijziging mislukt.");
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleBan(userId: string, isCurrentlyBanned: boolean) {
    const action = isCurrentlyBanned ? "unban" : "ban";
    if (!isCurrentlyBanned) {
      const ok = window.confirm(
        "Weet je zeker dat je deze gebruiker wil verbannen? Ze kunnen daarna niet meer stemmen of plekjes toevoegen."
      );
      if (!ok) return;
    }
    setActionLoading(userId);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Ban-actie mislukt.");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, banned_at: body.banned_at ?? null } : u
        )
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Ban-actie mislukt.");
    } finally {
      setActionLoading(null);
    }
  }

  function canBan(targetRole: UserRole, targetId: string): boolean {
    if (targetId === currentUserId) return false;
    if (targetRole === "superadmin") return false;
    if (targetRole === "admin" && currentUserRole !== "superadmin") return false;
    return true;
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl bg-white border border-espresso/8 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam..."
          className="flex-1 rounded-lg border border-espresso/15 px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="sm:w-44 rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
        >
          <option value="all">Alle rollen</option>
          <option value="user">Gebruiker</option>
          <option value="toppertje">Toppertje</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="sm:w-44 rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
        >
          <option value="all">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="banned">Gebanned</option>
        </select>
      </div>

      {actionError && (
        <div className="rounded-xl bg-koraal/5 border border-koraal/20 px-4 py-3 text-sm text-koraal">
          {actionError}
        </div>
      )}

      <div className="rounded-xl bg-white border border-espresso/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Naam</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Plekjes</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Lid sinds</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/5">
            {users.map((user) => {
              const isBanned = !!user.banned_at;
              const showBanButton = canBan(user.role, user.id);
              return (
                <tr key={user.id} className="hover:bg-espresso/[0.01]">
                  <td className="px-4 py-3 text-sm font-medium text-espresso">{user.display_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                      {isBanned && (
                        <span className="inline-flex rounded-full bg-koraal/10 px-2.5 py-1 text-xs font-medium text-koraal">
                          Gebanned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-espresso-light">{user.approved_count}</td>
                  <td className="px-4 py-3 text-sm text-espresso-light">
                    {new Date(user.created_at).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === "user" && (
                        <button
                          onClick={() => changeRole(user.id, "toppertje")}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-spritz/10 px-3 py-1.5 text-xs font-medium text-spritz hover:bg-spritz/20 transition-colors disabled:opacity-50"
                        >
                          Promoveer tot Toppertje
                        </button>
                      )}
                      {user.role === "toppertje" && (
                        <button
                          onClick={() => changeRole(user.id, "user")}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal hover:bg-koraal/20 transition-colors disabled:opacity-50"
                        >
                          Demoveer naar Gebruiker
                        </button>
                      )}
                      {showBanButton ? (
                        <button
                          onClick={() => toggleBan(user.id, isBanned)}
                          disabled={actionLoading === user.id}
                          className={
                            isBanned
                              ? "rounded-lg bg-groen/10 px-3 py-1.5 text-xs font-medium text-groen hover:bg-groen/20 transition-colors disabled:opacity-50"
                              : "rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal hover:bg-koraal/20 transition-colors disabled:opacity-50"
                          }
                        >
                          {isBanned ? "Debannen" : "Verban"}
                        </button>
                      ) : (
                        !["user", "toppertje"].includes(user.role) && (
                          <span className="text-xs text-espresso-light">—</span>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && !loadingMore && (
          <div className="p-8 text-center text-sm text-espresso-light">
            Geen gebruikers gevonden met deze filters.
          </div>
        )}
      </div>

      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="text-center py-4 text-sm text-espresso-light">Meer laden...</div>
      )}
      {!hasMore && users.length > 0 && (
        <div className="text-center py-4 text-xs text-espresso-light/60">
          {users.length} gebruikers geladen — alles is in beeld.
        </div>
      )}
    </div>
  );
}
