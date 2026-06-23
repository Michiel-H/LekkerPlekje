"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  // Like login, the identifier can be an email or a username.
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmed = identifier.trim();
      let email = trimmed;

      // Resolve a username to its email. If it doesn't resolve we still show the
      // same confirmation, so we never reveal whether an account exists.
      if (!trimmed.includes("@")) {
        const res = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmed }),
        });
        if (res.ok) {
          const data = await res.json();
          email = data.email;
        } else {
          setSentTo(trimmed);
          setSent(true);
          setLoading(false);
          return;
        }
      }

      const supabase = createClient();
      // resetPasswordForEmail does not error for unknown emails (anti-enumeration).
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/wachtwoord-resetten`,
      });

      setSentTo(email);
      setSent(true);
    } catch {
      setError("Er ging iets mis. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-espresso">
            Wachtwoord vergeten?
          </h1>
          <p className="mt-1 text-sm text-espresso-light">
            Geen probleem. We sturen je een link om een nieuw wachtwoord in te stellen.
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl bg-frisgroen/10 border border-frisgroen/30 px-4 py-4 text-sm">
            <p className="font-medium text-espresso">Check je mail 📬</p>
            <p className="mt-1 text-espresso-light">
              Als er een account bij <strong className="text-espresso">{sentTo}</strong>{" "}
              hoort, hebben we een mail gestuurd met een link om je wachtwoord opnieuw
              in te stellen. De link is een uur geldig.
            </p>
            <p className="mt-3 text-espresso-light">
              Geen mail ontvangen? Check je spam, of{" "}
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
                className="font-medium text-spritz hover:text-spritz-hover"
              >
                probeer het opnieuw
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl bg-koraal/10 border border-koraal/30 px-4 py-3 text-sm text-koraal">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso mb-1.5">
                  E-mailadres of gebruikersnaam
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="je@email.nl of je gebruikersnaam"
                  className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Versturen..." : "Stuur reset-link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-espresso-light">
          Weet je het weer?{" "}
          <Link href="/login" className="font-medium text-spritz hover:text-spritz-hover">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </main>
  );
}
