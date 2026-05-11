import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Meldingen & klachten · LekkerPlekje.nl",
};

export default function MeldingenPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl text-espresso-light leading-relaxed">
          <h1 className="font-display text-3xl font-bold text-espresso">
            Meldingen & klachten
          </h1>
          <p className="mt-2 text-sm text-espresso-light/70">
            Laatst bijgewerkt: 11 mei 2026
          </p>

          <p className="mt-6">
            Bij LekkerPlekje hangt onze hele kwaliteit aan eerlijke informatie. Klopt
            iets niet, dan willen we het weten. Hieronder leggen we uit hoe.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Snel iets melden
          </h2>
          <p className="mt-3">
            Gebruik de <strong className="text-espresso">🚩 Iets niet kloppend?</strong>{" "}
            knop onderaan elke locatie-pagina. We krijgen je melding direct binnen.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Mailen kan ook
          </h2>
          <p className="mt-3">
            Voor algemene meldingen, klachten over gebruikers, of als je geen account
            wilt aanmaken — mail{" "}
            <a href="mailto:contact@lekkerplekje.nl" className="text-spritz hover:underline">
              contact@lekkerplekje.nl
            </a>
            .
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Ben je horeca-eigenaar?
          </h2>
          <p className="mt-3">
            Staat jouw zaak op LekkerPlekje en wil je iets aanpassen of de vermelding
            laten verwijderen? Dat kan altijd. Mail{" "}
            <a href="mailto:contact@lekkerplekje.nl" className="text-spritz hover:underline">
              contact@lekkerplekje.nl
            </a>{" "}
            vanaf een e-mailadres dat aan de zaak gekoppeld is, met:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Naam van je zaak</li>
            <li>Wat je wilt laten aanpassen of verwijderen</li>
            <li>
              Korte onderbouwing (bijv. &quot;deze foto is niet meer actueel&quot; of
              &quot;we doen alleen nog op reservering&quot;)
            </li>
          </ul>
          <p className="mt-3">
            We reageren binnen <strong className="text-espresso">48 uur</strong> en
            handelen verzoeken meestal binnen een week af. Bij twijfel kunnen we een
            korte verificatie vragen (bijv. een mail vanaf het officiële e-mailadres
            van de zaak).
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Auteursrecht of portretrecht
          </h2>
          <p className="mt-3">
            Vermoed je dat een foto of tekst inbreuk maakt op jouw rechten? Mail{" "}
            <a href="mailto:contact@lekkerplekje.nl" className="text-spritz hover:underline">
              contact@lekkerplekje.nl
            </a>{" "}
            met:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Welke pagina/foto het betreft (link)</li>
            <li>Waarom je denkt dat het inbreuk maakt</li>
            <li>Bewijs van je rechten waar mogelijk</li>
            <li>Je contactgegevens</li>
          </ul>
          <p className="mt-3">
            We verwijderen disputed content tijdelijk en onderzoeken de zaak. Dit
            volgt de NTD-procedure (Notice and Takedown) onder de DSA.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Hoe snel reageren we?
          </h2>
          <div className="mt-4 rounded-xl border border-espresso/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-espresso/[0.02]">
                <tr className="text-left">
                  <th className="px-4 py-3 text-espresso font-semibold">Type melding</th>
                  <th className="px-4 py-3 text-espresso font-semibold">Eerste reactie</th>
                  <th className="px-4 py-3 text-espresso font-semibold">Afhandeling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/5">
                <tr>
                  <td className="px-4 py-3">Plek bestaat niet meer</td>
                  <td className="px-4 py-3">binnen 48u</td>
                  <td className="px-4 py-3">binnen 7 dagen</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Onjuiste informatie</td>
                  <td className="px-4 py-3">binnen 48u</td>
                  <td className="px-4 py-3">binnen 7 dagen</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Eigenaar wil aanpassing</td>
                  <td className="px-4 py-3">binnen 48u</td>
                  <td className="px-4 py-3">binnen 7 dagen</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Auteursrecht / portretrecht</td>
                  <td className="px-4 py-3">binnen 48u</td>
                  <td className="px-4 py-3">per geval</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-koraal font-medium">
                    Spoed (intimidatie, doxxing)
                  </td>
                  <td className="px-4 py-3">binnen 24u</td>
                  <td className="px-4 py-3">direct</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Misbruik van het meldsysteem
          </h2>
          <p className="mt-3">
            We monitoren of meldingen te kwader trouw worden gedaan (bijv. om een
            concurrent dwars te zitten). Bij systematisch misbruik kunnen we het
            account blokkeren.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
