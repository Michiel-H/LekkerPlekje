"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  status: string;
  created_at: string;
  users: { display_name: string } | null;
}

export default function LocatiesTable({ locations }: { locations: Location[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  function startEdit(loc: Location) {
    setEditing(loc.id);
    setEditName(loc.name);
    setEditAddress(loc.address);
    setEditNeighborhood(loc.neighborhood ?? "");
  }

  async function saveEdit(id: string) {
    setLoading(id);
    const supabase = createClient();
    await supabase
      .from("locations")
      .update({ name: editName, address: editAddress, neighborhood: editNeighborhood || null } as never)
      .eq("id", id);
    setEditing(null);
    router.refresh();
    setLoading(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
    setLoading(id);
    const supabase = createClient();
    await supabase.from("locations").delete().eq("id", id);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="rounded-xl bg-white border border-espresso/8 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Naam</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Adres</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Buurt</th>
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
                  <td className="px-4 py-3 text-sm text-espresso-light">{loc.users?.display_name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => saveEdit(loc.id)}
                        disabled={loading === loc.id}
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
                        disabled={loading === loc.id}
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
    </div>
  );
}
