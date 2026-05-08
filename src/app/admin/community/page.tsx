import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import CommunityTable from "./CommunityTable";

export default async function CommunityPage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Community</h1>
      <p className="mt-1 text-sm text-espresso-light">
        Beheer gebruikers. Promoveer actieve gebruikers tot Toppertje of demoveer als dat nodig is.
      </p>

      <div className="mt-8">
        {users && users.length > 0 ? (
          <CommunityTable users={users} currentUserRole={currentUser?.role ?? "admin"} />
        ) : (
          <div className="rounded-xl bg-white border border-espresso/8 p-8 text-center">
            <p className="text-espresso-light">Nog geen gebruikers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
