import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MadLibsSearch from "@/components/MadLibsSearch";
import PlekjeCard from "@/components/PlekjeCard";
import { DEMO_PLEKJES } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select(`
      id,
      name,
      neighborhood,
      image_url,
      submitted_by,
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
    .limit(6);

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
        }))
      : DEMO_PLEKJES;

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
              Geen sterren. Geen lange recensies. Gewoon goeie tips voor het
              juiste plekje op het juiste moment.
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
                Ontdekt door locals
              </h2>
              <p className="mt-2 text-espresso-light">
                De lekkerste plekjes van Amsterdam, getipt door onze Toppertjes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plekjes.map((plekje: any) => (
                <PlekjeCard key={plekje.id} {...plekje} />
              ))}
            </div>
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

        {/* Steden */}
        <section className="px-4 py-12 sm:py-16 bg-white/50">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso mb-8">
              Binnenkort ook in
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["Utrecht", "Rotterdam", "Den Haag", "Eindhoven"].map(
                (city) => (
                  <span
                    key={city}
                    className="inline-flex items-center rounded-full bg-espresso/5 px-5 py-2.5 text-sm font-medium text-espresso-light cursor-pointer hover:bg-spritz/10 hover:text-spritz transition-colors"
                  >
                    {city}
                    <span className="ml-2 text-xs opacity-50">coming soon</span>
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
