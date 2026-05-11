import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Algemene voorwaarden · LekkerPlekje.nl",
};

export default function VoorwaardenPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl text-espresso-light leading-relaxed">
          <h1 className="font-display text-3xl font-bold text-espresso">
            Algemene voorwaarden
          </h1>
          <p className="mt-2 text-sm text-espresso-light/70">
            Laatst bijgewerkt: 11 mei 2026
          </p>

          <p className="mt-6">
            Welkom bij LekkerPlekje.nl. Door onze site te gebruiken ga je akkoord met
            deze voorwaarden. We hebben ze zo kort en helder mogelijk gehouden — geen
            kleine lettertjes om je te verrassen.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            1. Wie zijn wij?
          </h2>
          <p className="mt-3">
            LekkerPlekje.nl is een dienst van [Bedrijfsnaam + rechtsvorm — in
            aanvraag], gevestigd te [adres — in aanvraag], KvK [in aanvraag]. We bieden
            een platform waarop gebruikers tips uitwisselen over fijne plekjes om te
            eten, drinken en zijn. We zijn zelf geen horeca-aanbieder en hebben geen
            commerciële relatie met de plekjes die je bij ons vindt.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            2. Het gebruik van LekkerPlekje
          </h2>
          <p className="mt-3">
            Iedereen mag de site gebruiken om plekjes te zoeken en te bekijken. Voor
            het inzenden van plekjes en het stemmen op tags heb je een account nodig.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            3. Je account
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>
              Je moet <strong className="text-espresso">minstens 16 jaar</strong> oud
              zijn om een account aan te maken.
            </li>
            <li>
              Je geeft een werkend e-mailadres en kiest een gebruikersnaam die niet
              beledigend, misleidend of inbreukmakend is.
            </li>
            <li>
              Je houdt je inloggegevens geheim. Activiteit vanaf jouw account valt
              onder jouw verantwoordelijkheid.
            </li>
            <li>
              Je kunt je account op elk moment verwijderen via je instellingen of
              door ons te mailen.
            </li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            4. Inzendingen: jouw plekjes en motivaties
          </h2>
          <h3 className="font-semibold text-espresso mt-6">Wat je inzendt blijft van jou</h3>
          <p className="mt-2">
            Tekst, foto&apos;s en motivaties die jij inzendt blijven jouw eigendom. Maar
            door ze in te zenden geef je LekkerPlekje een wereldwijde, royaltyvrije,
            niet-exclusieve licentie om ze te tonen, op te slaan, te kopiëren en aan
            te passen voor de werking van het platform (denk: thumbnails maken,
            kleurcorrectie, vertalen voor zoekresultaten).
          </p>

          <h3 className="font-semibold text-espresso mt-6">Wat moet kloppen</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Je dient alleen plekjes in die echt bestaan en die je zelf hebt bezocht.</li>
            <li>De motivatie en tags moeten eerlijk en accuraat zijn.</li>
            <li>Foto&apos;s moet je zelf gemaakt hebben of toestemming hebben om ze te delen.</li>
            <li>
              Je promoot geen plek omdat je er een commercieel belang bij hebt
              (eigenaar/familie) zonder dit te melden.
            </li>
          </ul>

          <h3 className="font-semibold text-espresso mt-6">Wat je niet mag inzenden</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Plekken die alleen op afspraak of voor leden toegankelijk zijn.</li>
            <li>Plekken die wezenlijk illegaal opereren.</li>
            <li>Inhoud die haatdragend, discriminerend, intimiderend of expliciet is.</li>
            <li>Inhoud die inbreuk maakt op rechten van anderen (auteursrecht, portretrecht).</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            5. Stemmen op tags
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Stem eerlijk: 👍 als de tag klopt, 👎 als die niet (meer) klopt.</li>
            <li>Stem één keer per tag.</li>
            <li>Gebruik geen meerdere accounts om de uitkomst te beïnvloeden.</li>
          </ul>
          <p className="mt-3">
            We detecteren systematische manipulatie en kunnen zulke stemmen ongeldig
            verklaren of accounts schorsen.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            6. Het Toppertje-systeem
          </h2>
          <p className="mt-3">
            Heb je 5 plekjes ingestuurd die zijn goedgekeurd? Dan word je automatisch
            Toppertje. Vanaf dan worden je inzendingen direct geplaatst zonder
            admin-keuring. Daar hoort vertrouwen bij — dat kunnen we ook weer
            intrekken als blijkt dat je de regels schendt. De titels Lekker ventje /
            Lekker grietje / Toppertje zijn cosmetische badges en geen rechten of
            garanties.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            7. Onze rol bij content
          </h2>
          <p className="mt-3">
            LekkerPlekje is een platform voor user-generated content, geen
            redactionele uitgever. We controleren inzendingen van nieuwe gebruikers
            vóór publicatie, maar kunnen niet alles continu verifiëren. Daarom:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Vertrouw niet blindelings op de informatie. Plekken kunnen sluiten of veranderen.</li>
            <li>
              We zijn <strong className="text-espresso">niet aansprakelijk</strong> als
              een aanbeveling tegenvalt.
            </li>
            <li>Klopt iets niet? Zie sectie 9 (Meldingen).</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            8. Wat we mogen verwijderen
          </h2>
          <p className="mt-3">We kunnen op elk moment, met of zonder waarschuwing:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Inzendingen weigeren of verwijderen die niet aan deze voorwaarden voldoen</li>
            <li>Tags automatisch verbergen op basis van negatieve stemmen</li>
            <li>Accounts schorsen of verwijderen bij misbruik</li>
            <li>De site of onderdelen daarvan tijdelijk of permanent uitschakelen</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            9. Meldingen en klachten over content
          </h2>
          <p className="mt-3">
            Heb je een melding over een plekje, gebruiker of stem? Mail{" "}
            <a href="mailto:contact@lekkerplekje.nl" className="text-spritz hover:underline">
              contact@lekkerplekje.nl
            </a>{" "}
            of gebruik de meld-knop op de detailpagina. We reageren binnen 48 uur.
            Meer info op de{" "}
            <a href="/meldingen" className="text-spritz hover:underline">
              meldingen-pagina
            </a>
            .
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            10. Aansprakelijkheid
          </h2>
          <p className="mt-3">
            LekkerPlekje wordt geleverd &quot;zoals het is&quot;. We doen ons best om
            de site werkend, accuraat en plezierig te houden, maar geven geen
            garanties op:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Voortdurende beschikbaarheid</li>
            <li>Juistheid of volledigheid van content (door gebruikers aangedragen)</li>
            <li>Geschiktheid voor een specifiek doel</li>
          </ul>
          <p className="mt-3">
            Voor zover wettelijk toegestaan is onze aansprakelijkheid beperkt tot
            directe schade en tot een maximum van{" "}
            <strong className="text-espresso">€100 per gebeurtenis</strong>, met een
            totaal van <strong className="text-espresso">€500 per kalenderjaar</strong>.
            Aansprakelijkheid voor opzet of bewuste roekeloosheid is uiteraard niet
            uitgesloten.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            11. Wijzigingen
          </h2>
          <p className="mt-3">
            We kunnen deze voorwaarden aanpassen. Bij wezenlijke wijzigingen lichten
            we je in via e-mail of een melding bij het inloggen, minstens 14 dagen
            voor de wijziging ingaat. Gebruik je de site na die periode, dan ga je
            akkoord met de nieuwe versie.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            12. Toepasselijk recht en geschillen
          </h2>
          <p className="mt-3">
            Op deze voorwaarden is <strong className="text-espresso">Nederlands
            recht</strong> van toepassing. Geschillen leggen we bij voorkeur eerst per
            e-mail aan elkaar voor. Komen we er samen niet uit? Dan is de Rechtbank
            van het arrondissement waar wij gevestigd zijn bevoegd, tenzij de wet
            dwingend een andere rechter aanwijst.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-10">
            13. Contact
          </h2>
          <p className="mt-3">
            Vragen, klachten, of gewoon een lekkere tip?{" "}
            <a href="mailto:contact@lekkerplekje.nl" className="text-spritz hover:underline">
              contact@lekkerplekje.nl
            </a>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
