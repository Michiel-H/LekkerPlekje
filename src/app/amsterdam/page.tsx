import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import MadLibsSearch from "@/components/MadLibsSearch";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoritedSet } from "@/lib/favorites";
import { toppertjeTitleForRole } from "@/lib/titleMap";

export const metadata: Metadata = {
  title: "Amsterdam · LekkerPlekje.com",
  description: "De lekkerste plekjes van Amsterdam, getipt door locals.",
  openGraph: {
    title: "De lekkerste plekjes van Amsterdam · LekkerPlekje.com",
    description: "Cafés, restaurants, terrasjes en koffieplekken in Amsterdam.",
    locale: "nl_NL",
    type: "website",
  },
};

export default async function AmsterdamPage() {
  const [supabase, currentUser] = await Promise.all([createClient(), getCurrentUser()]);

  const { data: cityRow } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", "amsterdam")
    .single();
  const cityId = (cityRow as { id: string } | null)?.id;

  const { data: locations } = cityId
    ? await supabase
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
        .eq("city_id", cityId)
        .order("created_at", { ascending: false })
    : { data: [] as unknown[] };

  const locationIds = (locations || []).map((l: any) => l.id);
  const favoritedSet = await getFavoritedSet(currentUser?.id ?? null, locationIds);

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
    toppertjeTitle: toppertjeTitleForRole(loc.users?.role, loc.users?.pronoun),
    initialFavorited: favoritedSet.has(loc.id),
    currentUserId: currentUser?.id ?? null,
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
