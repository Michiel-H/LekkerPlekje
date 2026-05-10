import { getCurrentUser } from "@/lib/auth";
import CommunityTable from "./CommunityTable";

export default async function CommunityPage() {
  const currentUser = await getCurrentUser();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Community</h1>
      <p className="mt-1 text-sm text-espresso-light">
        Beheer gebruikers. Promoveer actieve gebruikers tot Toppertje of demoveer als dat nodig is.
      </p>

      <div className="mt-8">
        <CommunityTable currentUserRole={currentUser?.role ?? "admin"} />
      </div>
    </div>
  );
}
