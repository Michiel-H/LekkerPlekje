"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeLike } from "@/lib/utils";
import type { UserRole } from "@/lib/supabase/types";
import {
  ActiveFilters,
  INPUT_CLASS,
  SELECT_CLASS,
  useFilterParams,
  type ActiveChip,
} from "@/app/admin/filters";
import { BannedBadge, RoleBadge, ROLE_LABELS, formatDate } from "@/app/admin/ui";

interface User {
  id: string;
  display_name: string;
  role: UserRole;
  approved_count: number;
  points: number;
  last_active_on: string | null;
  created_at: string;
  banned_at: string | null;
}

const PAGE_SIZE = 20;

type SortKey = "newest" | "spots" | "points" | "active";
const SORT_LABELS: Record<SortKey, string> = {
  newest: "Nieuwste leden",
  spots: "Meeste plekjes",
  points: "Meeste punten",
  active: "Laatst actief",
};

const SORT_COLUMN: Record<SortKey, string> = {
  newest: "created_at",
  spots: "approved_count",
  points: "points",
  active: "last_active_on",
};

export default function CommunityTable({
  currentUserRole,
  currentUserId,
}: {
  currentUserRole: UserRole;
  currentUserId: string;
}) {
  const router = useRouter();
  const { searchParams, setParams } = useFilterParams();

  // Derive filter state from the URL (shareable + survives refresh).
  const q = searchParams.get("q") ?? "";
  const roleFilter = (searchParams.get("role") ?? "all") as "all" | UserRole;
  const statusFilter = (searchParams.get("status") ?? "all") as "all" | "active" | "banned";
  const sort = (searchParams.get("sort") ?? "newest") as SortKey;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  // Local mirror of the search box so typing stays smooth; pushed to the URL
  // after a short debounce.
  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => {
    if (q !== searchInput.trim()) setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== q) setParams({ q: trimmed || null });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageIdx: number, replace: boolean) => {
      setLoadingMore(true);
      const supabase = createClient();
      let query = supabase
        .from("users")
        .select("id, display_name, role, approved_count, points, last_active_on, created_at, banned_at")
        .order(SORT_COLUMN[sort], { ascending: false, nullsFirst: false })
        .range(pageIdx * PAGE_SIZE, pageIdx * PAGE_SIZE + PAGE_SIZE - 1);

      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      if (statusFilter === "banned") query = query.not("banned_at", "is", null);
      else if (statusFilter === "active") query = query.is("banned_at", null);
      const term = sanitizeLike(q.trim());
      if (term) query = query.ilike("display_name", `%${term}%`);
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);

      const { data } = await query;
      const rows = (data as User[] | null) ?? [];
      setUsers((prev) => (replace ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      setLoadingMore(false);
    },
    [q, roleFilter, statusFilter, sort, from, to]
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
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
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
      if (!res.ok) throw new Error(body.error ?? "Ban-actie mislukt.");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned_at: body.banned_at ?? null } : u))
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

  const chips = useMemo<ActiveChip[]>(() => {
    const list: ActiveChip[] = [];
    if (q) list.push({ key: "q", label: `Zoek: "${q}"` });
    if (roleFilter !== "all") list.push({ key: "role", label: ROLE_LABELS[roleFilter] });
    if (statusFilter !== "all")
      list.push({ key: "status", label: statusFilter === "banned" ? "Gebanned" : "Actief" });
    if (sort !== "newest") list.push({ key: "sort", label: SORT_LABELS[sort] });
    if (from) list.push({ key: "from", label: `Vanaf ${from}` });
    if (to) list.push({ key: "to", label: `Tot ${to}` });
    return list;
  }, [q, roleFilter, statusFilter, sort, from, to]);

  function removeChip(key: string) {
    if (key === "q") setSearchInput("");
    setParams({ [key]: null });
  }
  function clearAll() {
    setSearchInput("");
    setParams({ q: null, role: null, status: null, sort: null, from: null, to: null });
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-espresso/8 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Zoek op naam..."
            className={`flex-1 ${INPUT_CLASS}`}
          />
          <select
            value={roleFilter}
            onChange={(e) => setParams({ role: e.target.value === "all" ? null : e.target.value })}
            className={`lg:w-40 ${SELECT_CLASS}`}
          >
            <option value="all">Alle rollen</option>
            <option value="user">Gebruiker</option>
            <option value="toppertje">Toppertje</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setParams({ status: e.target.value === "all" ? null : e.target.value })}
            className={`lg:w-36 ${SELECT_CLASS}`}
          >
            <option value="all">Alle statussen</option>
            <option value="active">Actief</option>
            <option value="banned">Gebanned</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value === "newest" ? null : e.target.value })}
            className={`lg:w-44 ${SELECT_CLASS}`}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-medium text-espresso-light">Lid geworden tussen</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setParams({ from: e.target.value || null })}
            className={INPUT_CLASS}
          />
          <span className="text-xs text-espresso-light">en</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setParams({ to: e.target.value || null })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <ActiveFilters
        chips={chips}
        onRemove={removeChip}
        onClearAll={clearAll}
        count={users.length}
        noun={users.length === 1 ? "gebruiker" : "gebruikers"}
      />

      {actionError && (
        <div className="rounded-xl border border-koraal/20 bg-koraal/5 px-4 py-3 text-sm text-koraal">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-espresso/8 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Naam</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Plekjes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Punten</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Lid sinds</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-espresso-light">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/5">
            {users.map((user) => {
              const isBanned = !!user.banned_at;
              const showBanButton = canBan(user.role, user.id);
              const href = `/admin/community/${user.id}`;
              return (
                <tr
                  key={user.id}
                  onClick={() => router.push(href)}
                  className="cursor-pointer hover:bg-spritz/[0.03]"
                >
                  <td className="px-4 py-3 text-sm font-medium text-espresso">
                    <span className="hover:text-spritz">{user.display_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RoleBadge role={user.role} />
                      {isBanned && <BannedBadge />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-espresso-light">{user.approved_count}</td>
                  <td className="px-4 py-3 text-sm text-espresso-light">{user.points}</td>
                  <td className="px-4 py-3 text-sm text-espresso-light">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {user.role === "user" && (
                        <button
                          onClick={() => changeRole(user.id, "toppertje")}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-spritz/10 px-3 py-1.5 text-xs font-medium text-spritz transition-colors hover:bg-spritz/20 disabled:opacity-50"
                        >
                          Promoveer tot Toppertje
                        </button>
                      )}
                      {user.role === "toppertje" && (
                        <button
                          onClick={() => changeRole(user.id, "user")}
                          disabled={actionLoading === user.id}
                          className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
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
                              ? "rounded-lg bg-groen/10 px-3 py-1.5 text-xs font-medium text-groen transition-colors hover:bg-groen/20 disabled:opacity-50"
                              : "rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
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
      {loadingMore && <div className="py-4 text-center text-sm text-espresso-light">Meer laden...</div>}
      {!hasMore && users.length > 0 && (
        <div className="py-4 text-center text-xs text-espresso-light/60">
          {users.length} gebruikers geladen — alles is in beeld.
        </div>
      )}
    </div>
  );
}
