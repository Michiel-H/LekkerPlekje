"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/app/admin/ui";

interface Location {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  image_url: string | null;
  created_at: string;
  users: { display_name: string } | null;
}

export default function WachtrijTable({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(id: string, action: "approve" | "reject") {
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/locations/${id}/${action}`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Actie mislukt.");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Actie mislukt.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-espresso/8 bg-white">
      {error && (
        <div className="border-b border-koraal/15 bg-koraal/5 px-4 py-3 text-sm text-koraal">
          {error}
        </div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Plekje</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Buurt</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Ingezonden door</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-light">Datum</th>
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
              <td className="px-4 py-3 text-sm text-espresso-light">{loc.neighborhood ?? "—"}</td>
              <td className="px-4 py-3 text-sm text-espresso-light">{loc.users?.display_name ?? "Onbekend"}</td>
              <td className="px-4 py-3 text-sm text-espresso-light">{formatDate(loc.created_at)}</td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleAction(loc.id, "approve")}
                    disabled={loading === loc.id}
                    className="rounded-lg bg-frisgroen/10 px-3 py-1.5 text-xs font-medium text-frisgroen transition-colors hover:bg-frisgroen/20 disabled:opacity-50"
                  >
                    Goedkeuren
                  </button>
                  <button
                    onClick={() => handleAction(loc.id, "reject")}
                    disabled={loading === loc.id}
                    className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
                  >
                    Afwijzen
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
