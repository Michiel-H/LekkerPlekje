import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import VoteButtons from "./VoteButtons";
import FavoriteButton from "@/components/FavoriteButton";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { toppertjeTitleForRole } from "@/lib/titleMap";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return { title: "Plekje niet gevonden · LekkerPlekje.com" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("name, neighborhood, image_url, cities (name)")
    .eq("id", id)
    .single();
  const loc = data as
    | {
        name: string;
        neighborhood: string | null;
        image_url: string | null;
        cities: { name: string } | null;
      }
    | null;
  if (!loc) {
    return { title: "Plekje niet gevonden · LekkerPlekje.com" };
  }

  const location = [loc.neighborhood, loc.cities?.name].filter(Boolean).join(", ");
  const title = location
    ? `${loc.name} — ${location} · LekkerPlekje.com`
    : `${loc.name} · LekkerPlekje.com`;
  const description = `Ontdek ${loc.name}${
    location ? ` in ${location}` : ""
  } op LekkerPlekje — getipt door locals.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "nl_NL",
      images: loc.image_url ? [{ url: loc.image_url, alt: loc.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: loc.image_url ? [loc.image_url] : undefined,
    },
  };
}

export default async function PlekjeDetailPage({ params }: Props) {
  const { id } = await params;

  let plekje: any = null;

  // Try fetching from Supabase if the id looks like a UUID
  if (isUuid(id)) {
    const supabase = await createClient();

    const { data: location } = await supabase
      .from("locations")
      .select(`
        id,
        name,
        address,
        neighborhood,
        image_url,
        submitted_by,
        favorites_count,
        cities (name),
        location_tags (
          id,
          score,
          total_votes,
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
        address: loc.address,
        neighborhood: loc.neighborhood,
        cityName: loc.cities?.name ?? null,
        imageUrl: loc.image_url,
        tags: (loc.location_tags || []).map((lt: any) => ({
          locationTagId: lt.id,
          emoji: lt.tags?.emoji || "",
          name: lt.tags?.name || "",
          lekkerCount: lt.score || 0,
          nietLekkerCount: (lt.total_votes || 0) - (lt.score || 0),
        })),
        toppertjeName: loc.users?.display_name,
        toppertjeTitle: toppertjeTitleForRole(loc.users?.role, loc.users?.pronoun),
        favoritesCount: loc.favorites_count ?? 0,
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

  // Schema.org JSON-LD for rich-result eligibility. Embedded values come
  // from admin-approved DB content, but escape `<` defensively in case a
  // submitter ever sneaks an HTML-looking name past moderation.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: plekje.name,
    ...(plekje.imageUrl ? { image: plekje.imageUrl } : {}),
    address: {
      "@type": "PostalAddress",
      ...(plekje.address ? { streetAddress: plekje.address } : {}),
      ...(plekje.neighborhood ? { addressLocality: plekje.neighborhood } : {}),
      ...(plekje.cityName ? { addressRegion: plekje.cityName } : {}),
      addressCountry: "NL",
    },
  };
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/resultaten"
            className="text-sm text-espresso-light hover:text-spritz transition-colors"
          >
            &larr; Terug naar resultaten
          </Link>

          {/* Image */}
          <div className="mt-6 aspect-[16/9] rounded-2xl bg-groen/10 overflow-hidden relative">
            {plekje.imageUrl ? (
              <Image
                src={plekje.imageUrl}
                alt={plekje.name}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-display font-semibold text-groen/40">
                Geen afbeelding
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
                {plekje.name}
              </h1>
              {(plekje.neighborhood || plekje.cityName) && (
                <p className="mt-1 text-lg text-espresso-light">
                  {[plekje.neighborhood, plekje.cityName].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <FavoriteButton
              locationId={plekje.id}
              size="md"
              initialCount={plekje.favoritesCount}
            />
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
                  className="rounded-xl bg-white border border-espresso/8 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium text-espresso pt-1.5">
                      {tag.name}
                    </span>
                    <div className="flex-1 max-w-md">
                      <VoteButtons
                        locationTagId={tag.locationTagId}
                        initialLekker={tag.lekkerCount}
                        initialNietLekker={tag.nietLekkerCount}
                      />
                    </div>
                  </div>
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
