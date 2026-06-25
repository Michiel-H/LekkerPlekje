"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LocationStatus } from "@/lib/supabase/types";
import { INPUT_CLASS } from "@/app/admin/filters";

/**
 * Moderate a single location from its detail view. Reuses the existing
 * approve/reject/edit/delete API routes (which own the audit logging).
 */
export default function LocationActions({
  id,
  status,
  name,
  address,
  neighborhood,
}: {
  id: string;
  status: LocationStatus;
  name: string;
  address: string;
  neighborhood: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name, address, neighborhood: neighborhood ?? "" });

  async function run(label: string, fn: () => Promise<Response>, after?: () => void) {
    setLoading(label);
    setError(null);
    try {
      const res = await fn();
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Actie mislukt.");
      }
      if (after) after();
      else router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Actie mislukt.");
    } finally {
      setLoading(null);
    }
  }

  function setStatus(action: "approve" | "reject") {
    run(action, () => fetch(`/api/admin/locations/${id}/${action}`, { method: "POST" }));
  }

  function save() {
    run(
      "save",
      () =>
        fetch(`/api/admin/locations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            address: form.address,
            neighborhood: form.neighborhood || null,
          }),
        }),
      () => {
        setEditing(false);
        router.refresh();
      }
    );
  }

  function remove() {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
    run(
      "delete",
      () => fetch(`/api/admin/locations/${id}`, { method: "DELETE" }),
      () => router.push("/admin/locaties")
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-koraal">{error}</p>}

      {editing ? (
        <div className="space-y-2">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Naam"
            className={`w-full ${INPUT_CLASS}`}
          />
          <input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Adres"
            className={`w-full ${INPUT_CLASS}`}
          />
          <input
            value={form.neighborhood}
            onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
            placeholder="Buurt"
            className={`w-full ${INPUT_CLASS}`}
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={loading === "save"}
              className="rounded-lg bg-frisgroen/10 px-3 py-1.5 text-xs font-medium text-frisgroen transition-colors hover:bg-frisgroen/20 disabled:opacity-50"
            >
              Opslaan
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setForm({ name, address, neighborhood: neighborhood ?? "" });
              }}
              className="rounded-lg bg-espresso/5 px-3 py-1.5 text-xs font-medium text-espresso-light transition-colors hover:bg-espresso/10"
            >
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {status !== "published" && (
            <button
              onClick={() => setStatus("approve")}
              disabled={!!loading}
              className="rounded-lg bg-frisgroen/10 px-3 py-1.5 text-xs font-medium text-frisgroen transition-colors hover:bg-frisgroen/20 disabled:opacity-50"
            >
              Goedkeuren
            </button>
          )}
          {status !== "rejected" && (
            <button
              onClick={() => setStatus("reject")}
              disabled={!!loading}
              className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
            >
              Afwijzen
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-espresso/5 px-3 py-1.5 text-xs font-medium text-espresso-light transition-colors hover:bg-espresso/10"
          >
            Bewerken
          </button>
          <button
            onClick={remove}
            disabled={loading === "delete"}
            className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
          >
            Verwijderen
          </button>
        </div>
      )}
    </div>
  );
}
