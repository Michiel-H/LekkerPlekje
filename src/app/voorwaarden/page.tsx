import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VoorwaardenPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl prose prose-sm">
          <h1 className="font-display text-3xl font-bold text-espresso">
            Algemene Voorwaarden
          </h1>
          <p className="text-espresso-light mt-4">
            Laatst bijgewerkt: mei 2026
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Gebruik van het platform
          </h2>
          <p className="text-espresso-light">
            LekkerPlekje.nl is een platform waar gebruikers horecatips kunnen
            delen en beoordelen. Door gebruik te maken van onze dienst ga je
            akkoord met deze voorwaarden.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            User-generated content
          </h2>
          <p className="text-espresso-light">
            Je bent zelf verantwoordelijk voor de content die je plaatst. Wij
            behouden het recht om inzendingen te modereren, bewerken of
            verwijderen die in strijd zijn met onze richtlijnen.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Intellectueel eigendom
          </h2>
          <p className="text-espresso-light">
            Door content te plaatsen geef je LekkerPlekje.nl een
            niet-exclusieve licentie om deze te tonen op het platform. Je
            behoudt het auteursrecht op je eigen content.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Aansprakelijkheid
          </h2>
          <p className="text-espresso-light">
            LekkerPlekje.nl is niet aansprakelijk voor de juistheid van
            gebruikersinzendingen. Tips zijn persoonlijke meningen en geen
            professionele aanbevelingen.
          </p>

          <h2 className="font-display text-xl font-semibold text-espresso mt-8">
            Contact
          </h2>
          <p className="text-espresso-light">
            Vragen? Mail naar info@lekkerplekje.nl.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
