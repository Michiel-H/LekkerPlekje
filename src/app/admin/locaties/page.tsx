import { Suspense } from "react";
import { requireAdminPage } from "@/lib/adminGuard";
import { createClient } from "@/lib/supabase/server";
import LocatiesTable from "./LocatiesTable";

export default async function LocatiesPage() {
  await requireAdminPage();

  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("id, name").order("name");
  const cities = (data as { id: string; name: string }[] | null) ?? [];

  return (
    <div>
      <p className="text-sm text-espresso-light">
        Alle plekjes op LekkerPlekje.com. Klik een rij voor foto, kaart, tags en moderatie.
      </p>

      <div className="mt-6">
        <Suspense fallback={<div className="text-sm text-espresso-light">Laden...</div>}>
          <LocatiesTable cities={cities} />
        </Suspense>
      </div>
    </div>
  );
}
