import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacyverklaring · LekkerPlekje.com",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl text-espresso-light leading-relaxed">
          <h1 className="font-display text-3xl font-bold text-espresso">
            Privacyverklaring
          </h1>
          <p className="mt-2 text-sm text-espresso-light/70">
            Laatst bijgewerkt: 11 mei 2026
          </p>

          <p className="mt-6">
            Bij LekkerPlekje.com willen we het je makkelijk maken om het lekkerste plekje
            voor jouw moment te vinden. Daarvoor verwerken we sommige gegevens van je.
            We willen heel duidelijk uitleggen welke, waarom, en hoe lang. Ben je iets
            niet duidelijk? Mail ons op{" "}
            <a href="mailto:contact@lekkerplekje.com" className="text-spritz hover:underline">
              contact@lekkerplekje.com
            </a>
            .
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Wie is verantwoordelijk?
          </h2>
          <p className="mt-3">LekkerPlekje.com wordt geëxploiteerd door:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>[Bedrijfsnaam + rechtsvorm — in aanvraag]</li>
            <li>KvK-nummer: [in aanvraag]</li>
            <li>BTW-nummer: [in aanvraag]</li>
            <li>Adres: [in aanvraag]</li>
            <li>E-mail: contact@lekkerplekje.com</li>
          </ul>
          <p className="mt-3">
            Wij zijn de &quot;verwerkingsverantwoordelijke&quot; in de zin van de AVG.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Welke gegevens verwerken we?
          </h2>

          <h3 className="font-semibold text-espresso mt-6">Als je een account aanmaakt</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>E-mailadres (voor inloggen en communicatie)</li>
            <li>Wachtwoord (versleuteld opgeslagen — wij kunnen het niet inzien)</li>
            <li>Gebruikersnaam (publiek zichtbaar bij plekjes die je inzendt)</li>
            <li>Geslacht (bepaalt je toppertje-titel: Lekker ventje / Lekker grietje / Toppertje)</li>
            <li>Aanmaakdatum van je account</li>
          </ul>

          <h3 className="font-semibold text-espresso mt-6">Als je een plekje inzendt</h3>
          <p className="mt-2">
            De inhoud van je inzending (locatie, tags, motivatie, foto&apos;s) wordt — na
            goedkeuring — publiek zichtbaar, gekoppeld aan jouw gebruikersnaam. Ook het
            tijdstip van indienen wordt opgeslagen.
          </p>

          <h3 className="font-semibold text-espresso mt-6">Als je stemt op tags</h3>
          <p className="mt-2">
            Welke tag je hebt geüpvote of gedownvote, gekoppeld aan je account (niet
            publiek zichtbaar). Hiermee voorkomen we dat je dubbel stemt.
          </p>

          <h3 className="font-semibold text-espresso mt-6">Automatisch verzameld</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>IP-adres (server-logs voor beveiliging, max. 30 dagen bewaard)</li>
            <li>
              Anonieme bezoekstatistieken via Plausible — zonder cookies, niet
              herleidbaar naar jou persoonlijk.
            </li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Waarom?
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Account-data — uitvoering van de overeenkomst</li>
            <li>Inzendingen — tonen op de site (uitvoering overeenkomst)</li>
            <li>Stemmen — kwaliteitsborging tags (uitvoering overeenkomst)</li>
            <li>Smaak-score — gerechtvaardigd belang (vanaf 30 stemmen, post-launch)</li>
            <li>IP-adressen — beveiliging tegen misbruik (gerechtvaardigd belang)</li>
            <li>Statistieken — snappen hoe de site gebruikt wordt</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Hoe lang bewaren we?
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>
              <strong className="text-espresso">Account-gegevens:</strong> zo lang je
              een account hebt. Bij verwijdering binnen 30 dagen weg.
            </li>
            <li>
              <strong className="text-espresso">Goedgekeurde inzendingen:</strong>{" "}
              blijven op de site, maar geanonimiseerd na accountverwijdering. Wil je
              ze óók weg? Mail ons.
            </li>
            <li>
              <strong className="text-espresso">Stemmen:</strong> geanonimiseerd na
              verwijdering, maar tellen wel mee in plekje-scores.
            </li>
            <li>
              <strong className="text-espresso">Server-logs:</strong> 30 dagen.
            </li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Met wie delen we je gegevens?
          </h2>
          <p className="mt-3">
            We verkopen je gegevens <strong className="text-espresso">nooit</strong>.
            We delen alleen met partijen die ons helpen LekkerPlekje te draaien:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Supabase (database + authenticatie) — server in EU</li>
            <li>Vercel (hosting) — server in EU</li>
            <li>Cloudflare (DNS + bot-protectie)</li>
            <li>Plausible (anonieme statistieken, geen cookies)</li>
          </ul>
          <p className="mt-3">
            Met deze partijen hebben we verwerkersovereenkomsten conform de AVG.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Cookies
          </h2>
          <p className="mt-3">
            LekkerPlekje gebruikt <strong className="text-espresso">alleen
            functionele cookies</strong> die nodig zijn om de site te laten werken
            (bijvoorbeeld om je ingelogd te houden). Geen tracking-cookies, geen
            advertentie-cookies. Daarom zie je geen vervelende cookie-banner.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Jouw rechten
          </h2>
          <p className="mt-3">Onder de AVG heb je het recht om:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Je gegevens in te zien</li>
            <li>Onjuiste gegevens te laten corrigeren</li>
            <li>Je gegevens te laten verwijderen (recht op vergetelheid)</li>
            <li>Verwerking te laten beperken</li>
            <li>Je gegevens mee te nemen (dataportabiliteit)</li>
            <li>Bezwaar te maken tegen verwerking</li>
            <li>Toestemming in te trekken (waar van toepassing)</li>
          </ul>
          <p className="mt-3">
            Mail{" "}
            <a href="mailto:contact@lekkerplekje.com" className="text-spritz hover:underline">
              contact@lekkerplekje.com
            </a>{" "}
            om een van deze rechten uit te oefenen. We reageren binnen 30 dagen.
          </p>
          <p className="mt-3">
            Ben je niet tevreden? Je kunt een klacht indienen bij de Autoriteit
            Persoonsgegevens via{" "}
            <a
              href="https://autoriteitpersoonsgegevens.nl"
              target="_blank"
              rel="noopener"
              className="text-spritz hover:underline"
            >
              autoriteitpersoonsgegevens.nl
            </a>
            .
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Beveiliging
          </h2>
          <p className="mt-3">
            HTTPS overal, wachtwoorden gehasht opgeslagen, databases versleuteld,
            regelmatige updates. Geen enkel systeem is 100% veilig — meld je een lek?
            Mail het naar{" "}
            <a href="mailto:contact@lekkerplekje.com" className="text-spritz hover:underline">
              contact@lekkerplekje.com
            </a>
            .
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            Wijzigingen
          </h2>
          <p className="mt-3">
            We kunnen deze verklaring aanpassen. Bij belangrijke wijzigingen lichten we
            je in via e-mail of een melding bij het inloggen. De huidige versie staat
            altijd op deze pagina, met de datum bovenaan.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
