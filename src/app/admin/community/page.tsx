import { Suspense } from "react";
import { requireAdminPage } from "@/lib/adminGuard";
import CommunityTable from "./CommunityTable";

export default async function CommunityPage() {
  const currentUser = await requireAdminPage();

  return (
    <div>
      <p className="text-sm text-espresso-light">
        Beheer gebruikers. Klik een rij voor het volledige profiel, of promoveer/verban direct.
      </p>

      <div className="mt-6">
        <Suspense fallback={<div className="text-sm text-espresso-light">Laden...</div>}>
          <CommunityTable currentUserRole={currentUser.role} currentUserId={currentUser.id} />
        </Suspense>
      </div>
    </div>
  );
}
