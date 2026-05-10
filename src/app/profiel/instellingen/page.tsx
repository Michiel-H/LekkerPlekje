import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export default async function InstellingenPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 px-4 py-16 text-center">
          <p className="text-espresso-light">Je moet ingelogd zijn.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/profiel"
            className="text-sm text-espresso-light hover:text-spritz transition-colors"
          >
            &larr; Terug naar profiel
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-espresso">
            Instellingen
          </h1>
          <p className="mt-1 text-sm text-espresso-light">
            Pas je profielgegevens aan of verwijder je account.
          </p>

          <div className="mt-8">
            <SettingsForm
              userId={user.id}
              displayName={user.display_name}
              pronoun={user.pronoun}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
