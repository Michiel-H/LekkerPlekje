import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import { DEMO_PLEKJES } from "@/lib/demo-data";

export default function ProfielPage() {
  // TODO: fetch real user data from Supabase
  const user: {
    displayName: string;
    pronoun: "vent" | "griet" | "neutraal";
    role: "user" | "toppertje" | "admin" | "superadmin";
    approvedCount: number;
    createdAt: string;
  } = {
    displayName: "Patrick",
    pronoun: "vent",
    role: "toppertje",
    approvedCount: 7,
    createdAt: "2026-04-01",
  };

  const titleMap = {
    vent: "Lekker ventje",
    griet: "Lekker grietje",
    neutraal: "Toppertje",
  };

  const myPlekjes = DEMO_PLEKJES.filter((p) => p.toppertjeName === "Patrick");

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-spritz/10 flex items-center justify-center text-2xl font-display font-bold text-spritz">
              {user.displayName.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-espresso">
                {user.displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {user.role === "toppertje" || user.role === "admin" || user.role === "superadmin" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-spritz/10 px-3 py-1 text-sm font-medium text-spritz">
                    {user.role === "admin" || user.role === "superadmin" ? "Beheerder" : titleMap[user.pronoun]}
                  </span>
                ) : (
                  <span className="text-sm text-espresso-light">
                    {user.approvedCount} / 5 plekjes tot Toppertje-status
                  </span>
                )}
                <span className="text-xs text-espresso-light">
                  Lid sinds{" "}
                  {new Date(user.createdAt).toLocaleDateString("nl-NL", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar for non-toppertjes */}
          {user.role === "user" && (
            <div className="mb-8 rounded-xl bg-white border border-espresso/8 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-espresso">
                  Voortgang naar Toppertje
                </span>
                <span className="text-espresso-light">
                  {user.approvedCount}/5
                </span>
              </div>
              <div className="h-2 rounded-full bg-espresso/5">
                <div
                  className="h-2 rounded-full bg-spritz transition-all"
                  style={{
                    width: `${Math.min((user.approvedCount / 5) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* My plekjes */}
          <h2 className="font-display text-xl font-semibold text-espresso mb-4">
            Mijn plekjes
          </h2>
          {myPlekjes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPlekjes.map((plekje) => (
                <PlekjeCard key={plekje.id} {...plekje} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-espresso/8 p-8 text-center">
              <p className="text-espresso-light">
                Je hebt nog geen plekjes getipt. Begin met je eerste!
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
