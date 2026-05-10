import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-creme">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-spritz">LP</span>
              <span className="font-display text-lg font-semibold text-espresso">
                LekkerPlekje
              </span>
            </Link>
            <p className="mt-2 text-sm text-espresso-light">
              Geen sterren. Geen lange recensies.
              <br />
              Gewoon goeie tips voor het juiste plekje.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-espresso">Ontdek</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/amsterdam"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Amsterdam
                </Link>
              </li>
              <li>
                <Link
                  href="/hoe-het-werkt"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Hoe het werkt
                </Link>
              </li>
              <li>
                <Link
                  href="/toevoegen"
                  prefetch={false}
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Plekje toevoegen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-espresso">Info</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/voorwaarden"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Voorwaarden
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-espresso/10 pt-6 text-center text-xs text-espresso-light">
          &copy; {new Date().getFullYear()} LekkerPlekje.nl — Gemaakt in
          Amsterdam
        </div>
      </div>
    </footer>
  );
}
