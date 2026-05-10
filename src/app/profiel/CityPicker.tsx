"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface City {
  id: string;
  name: string;
  status: string;
}

interface Props {
  userId: string;
  initialCityId: string | null;
  initialCityName: string | null;
}

export default function CityPicker({ userId, initialCityId, initialCityName }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState(initialCityId ?? "");
  const [cityName, setCityName] = useState(initialCityName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("cities")
        .select("id, name, status")
        .eq("status", "live")
        .order("name");
      if (data) setCities(data as City[]);
    })();
  }, [editing]);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ preferred_city_id: cityId || null } as never)
      .eq("id", userId);

    // Update local label
    const next = cities.find((c) => c.id === cityId);
    setCityName(next ? next.name : null);
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-groen/10 px-3 py-1 text-xs font-medium text-groen hover:bg-groen/20 transition-colors"
        title="Klik om je voorkeurstad te wijzigen"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        {cityName ?? "Geen voorkeurstad"}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={cityId}
        onChange={(e) => setCityId(e.target.value)}
        className="rounded-lg border border-espresso/15 bg-white px-2 py-1 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
      >
        <option value="">Geen voorkeur</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-groen/10 px-2 py-1 text-xs font-medium text-groen hover:bg-groen/20 transition-colors disabled:opacity-50"
      >
        {saving ? "..." : "Opslaan"}
      </button>
      <button
        onClick={() => {
          setEditing(false);
          setCityId(initialCityId ?? "");
        }}
        className="rounded-lg bg-espresso/5 px-2 py-1 text-xs font-medium text-espresso-light hover:bg-espresso/10 transition-colors"
      >
        ×
      </button>
    </div>
  );
}
