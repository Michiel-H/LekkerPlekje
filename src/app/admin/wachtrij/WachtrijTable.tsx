"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
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
      const res = await fetch(`/api/admin/locations/${id}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Actie mislukt.");
      }
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Actie mislukt.";
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-espresso/8 overflow-hidden">
      {error && (
        <div className="px-4 py-3 text-sm text-koraal bg-koraal/5 border-b border-koraal/15">
          {error}
        </div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Naam</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Adres</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Ingezonden door</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Datum</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Acties</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-espresso/5">
          {locations.map((loc) => (
            <tr key={loc.id} className="hover:bg-espresso/[0.01]">
              <td className="px-4 py-3 text-sm font-medium text-espresso">{loc.name}</td>
              <td className="px-4 py-3 text-sm text-espresso-light">{loc.address}</td>
              <td className="px-4 py-3 text-sm text-espresso-light">{loc.users?.display_name ?? "Onbekend"}</td>
              <td className="px-4 py-3 text-sm text-espresso-light">
                {new Date(loc.created_at).toLocaleDateString("nl-NL")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleAction(loc.id, "approve")}
                    disabled={loading === loc.id}
                    className="rounded-lg bg-groen/10 px-3 py-1.5 text-xs font-medium text-groen hover:bg-groen/20 transition-colors disabled:opacity-50"
                  >
                    Goedkeuren
                  </button>
                  <button
                    onClick={() => handleAction(loc.id, "reject")}
                    disabled={loading === loc.id}
                    className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal hover:bg-koraal/20 transition-colors disabled:opacity-50"
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
