import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import { TAGS } from "@/lib/tags";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoritedSet } from "@/lib/favorites";
import { flairFor } from "@/lib/rewards";

interface Props {
  searchParams: Promise<{ gezelschap?: string; vibe?: string; stad?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { gezelschap, vibe, stad } = await searchParams;
  const tagNames = [gezelschap, vibe]
    .map((slug) => (slug ? TAGS.find((t) => t.slug === slug)?.name : null))
    .filter(Boolean);
  const cityName = stad
    ? stad.charAt(0).toUpperCase() + stad.slice(1).replace(/-/g, " ")
    : null;
  const parts = [
    tagNames.length ? `Plekjes voor ${tagNames.join(" en ")}` : "Alle plekjes",
    cityName ? `in ${cityName}` : null,
  ].filter(Boolean);
  const title = `${parts.join(" ")} · LekkerPlekje.com`;
  return {
    title,
    description: `${parts.join(" ")} — getipt door locals.`,
  };
}

export default async function ResultatenPage({ searchParams }: Props) {
  const params = await searchParams;
  const { gezelschap, vibe, stad } = params;

  const selectedTags = [gezelschap, vibe].filter(Boolean) as string[];
  const tagDetails = selectedTags.map(
    (slug) => TAGS.find((t) => t.slug === slug)!
  ).filter(Boolean);

  const [supabase, currentUser] = await Promise.all([createClient(), getCurrentUser()]);

  // Look up the city by slug if one was selected, so we can filter results.
  let cityId: string | null = null;
  if (stad) {
    const { data: cityRow } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", stad)
      .single();
    cityId = (cityRow as { id: string } | null)?.id ?? null;
  }

  let results: any[] = [];

  if (selectedTags.length > 0) {
    // Get tag IDs from the database for the selected slugs
    const { data: dbTags } = await supabase
      .from("tags")
      .select("id, slug")
      .in("slug", selectedTags);

    const tagRows = dbTags as any[] | null;
    if (tagRows && tagRows.length > 0) {
      const tagIds = tagRows.map((t: any) => t.id);

      // Find locations that have these tags
      const { data: locationTags } = await supabase
        .from("location_tags")
        .select("location_id")
        .in("tag_id", tagIds);

      const ltRows = locationTags as any[] | null;
      if (ltRows && ltRows.length > 0) {
        const locationIds = [...new Set(ltRows.map((lt: any) => lt.location_id))];

        let locationsQuery = supabase
          .from("locations")
          .select(`
            id,
            name,
            neighborhood,
            image_url,
            submitted_by,
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
              role,
              points
            )
          `)
          .eq("status", "published")
          .in("id", locationIds)
          .order("created_at", { ascending: false })
          .limit(50);
        if (cityId) locationsQuery = locationsQuery.eq("city_id", cityId);
        const { data: locations } = await locationsQuery;

        if (locations && locations.length > 0) {
          results = (locations as any[]).map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            neighborhood: loc.neighborhood,
            imageUrl: loc.image_url,
            tags: (loc.location_tags || []).map((lt: any) => ({
              emoji: lt.tags?.emoji || "",
              name: lt.tags?.name || "",
            })),
            toppertjeName: loc.users?.display_name,
            toppertjeTitle: flairFor({
              role: loc.users?.role,
              pronoun: loc.users?.pronoun,
              points: loc.users?.points,
            }),
            favoritesCount: loc.favorites_count ?? 0,
          }));
        }
      }
    }
  } else {
    // No tag filters — show all published locations (still filter by city if set)
    let locationsQuery = supabase
      .from("locations")
      .select(`
        id,
        name,
        neighborhood,
        image_url,
        submitted_by,
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
          role,
          points
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    if (cityId) locationsQuery = locationsQuery.eq("city_id", cityId);
    const { data: locations } = await locationsQuery;

    if (locations && locations.length > 0) {
      results = locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        neighborhood: loc.neighborhood,
        imageUrl: loc.image_url,
        tags: (loc.location_tags || []).map((lt: any) => ({
          emoji: lt.tags?.emoji || "",
          name: lt.tags?.name || "",
        })),
        toppertjeName: loc.users?.display_name,
        toppertjeTitle: flairFor({
          role: loc.users?.role,
          pronoun: loc.users?.pronoun,
          points: loc.users?.points,
        }),
        favoritesCount: loc.favorites_count ?? 0,
      }));
    }
  }

  // Batch favorites lookup across all displayed results (after both branches)
  {
    const favoritedSet = await getFavoritedSet(
      currentUser?.id ?? null,
      results.map((r) => r.id)
    );
    results = results.map((r) => ({
      ...r,
      initialFavorited: favoritedSet.has(r.id),
      currentUserId: currentUser?.id ?? null,
    }));
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm text-espresso-light hover:text-spritz transition-colors"
            >
              &larr; Nieuwe zoekopdracht
            </Link>

            <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-espresso">
              {tagDetails.length > 0 ? (
                <>
                  Plekjes voor{" "}
                  {tagDetails.map((t, i) => (
                    <span key={t.slug}>
                      {i > 0 && (i === tagDetails.length - 1 ? " en " : ", ")}
                      <span className="text-spritz">
                        {t.name}
                      </span>
                    </span>
                  ))}
                  {stad && (
                    <span className="text-espresso">
                      {" "}in {stad.charAt(0).toUpperCase() + stad.slice(1).replace("-", " ")}
                    </span>
                  )}
                </>
              ) : (
                `Alle plekjes in ${stad ? stad.charAt(0).toUpperCase() + stad.slice(1).replace("-", " ") : "Amsterdam"}`
              )}
            </h1>
            <p className="mt-2 text-espresso-light">
              {results.length} plekje{results.length !== 1 ? "s" : ""} gevonden
            </p>
          </div>

          {/* Active filters */}
          {tagDetails.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {tagDetails.map((tag) => (
                <span
                  key={tag.slug}
                  className="inline-flex items-center gap-1.5 rounded-full bg-groen/10 px-3 py-1.5 text-sm font-medium text-groen"
                >
                  {tag.name}
                </span>
              ))}
              <Link
                href="/resultaten"
                className="inline-flex items-center rounded-full bg-espresso/5 px-3 py-1.5 text-sm text-espresso-light hover:bg-espresso/10 transition-colors"
              >
                Wis filters
              </Link>
            </div>
          )}

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((plekje: any) => (
                <PlekjeCard key={plekje.id} {...plekje} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-espresso/8 p-12 text-center">
              <p className="font-display text-lg font-semibold text-espresso">
                Nog geen plekjes gevonden
              </p>
              <p className="mt-2 text-sm text-espresso-light">
                Er zijn nog geen plekjes die matchen met je zoekopdracht. Wees de eerste!
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
