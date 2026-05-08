import { createClient } from "@/lib/supabase/server";
import LocatiesTable from "./LocatiesTable";

export default async function LocatiesPage() {
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("*, users!submitted_by(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Alle Locaties</h1>
      <p className="mt-1 text-sm text-espresso-light">
        Alle live locaties op LekkerPlekje.nl. Bewerk of verwijder waar nodig.
      </p>

      <div className="mt-8">
        {locations && locations.length > 0 ? (
          <LocatiesTable locations={locations} />
        ) : (
          <div className="rounded-xl bg-white border border-espresso/8 p-8 text-center">
            <p className="text-espresso-light">Nog geen actieve locaties.</p>
          </div>
        )}
      </div>
    </div>
  );
}
