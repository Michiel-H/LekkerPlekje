"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Location {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  status: "pending" | "published" | "rejected";
  created_at: string;
  users: { display_name: string } | null;
}

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<Location["status"], string> = {
  pending: "Wachtrij",
  published: "Live",
  rejected: "Afgewezen",
};

const STATUS_COLORS: Record<Location["status"], string> = {
  pending: "bg-spritz/10 text-spritz",
  published: "bg-frisgroen/10 text-frisgroen",
  rejected: "bg-koraal/10 text-koraal",
};

export default function LocatiesTable() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Location["status"]>("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");

  // Edit / delete state
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageIdx: number, replace: boolean) => {
      setLoadingMore(true);
      const supabase = createClient();
      let query = supabase
        .from("locations")
        .select("*, users!submitted_by(display_name)")
        .order("created_at", { ascending: false })
        .range(pageIdx * PAGE_SIZE, pageIdx * PAGE_SIZE + PAGE_SIZE - 1);

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (search.trim()) query = query.or(
        `name.ilike.%${search.trim()}%,address.ilike.%${search.trim()}%`
      );
      if (neighborhoodFilter.trim())
        query = query.ilike("neighborhood", `%${neighborhoodFilter.trim()}%`);

      const { data } = await query;
      const rows = (data as Location[] | null) ?? [];

      setLocations((prev) => (replace ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      setLoadingMore(false);
    },
    [search, statusFilter, neighborhoodFilter]
  );

  // Reset & refetch when filters change
  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  // Infinite-scroll: observe sentinel
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

  function startEdit(loc: Location) {
    setEditing(loc.id);
    setEditName(loc.name);
    setEditAddress(loc.address);
    setEditNeighborhood(loc.neighborhood ?? "");
  }

  async function saveEdit(id: string) {
    setActionLoading(id);
    const supabase = createClient();
    await supabase
      .from("locations")
      .update({
        name: editName,
        address: editAddress,
        neighborhood: editNeighborhood || null,
      } as never)
      .eq("id", id);
    setLocations((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, name: editName, address: editAddress, neighborhood: editNeighborhood || null }
          : l
      )
    );
    setEditing(null);
    setActionLoading(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
    setActionLoading(id);
    const supabase = createClient();
    await supabase.from("locations").delete().eq("id", id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setActionLoading(null);
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl bg-white border border-espresso/8 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of adres..."
          className="flex-1 rounded-lg border border-espresso/15 px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50"
        />
        <input
          type="text"
          value={neighborhoodFilter}
          onChange={(e) => setNeighborhoodFilter(e.target.value)}
          placeholder="Buurt"
          className="sm:w-40 rounded-lg border border-espresso/15 px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="sm:w-44 rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
        >
          <option value="all">Alle statussen</option>
          <option value="published">Live</option>
          <option value="pending">Wachtrij</option>
          <option value="rejected">Afgewezen</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-espresso/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Naam</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Adres</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Buurt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Door</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/5">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-espresso/[0.01]">
                {editing === loc.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-espresso/15 px-2 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full rounded-lg border border-espresso/15 px-2 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editNeighborhood}
                        onChange={(e) => setEditNeighborhood(e.target.value)}
                        className="w-full rounded-lg border border-espresso/15 px-2 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[loc.status]}`}>
                        {STATUS_LABELS[loc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-espresso-light">{loc.users?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => saveEdit(loc.id)}
                          disabled={actionLoading === loc.id}
                          className="rounded-lg bg-groen/10 px-3 py-1.5 text-xs font-medium text-groen hover:bg-groen/20 transition-colors disabled:opacity-50"
                        >
                          Opslaan
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="rounded-lg bg-espresso/5 px-3 py-1.5 text-xs font-medium text-espresso-light hover:bg-espresso/10 transition-colors"
                        >
                          Annuleren
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm font-medium text-espresso">{loc.name}</td>
                    <td className="px-4 py-3 text-sm text-espresso-light">{loc.address}</td>
                    <td className="px-4 py-3 text-sm text-espresso-light">{loc.neighborhood ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[loc.status]}`}>
                        {STATUS_LABELS[loc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-espresso-light">{loc.users?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(loc)}
                          className="rounded-lg bg-espresso/5 px-3 py-1.5 text-xs font-medium text-espresso-light hover:bg-espresso/10 transition-colors"
                        >
                          Bewerken
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id, loc.name)}
                          disabled={actionLoading === loc.id}
                          className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal hover:bg-koraal/20 transition-colors disabled:opacity-50"
                        >
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && !loadingMore && (
          <div className="p-8 text-center text-sm text-espresso-light">
            Geen locaties gevonden met deze filters.
          </div>
        )}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="text-center py-4 text-sm text-espresso-light">Meer laden...</div>
      )}
      {!hasMore && locations.length > 0 && (
        <div className="text-center py-4 text-xs text-espresso-light/60">
          {locations.length} locaties geladen — alles is in beeld.
        </div>
      )}
    </div>
  );
}
