"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeLike } from "@/lib/utils";
import type { LocationStatus } from "@/lib/supabase/types";
import {
  ActiveFilters,
  INPUT_CLASS,
  SELECT_CLASS,
  useFilterParams,
  type ActiveChip,
} from "@/app/admin/filters";
import { STATUS_LABELS, StatusBadge } from "@/app/admin/ui";

interface Location {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  city_id: string;
  image_url: string | null;
  favorites_count: number;
  status: LocationStatus;
  created_at: string;
  users: { display_name: string } | null;
}

interface City {
  id: string;
  name: string;
}

const PAGE_SIZE = 20;

type SortKey = "newest" | "name" | "popular";
const SORT_LABELS: Record<SortKey, string> = {
  newest: "Nieuwste",
  name: "Naam A–Z",
  popular: "Meeste favorieten",
};

export default function LocatiesTable({ cities }: { cities: City[] }) {
  const router = useRouter();
  const { searchParams, setParams } = useFilterParams();

  const q = searchParams.get("q") ?? "";
  const statusFilter = (searchParams.get("status") ?? "all") as "all" | LocationStatus;
  const neighborhood = searchParams.get("buurt") ?? "";
  const cityFilter = searchParams.get("stad") ?? "all";
  const photoFilter = (searchParams.get("foto") ?? "all") as "all" | "yes" | "no";
  const sort = (searchParams.get("sort") ?? "newest") as SortKey;

  const cityName = useMemo(
    () => Object.fromEntries(cities.map((c) => [c.id, c.name])),
    [cities]
  );

  // Smooth, debounced search box mirrored to the URL.
  const [searchInput, setSearchInput] = useState(q);
  const [buurtInput, setBuurtInput] = useState(neighborhood);
  useEffect(() => {
    if (q !== searchInput.trim()) setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    if (neighborhood !== buurtInput.trim()) setBuurtInput(neighborhood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood]);
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== q) setParams({ q: trimmed || null });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = buurtInput.trim();
      if (trimmed !== neighborhood) setParams({ buurt: trimmed || null });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buurtInput]);

  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageIdx: number, replace: boolean) => {
      setLoadingMore(true);
      const supabase = createClient();
      let query = supabase
        .from("locations")
        .select(
          "id, name, address, neighborhood, city_id, image_url, favorites_count, status, created_at, users!submitted_by(display_name)"
        )
        .range(pageIdx * PAGE_SIZE, pageIdx * PAGE_SIZE + PAGE_SIZE - 1);

      if (sort === "name") query = query.order("name", { ascending: true });
      else if (sort === "popular") query = query.order("favorites_count", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (cityFilter !== "all") query = query.eq("city_id", cityFilter);
      if (photoFilter === "yes") query = query.not("image_url", "is", null);
      else if (photoFilter === "no") query = query.is("image_url", null);
      const term = sanitizeLike(q.trim());
      if (term) query = query.or(`name.ilike.%${term}%,address.ilike.%${term}%`);
      const nbh = sanitizeLike(neighborhood.trim());
      if (nbh) query = query.ilike("neighborhood", `%${nbh}%`);

      const { data } = await query;
      const rows = (data as Location[] | null) ?? [];
      setLocations((prev) => (replace ? rows : [...prev, ...rows]));
      setHasMore(rows.length === PAGE_SIZE);
      setLoadingMore(false);
    },
    [q, statusFilter, neighborhood, cityFilter, photoFilter, sort]
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
    setActionLoading(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Verwijderen mislukt.");
      }
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    } finally {
      setActionLoading(null);
    }
  }

  const chips = useMemo<ActiveChip[]>(() => {
    const list: ActiveChip[] = [];
    if (q) list.push({ key: "q", label: `Zoek: "${q}"` });
    if (statusFilter !== "all") list.push({ key: "status", label: STATUS_LABELS[statusFilter] });
    if (neighborhood) list.push({ key: "buurt", label: `Buurt: ${neighborhood}` });
    if (cityFilter !== "all") list.push({ key: "stad", label: cityName[cityFilter] ?? "Stad" });
    if (photoFilter !== "all")
      list.push({ key: "foto", label: photoFilter === "yes" ? "Met foto" : "Zonder foto" });
    if (sort !== "newest") list.push({ key: "sort", label: SORT_LABELS[sort] });
    return list;
  }, [q, statusFilter, neighborhood, cityFilter, photoFilter, sort, cityName]);

  function removeChip(key: string) {
    if (key === "q") setSearchInput("");
    if (key === "buurt") setBuurtInput("");
    setParams({ [key]: null });
  }
  function clearAll() {
    setSearchInput("");
    setBuurtInput("");
    setParams({ q: null, status: null, buurt: null, stad: null, foto: null, sort: null });
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
            placeholder="Zoek op naam of adres..."
            className={`flex-1 ${INPUT_CLASS}`}
          />
          <input
            type="text"
            value={buurtInput}
            onChange={(e) => setBuurtInput(e.target.value)}
            placeholder="Buurt"
            className={`lg:w-36 ${INPUT_CLASS}`}
          />
          <select
            value={cityFilter}
            onChange={(e) => setParams({ stad: e.target.value === "all" ? null : e.target.value })}
            className={`lg:w-40 ${SELECT_CLASS}`}
          >
            <option value="all">Alle steden</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setParams({ status: e.target.value === "all" ? null : e.target.value })}
            className={`lg:w-36 ${SELECT_CLASS}`}
          >
            <option value="all">Alle statussen</option>
            <option value="published">Live</option>
            <option value="pending">Wachtrij</option>
            <option value="rejected">Afgewezen</option>
          </select>
          <select
            value={photoFilter}
            onChange={(e) => setParams({ foto: e.target.value === "all" ? null : e.target.value })}
            className={`lg:w-32 ${SELECT_CLASS}`}
          >
            <option value="all">Foto: alle</option>
            <option value="yes">Met foto</option>
            <option value="no">Zonder foto</option>
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
      </div>

      <ActiveFilters
        chips={chips}
        onRemove={removeChip}
        onClearAll={clearAll}
        count={locations.length}
        noun={locations.length === 1 ? "locatie" : "locaties"}
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Plekje</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Buurt / Stad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Door</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-espresso-light">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/5">
            {locations.map((loc) => (
              <tr
                key={loc.id}
                onClick={() => router.push(`/admin/locaties/${loc.id}`)}
                className="cursor-pointer hover:bg-spritz/[0.03]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-groen/10">
                      {loc.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={loc.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-groen/50">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-espresso hover:text-spritz">{loc.name}</p>
                      <p className="truncate text-xs text-espresso-light">{loc.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-espresso-light">
                  {[loc.neighborhood, cityName[loc.city_id]].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={loc.status} />
                </td>
                <td className="px-4 py-3 text-sm text-espresso-light">{loc.users?.display_name ?? "—"}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/locaties/${loc.id}`}
                      className="rounded-lg bg-espresso/5 px-3 py-1.5 text-xs font-medium text-espresso-light transition-colors hover:bg-espresso/10"
                    >
                      Bekijken
                    </Link>
                    <button
                      onClick={() => handleDelete(loc.id, loc.name)}
                      disabled={actionLoading === loc.id}
                      className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
                    >
                      Verwijderen
                    </button>
                  </div>
                </td>
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

      <div ref={sentinelRef} className="h-1" />
      {loadingMore && <div className="py-4 text-center text-sm text-espresso-light">Meer laden...</div>}
      {!hasMore && locations.length > 0 && (
        <div className="py-4 text-center text-xs text-espresso-light/60">
          {locations.length} locaties geladen — alles is in beeld.
        </div>
      )}
    </div>
  );
}
