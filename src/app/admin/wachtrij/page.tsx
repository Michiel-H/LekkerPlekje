import { requireAdminPage } from "@/lib/adminGuard";
import { createClient } from "@/lib/supabase/server";
import WachtrijTable from "./WachtrijTable";

export default async function WachtrijPage() {
  await requireAdminPage();
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, address, neighborhood, image_url, created_at, users!submitted_by(display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <p className="text-sm text-espresso-light">
        Inzendingen die wachten op goedkeuring. Klik een rij om alles te bekijken voor je beslist.
      </p>

      <div className="mt-6">
        {locations && locations.length > 0 ? (
          <WachtrijTable locations={locations} />
        ) : (
          <div className="rounded-xl border border-espresso/8 bg-white p-8 text-center">
            <p className="text-espresso-light">Geen openstaande suggesties. Alles is bijgewerkt!</p>
          </div>
        )}
      </div>
    </div>
  );
}
