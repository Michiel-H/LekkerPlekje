import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import BeheerderTable from "./BeheerderTable";

export default async function BeheerdersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !isSuperAdmin(currentUser.role)) {
    redirect("/admin");
  }

  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-sm text-espresso-light">
        Alleen jij als superadmin kunt admins aanmaken of verwijderen.
      </p>

      <div className="mt-6">
        {users && users.length > 0 ? (
          <BeheerderTable users={users} />
        ) : (
          <div className="rounded-xl bg-white border border-espresso/8 p-8 text-center">
            <p className="text-espresso-light">Nog geen gebruikers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
