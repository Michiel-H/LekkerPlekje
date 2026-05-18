import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MadLibsSearch from "@/components/MadLibsSearch";
import HomePlekjesGrid from "./HomePlekjesGrid";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoritedSet } from "@/lib/favorites";

export default async function Home() {
  const currentUser = await getCurrentUser();
  const supabase = await createClient();

  let preferredCityName: string | null = null;
  let query = supabase
    .from("locations")
    .select(`
      id,
      name,
      neighborhood,
      image_url,
      submitted_by,
      city_id,
      favorites_count,
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
    .order("created_at", { ascending: false })
    .limit(12);

  if (currentUser?.preferred_city_id) {
    query = query.eq("city_id", currentUser.preferred_city_id);
  }

  // Run locations and (optional) city name fetch in parallel
  const [{ data: locations }, cityRes] = await Promise.all([
    query,
    currentUser?.preferred_city_id
      ? supabase
          .from("cities")
          .select("name")
          .eq("id", currentUser.preferred_city_id)
          .single()
      : Promise.resolve({ data: null as any }),
  ]);
  preferredCityName = (cityRes.data as any)?.name ?? null;

  const locationIds = (locations || []).map((l: any) => l.id);
  const favoritedSet = await getFavoritedSet(currentUser?.id ?? null, locationIds);

  const titleMap: Record<string, string> = {
    vent: "Lekker ventje",
    griet: "Lekker grietje",
    neutraal: "Toppertje",
  };

  const plekjes =
    locations && locations.length > 0
      ? locations.map((loc: any) => ({
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
          initialFavorited: favoritedSet.has(loc.id),
          currentUserId: currentUser?.id ?? null,
          favoritesCount: loc.favorites_count ?? 0,
        }))
      : [];

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero + Mad Libs */}
        <section className="px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso leading-tight">
              Vind het lekkerste plekje
            </h1>
            <p className="mt-4 text-lg text-espresso-light max-w-xl mx-auto">
              Vul de zin hieronder aan en ontdek meteen een lekker plekje dat past bij jouw moment.
            </p>
          </div>

          <div className="mx-auto max-w-2xl mt-10">
            <MadLibsSearch />
          </div>
        </section>

        {/* Uitgelichte plekjes */}
        <section className="px-4 py-12 sm:py-16 bg-white/50">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso">
                {preferredCityName ? `Ontdekt door locals in ${preferredCityName}` : "Ontdekt door locals"}
              </h2>
              <p className="mt-2 text-espresso-light">
                {preferredCityName
                  ? `Plekjes uit jouw voorkeurstad. Pas hem aan op je profiel of zoek hieronder voor andere steden.`
                  : "De lekkerste plekjes, getipt door onze Toppertjes."}
              </p>
            </div>

            <HomePlekjesGrid
              initialPlekjes={plekjes}
              cityId={currentUser?.preferred_city_id ?? null}
              currentUserId={currentUser?.id ?? null}
            />
          </div>
        </section>

        {/* Hoe het werkt */}
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso text-center mb-10">
              Zo werkt het
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-spritz/10 flex items-center justify-center text-2xl mb-4">
                  1
                </div>
                <h3 className="font-display text-lg font-semibold text-espresso">
                  Vertel wat je zoekt
                </h3>
                <p className="mt-2 text-sm text-espresso-light">
                  Vul de zin aan: wie, wat, welke sfeer. Wij vinden plekjes die
                  matchen.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-groen/10 flex items-center justify-center text-2xl mb-4">
                  2
                </div>
                <h3 className="font-display text-lg font-semibold text-espresso">
                  Stem op tags
                </h3>
                <p className="mt-2 text-sm text-espresso-light">
                  Lekker plekje voor een date? Stem Lekker. Niet zo gezellig met
                  je ouders? Stem Niet lekker. Zo worden tips steeds beter.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-frisgroen/10 flex items-center justify-center text-2xl mb-4">
                  3
                </div>
                <h3 className="font-display text-lg font-semibold text-espresso">
                  Word Toppertje
                </h3>
                <p className="mt-2 text-sm text-espresso-light">
                  Tip 5 goedgekeurde plekjes en word een Lekker Ventje, Lekker
                  Grietje of Toppertje. Toppertjes posten direct live.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steden — direct doorklikken */}
        <section className="px-4 py-12 sm:py-16 bg-white/50">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso mb-2">
              In welke stad zoek je?
            </h2>
            <p className="text-espresso-light mb-8">
              Klik je stad aan en zie alle lekkere plekjes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Amsterdam",
                "Rotterdam",
                "Utrecht",
                "Den Haag",
                "Groningen",
                "Leiden",
                "Delft",
                "Zwolle",
              ].map((city) => {
                const slug = city.toLowerCase().replace(/ /g, "-");
                return (
                  <a
                    key={city}
                    href={`/resultaten?stad=${slug}`}
                    className="inline-flex items-center rounded-full bg-espresso/5 px-5 py-2.5 text-sm font-medium text-espresso-light hover:bg-spritz/10 hover:text-spritz transition-colors"
                  >
                    {city}
                  </a>
                );
              })}
            </div>

            <h3 className="mt-12 font-display text-lg font-semibold text-espresso mb-4">
              Binnenkort ook in
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Eindhoven",
                "Enschede",
                "Wageningen",
                "Tilburg",
                "Nijmegen",
                "Maastricht",
                "Breda",
                "Leeuwarden",
                "Haarlem",
              ].map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center rounded-full bg-espresso/5 px-4 py-1.5 text-xs font-medium text-espresso-light/70"
                >
                  {city}
                  <span className="ml-1.5 opacity-50">coming soon</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
