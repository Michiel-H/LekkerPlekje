import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import MadLibsSearch from "@/components/MadLibsSearch";
import { createClient } from "@/lib/supabase/server";

export default async function AmsterdamPage() {
  const supabase = await createClient();

  const titleMap: Record<string, string> = {
    vent: "Lekker ventje",
    griet: "Lekker grietje",
    neutraal: "Toppertje",
  };

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
      ),
      users!locations_submitted_by_fkey (
        display_name,
        pronoun,
        role
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const plekjes = (locations || []).map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    neighborhood: loc.neighborhood,
    imageUrl: loc.image_url,
    tags: (loc.location_tags || []).map((lt: any) => ({
      emoji: lt.tags?.emoji || "",
      name: lt.tags?.name || "",
    })),
    toppertjeName: loc.users?.display_name,
    toppertjeTitle:
      loc.users?.role === "toppertje" || loc.users?.role === "admin" || loc.users?.role === "superadmin"
        ? titleMap[loc.users?.pronoun || "neutraal"]
        : undefined,
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
              Amsterdam
            </h1>
            <p className="mt-3 text-lg text-espresso-light">
              De lekkerste plekjes van Amsterdam, getipt door locals.
            </p>
          </div>
          <div className="mx-auto max-w-2xl mt-8">
            <MadLibsSearch />
          </div>
        </section>

        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-bold text-espresso mb-6">
              Alle plekjes
            </h2>
            {plekjes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plekjes.map((plekje: any) => (
                  <PlekjeCard key={plekje.id} {...plekje} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-espresso/8 p-12 text-center">
                <p className="font-display text-lg font-semibold text-espresso">
                  Nog geen plekjes in Amsterdam
                </p>
                <p className="mt-2 text-sm text-espresso-light">
                  Wees de eerste die een lekker plekje deelt!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
