import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ProfielPage() {
  const user = await getCurrentUser();

  const titleMap: Record<string, string> = {
    vent: "Lekker ventje",
    griet: "Lekker grietje",
    neutraal: "Toppertje",
  };

  // Middleware redirects to /login if not authed, but handle gracefully
  const displayUser = user
    ? {
        displayName: user.display_name,
        pronoun: user.pronoun,
        role: user.role,
        approvedCount: user.approved_count,
        createdAt: user.created_at,
      }
    : {
        displayName: "Gast",
        pronoun: "neutraal" as const,
        role: "user" as const,
        approvedCount: 0,
        createdAt: new Date().toISOString(),
      };

  let myPlekjes: any[] = [];

  if (user) {
    const supabase = await createClient();
    const { data: locations } = await supabase
      .from("locations")
      .select(`
        id,
        name,
        neighborhood,
        image_url,
        location_tags (
          tags (
            name,
            emoji
          )
        )
      `)
      .eq("submitted_by", user.id);

    if (locations && locations.length > 0) {
      myPlekjes = locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        neighborhood: loc.neighborhood,
        imageUrl: loc.image_url,
        tags: (loc.location_tags || []).map((lt: any) => ({
          emoji: lt.tags?.emoji || "",
          name: lt.tags?.name || "",
        })),
        toppertjeName: displayUser.displayName,
        toppertjeTitle:
          displayUser.role === "toppertje" || displayUser.role === "admin" || displayUser.role === "superadmin"
            ? titleMap[displayUser.pronoun]
            : undefined,
      }));
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-spritz/10 flex items-center justify-center text-2xl font-display font-bold text-spritz">
              {displayUser.displayName.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-espresso">
                {displayUser.displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {displayUser.role === "toppertje" || displayUser.role === "admin" || displayUser.role === "superadmin" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-spritz/10 px-3 py-1 text-sm font-medium text-spritz">
                    {displayUser.role === "admin" || displayUser.role === "superadmin" ? "Beheerder" : titleMap[displayUser.pronoun]}
                  </span>
                ) : (
                  <span className="text-sm text-espresso-light">
                    {displayUser.approvedCount} / 5 plekjes tot Toppertje-status
                  </span>
                )}
                <span className="text-xs text-espresso-light">
                  Lid sinds{" "}
                  {new Date(displayUser.createdAt).toLocaleDateString("nl-NL", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar for non-toppertjes */}
          {displayUser.role === "user" && (
            <div className="mb-8 rounded-xl bg-white border border-espresso/8 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-espresso">
                  Voortgang naar Toppertje
                </span>
                <span className="text-espresso-light">
                  {displayUser.approvedCount}/5
                </span>
              </div>
              <div className="h-2 rounded-full bg-espresso/5">
                <div
                  className="h-2 rounded-full bg-spritz transition-all"
                  style={{
                    width: `${Math.min((displayUser.approvedCount / 5) * 100, 100)}%`,
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
              {myPlekjes.map((plekje: any) => (
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
