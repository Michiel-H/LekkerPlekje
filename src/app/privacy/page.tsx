import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl prose prose-sm">
          <h1 className="font-display text-3xl font-bold text-espresso">
            Privacyverklaring
          </h1>
          <p className="text-espresso-light mt-4">
            Laatst bijgewerkt: mei 2026
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Wie zijn wij?
          </h2>
          <p className="text-espresso-light">
            LekkerPlekje.nl is een platform voor het delen van
            horecatips. We verwerken zo min mogelijk persoonsgegevens.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Welke gegevens verwerken wij?
          </h2>
          <ul className="text-espresso-light space-y-1">
            <li>E-mailadres en weergavenaam bij registratie</li>
            <li>Ingestuurde plekjes en stemmen</li>
            <li>Geanonimiseerde bezoekersstatistieken (via privacy-vriendelijke analytics zonder cookies)</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Cookies
          </h2>
          <p className="text-espresso-light">
            We gebruiken alleen functionele cookies voor je inlogsessie. We
            plaatsen geen tracking-cookies en gebruiken geen advertentienetwerken.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Contact
          </h2>
          <p className="text-espresso-light">
            Vragen over je privacy? Mail naar privacy@lekkerplekje.nl.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
