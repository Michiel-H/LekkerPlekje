import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import VoteButtons from "./VoteButtons";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlekjeDetailPage({ params }: Props) {
  const { id } = await params;

  let plekje: any = null;

  // Try fetching from Supabase if the id looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUUID) {
    const supabase = await createClient();

    const titleMap: Record<string, string> = {
      vent: "Lekker ventje",
      griet: "Lekker grietje",
      neutraal: "Toppertje",
    };

    const { data: location } = await supabase
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
      .eq("id", id)
      .single();

    const loc = location as any;
    if (loc) {
      plekje = {
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
      };
    }
  }

  if (!plekje) {
    return (
      <>
        <Header />
        <main className="flex-1 px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-espresso">
            Plekje niet gevonden
          </h1>
          <p className="mt-2 text-espresso-light">
            Dit plekje bestaat niet of is verwijderd.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-full bg-spritz px-6 py-2.5 text-sm font-medium text-white hover:bg-spritz-hover transition-colors"
          >
            Terug naar home
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/resultaten"
            className="text-sm text-espresso-light hover:text-spritz transition-colors"
          >
            &larr; Terug naar resultaten
          </Link>

          {/* Image */}
          <div className="mt-6 aspect-[16/9] rounded-2xl bg-groen/10 overflow-hidden">
            {plekje.imageUrl ? (
              <img
                src={plekje.imageUrl}
                alt={plekje.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-display font-semibold text-groen/40">
                Geen afbeelding
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
              {plekje.name}
            </h1>
            {plekje.neighborhood && (
              <p className="mt-1 text-lg text-espresso-light">
                {plekje.neighborhood}, Amsterdam
              </p>
            )}
          </div>

          {/* Toppertje credit */}
          {plekje.toppertjeName && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-spritz/10 px-4 py-2">
              <span className="text-sm font-medium text-spritz">
                Ontdekt door: {plekje.toppertjeName}
              </span>
              {plekje.toppertjeTitle && (
                <span className="text-sm text-spritz/70">
                  {plekje.toppertjeTitle}
                </span>
              )}
            </div>
          )}

          {/* Tags with voting */}
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-espresso mb-4">
              Wat vinden mensen?
            </h2>
            <div className="space-y-3">
              {plekje.tags.map((tag: any) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between rounded-xl bg-white border border-espresso/8 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-espresso">
                      {tag.name}
                    </span>
                  </div>
                  <VoteButtons tagName={tag.name} />
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder for motivation */}
          <div className="mt-8 rounded-xl bg-groen/5 border border-groen/15 p-6">
            <p className="text-sm text-groen font-medium">
              Ken je dit plekje? Stem op de tags hierboven om anderen te helpen!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
