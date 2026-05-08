import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function HoeHetWerktPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso text-center">
            Hoe werkt LekkerPlekje?
          </h1>
          <p className="mt-4 text-lg text-espresso-light text-center">
            Geen sterren. Geen lange recensies. Gewoon eerlijke tips van echte
            mensen.
          </p>

          <div className="mt-12 space-y-12">
            {/* 1. Zoeken */}
            <section>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-spritz/10 flex items-center justify-center text-sm font-bold text-spritz shrink-0">
                  1
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-espresso">
                    1. Zoek op situatie
                  </h2>
                  <p className="mt-2 text-espresso-light">
                    Geen zoekbalk met &quot;pizza Amsterdam&quot;. Je vult een
                    zin aan: <em>Ik zoek een lekker plekje voor</em>{" "}
                    <strong>een date</strong> <em>om</em>{" "}
                    <strong>fancy te dineren</strong> <em>het liefst</em>{" "}
                    <strong>aan het water</strong>. Wij matchen op tags, niet op
                    sterrenscore.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Tags */}
            <section>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-groen/10 flex items-center justify-center text-sm font-bold text-groen shrink-0">
                  2
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-espresso">
                    2. Alles draait om tags
                  </h2>
                  <p className="mt-2 text-espresso-light">
                    Elk plekje heeft tags die beschrijven waarvoor het geschikt
                    is: &quot;Met vrienden&quot;, &quot;In de zon&quot;,
                    &quot;Uitbrakken&quot;. Tags zijn niet vast — ze worden door
                    de community gestemd.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Stemmen */}
            <section>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-frisgroen/10 flex items-center justify-center text-sm font-bold text-frisgroen shrink-0">
                  3
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-espresso">
                    3. Stem op tags
                  </h2>
                  <p className="mt-2 text-espresso-light">
                    Was die kroeg echt chill voor een date? Lekker. Was het
                    eigenlijk niet zo gezellig met je ouders? Niet zo lekker.
                    Tags met te veel negatieve stemmen verdwijnen vanzelf.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Scout worden */}
            <section>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-spritz/10 flex items-center justify-center text-sm font-bold text-spritz shrink-0">
                  4
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-espresso">
                    4. Word Scout
                  </h2>
                  <p className="mt-2 text-espresso-light">
                    Tip 5 plekjes die goedgekeurd worden en je wordt een{" "}
                    <strong className="text-spritz">Lekker Ventje</strong>,{" "}
                    <strong className="text-spritz">Lekker Grietje</strong>, of{" "}
                    <strong className="text-spritz">Toppertje</strong>. Scouts
                    mogen direct posten zonder moderatie, en krijgen credit op
                    elk plekje dat ze tippen.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-spritz px-8 py-3 text-base font-semibold text-white hover:bg-spritz-hover transition-colors"
            >
              Zoek je eerste plekje
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
