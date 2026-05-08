import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import { DEMO_PLEKJES } from "@/lib/demo-data";
import { TAGS } from "@/lib/tags";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ gezelschap?: string; vibe?: string; stad?: string }>;
}

export default async function ResultatenPage({ searchParams }: Props) {
  const params = await searchParams;
  const { gezelschap, vibe, stad } = params;

  const selectedTags = [gezelschap, vibe].filter(Boolean) as string[];
  const tagDetails = selectedTags.map(
    (slug) => TAGS.find((t) => t.slug === slug)!
  ).filter(Boolean);

  // Demo: filter plekjes that have at least one matching tag
  const filtered = DEMO_PLEKJES.filter((plekje) =>
    tagDetails.some((tag) =>
      plekje.tags.some((pt) => pt.name === tag.name)
    )
  );

  const results = filtered.length > 0 ? filtered : DEMO_PLEKJES;

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((plekje) => (
              <PlekjeCard key={plekje.id} {...plekje} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
