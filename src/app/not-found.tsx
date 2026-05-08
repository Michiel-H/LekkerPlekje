import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-espresso">
          Oeps, verkeerd plekje!
        </h1>
        <p className="mt-3 text-espresso-light max-w-md mx-auto">
          Deze pagina bestaat niet. Misschien is het plekje verhuisd, of heb je
          een typfoutje gemaakt.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-spritz px-8 py-3 text-base font-semibold text-white hover:bg-spritz-hover transition-colors"
        >
          Terug naar home
        </Link>
      </main>
      <Footer />
    </>
  );
}
