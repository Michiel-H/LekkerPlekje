import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import MadLibsSearch from "@/components/MadLibsSearch";
import { DEMO_PLEKJES } from "@/lib/demo-data";

export default function AmsterdamPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
              Amsterdam
            </h1>
            <p className="mt-3 text-lg text-espresso-light">
              De lekkerste plekjes van Amsterdam, getipt door locals.
            </p>
          </div>
          <div className="mx-auto max-w-2xl mt-8">
            <MadLibsSearch />
          </div>
        </section>

        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-bold text-espresso mb-6">
              Alle plekjes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_PLEKJES.map((plekje) => (
                <PlekjeCard key={plekje.id} {...plekje} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
