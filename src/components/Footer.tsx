import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-creme">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Over */}
          <div>
            <Link href="/" className="flex items-center" aria-label="LekkerPlekje">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png?v=2" alt="LekkerPlekje" className="h-9 w-auto" />
            </Link>
            <p className="mt-3 text-sm text-espresso-light">
              Geen sterren. Geen lange recensies.
              <br />
              Gewoon goeie tips voor het juiste plekje.
            </p>
          </div>

          {/* Ontdek */}
          <div>
            <h3 className="text-sm font-semibold text-espresso">Ontdek</h3>
            <ul className="mt-3 space-y-2">
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

          {/* Klein lettertje */}
          <div>
            <h3 className="text-sm font-semibold text-espresso">Klein lettertje</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Privacyverklaring
                </Link>
              </li>
              <li>
                <Link
                  href="/voorwaarden"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link
                  href="/meldingen"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Meldingen & klachten
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@lekkerplekje.nl"
                  className="text-sm text-espresso-light hover:text-spritz transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bedrijfsgegevens */}
        <div className="mt-8 border-t border-espresso/10 pt-6 text-center text-xs text-espresso-light space-y-1">
          <p>
            &copy; {new Date().getFullYear()} LekkerPlekje.nl
            {" · "}
            KvK <span className="text-espresso-light/60">[in aanvraag]</span>
            {" · "}
            BTW <span className="text-espresso-light/60">[in aanvraag]</span>
          </p>
          <p>
            <a
              href="mailto:contact@lekkerplekje.nl"
              className="hover:text-spritz transition-colors"
            >
              contact@lekkerplekje.nl
            </a>
          </p>
          <p className="text-espresso-light/70">
            Gemaakt in Nederland ♥ door mensen die ook gewoon een leuk terras zoeken.
          </p>
        </div>
      </div>
    </footer>
  );
}
