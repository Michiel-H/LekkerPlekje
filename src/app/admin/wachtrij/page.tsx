import { createClient } from "@/lib/supabase/server";
import WachtrijTable from "./WachtrijTable";

export default async function WachtrijPage() {
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("*, users!submitted_by(display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Wachtrij</h1>
      <p className="mt-1 text-sm text-espresso-light">
        Inzendingen van gebruikers die wachten op goedkeuring.
      </p>

      <div className="mt-8">
        {locations && locations.length > 0 ? (
          <WachtrijTable locations={locations} />
        ) : (
          <div className="rounded-xl bg-white border border-espresso/8 p-8 text-center">
            <p className="text-espresso-light">Geen openstaande suggesties. Alles is bijgewerkt!</p>
          </div>
        )}
      </div>
    </div>
  );
}
