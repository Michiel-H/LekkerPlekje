"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/client";

type SessionState = "checking" | "ready" | "invalid";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    // After /auth/callback exchanged the recovery code, a session cookie exists.
    // setState happens inside the async callback (not synchronously in the effect).
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setSession(data.user ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) setSession("invalid");
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (password !== confirm) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message || "Wachtwoord wijzigen mislukt. Probeer het opnieuw.");
      return;
    }

    setDone(true);
    // Already signed in via the recovery session — send them to their profile.
    setTimeout(() => {
      router.push("/profiel");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="flex-1 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-espresso">
            Nieuw wachtwoord
          </h1>
          <p className="mt-1 text-sm text-espresso-light">
            Kies een nieuw wachtwoord voor je account.
          </p>
        </div>

        {session === "checking" && (
          <p className="text-center text-sm text-espresso-light">Even laden...</p>
        )}

        {session === "invalid" && (
          <div className="rounded-xl bg-koraal/10 border border-koraal/30 px-4 py-4 text-sm">
            <p className="font-medium text-espresso">Deze link werkt niet meer</p>
            <p className="mt-1 text-espresso-light">
              De reset-link is verlopen of al gebruikt. Vraag een nieuwe aan.
            </p>
            <Link
              href="/wachtwoord-vergeten"
              className="mt-3 inline-block font-medium text-spritz hover:text-spritz-hover"
            >
              Nieuwe link aanvragen
            </Link>
          </div>
        )}

        {session === "ready" && done && (
          <div className="rounded-xl bg-frisgroen/10 border border-frisgroen/30 px-4 py-4 text-sm">
            <p className="font-medium text-espresso">Gelukt!</p>
            <p className="mt-1 text-espresso-light">
              Je wachtwoord is gewijzigd. We sturen je door naar je profiel...
            </p>
          </div>
        )}

        {session === "ready" && !done && (
          <>
            {error && (
              <div className="mb-4 rounded-xl bg-koraal/10 border border-koraal/30 px-4 py-3 text-sm text-koraal">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso mb-1.5">
                  Nieuw wachtwoord
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 8 tekens"
                  className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso mb-1.5">
                  Herhaal wachtwoord
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Nogmaals je nieuwe wachtwoord"
                  className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Opslaan..." : "Wachtwoord opslaan"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
