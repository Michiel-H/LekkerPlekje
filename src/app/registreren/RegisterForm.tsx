"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import Link from "next/link";
import { DISPLAY_NAME_MAX, validateDisplayName } from "@/lib/displayName";

interface City {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [pronoun, setPronoun] = useState<"vent" | "griet" | "neutraal">(
    "neutraal"
  );
  const [preferredCityId, setPreferredCityId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cities")
        .select("id, name, slug, status")
        .eq("status", "live")
        .order("name");
      if (data) setCities(data as City[]);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const usernameError = validateDisplayName(displayName);
      if (usernameError) {
        setError(usernameError);
        setLoading(false);
        return;
      }

      if (password !== passwordConfirm) {
        setError("Wachtwoorden komen niet overeen.");
        setLoading(false);
        return;
      }

      // Check if username already exists (case-insensitive)
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .ilike("display_name", displayName.trim())
        .limit(1);
      if (existing && existing.length > 0) {
        setError("Deze gebruikersnaam is al in gebruik. Kies een andere.");
        setLoading(false);
        return;
      }

      // Build the redirect URL from the current origin so the confirm
      // email link always points back at the deployment the user signed up on.
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            display_name: displayName.trim(),
            pronoun,
          },
        },
      });

      if (authError) {
        // DB-level uniqueness collision (race condition) — friendlier message
        if (authError.message?.toLowerCase().includes("unique") || authError.code === "23505") {
          setError("Deze gebruikersnaam is al in gebruik. Kies een andere.");
        } else {
          throw authError;
        }
        setLoading(false);
        return;
      }

      // Save preferred city after signup if chosen. The auth.users row exists
      // already (the trigger created public.users via SECURITY DEFINER).
      if (preferredCityId && signUpData.user) {
        await supabase
          .from("users")
          .update({ preferred_city_id: preferredCityId } as never)
          .eq("id", signUpData.user.id);
      }

      // Show the "check your email" confirmation screen — the user can't
      // log in until they've confirmed.
      setSubmittedEmail(email);
    } catch (err: any) {
      setError(err.message || "Er is iets misgegaan tijdens het registreren.");
    } finally {
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-spritz/10 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-spritz"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-espresso">
            Check je inbox
          </h1>
          <p className="mt-3 text-espresso-light">
            We hebben een bevestigingsmail gestuurd naar{" "}
            <strong className="text-espresso">{submittedEmail}</strong>.
          </p>
          <p className="mt-2 text-sm text-espresso-light">
            Klik op de link in de mail om je account te activeren. Daarna kun je
            inloggen en direct plekjes tippen.
          </p>

          <div className="mt-6 rounded-xl bg-spritz/5 border border-spritz/15 p-4 text-left">
            <p className="text-sm font-medium text-espresso">Niets ontvangen?</p>
            <ul className="mt-1 text-xs text-espresso-light list-disc pl-5 space-y-1">
              <li>Check je spam- of reclame-map.</li>
              <li>Controleer of het e-mailadres klopt.</li>
              <li>
                Probleem houdt aan? Mail{" "}
                <a
                  href="mailto:contact@lekkerplekje.com"
                  className="text-spritz hover:underline"
                >
                  contact@lekkerplekje.com
                </a>
              </li>
            </ul>
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-creme hover:bg-espresso-light transition-colors"
          >
            Naar inloggen
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-espresso">
              Word lid
            </h1>
            <p className="mt-1 text-sm text-espresso-light">
              Maak een account aan om plekjes te tippen en te stemmen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-koraal bg-koraal/10 border border-koraal/30 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Gebruikersnaam
              </label>
              <input
                type="text"
                required
                maxLength={DISPLAY_NAME_MAX}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Kies een unieke naam"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
              <p className="mt-1 text-xs text-espresso-light">
                3–24 tekens, alleen letters, cijfers, _ en -
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                E-mailadres
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="je@email.nl"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Wachtwoord
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimaal 8 tekens"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Wachtwoord bevestigen
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Herhaal je wachtwoord"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 ${
                  passwordConfirm && password !== passwordConfirm
                    ? "border-koraal focus:ring-koraal/50"
                    : "border-espresso/15 focus:ring-spritz/50"
                }`}
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="mt-1 text-xs text-koraal">
                  Wachtwoorden komen niet overeen.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso mb-2">
                Geslacht
              </label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "vent", label: "Man" },
                    { value: "griet", label: "Vrouw" },
                    { value: "neutraal", label: "Anders" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPronoun(option.value)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      pronoun === option.value
                        ? "border-spritz bg-spritz/10 text-spritz"
                        : "border-espresso/10 text-espresso-light hover:border-espresso/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Stad van voorkeur <span className="text-espresso-light/70 font-normal">(optioneel)</span>
              </label>
              <select
                value={preferredCityId}
                onChange={(e) => setPreferredCityId(e.target.value)}
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
              >
                <option value="">Geen voorkeur</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-espresso-light">
                Op de homepage zie je dan plekjes uit jouw stad eerst.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Bezig..." : "Account aanmaken"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-espresso-light">
            Al een account?{" "}
            <Link
              href="/login"
              className="font-medium text-spritz hover:text-spritz-hover"
            >
              Inloggen
            </Link>
          </p>
        </div>
    </main>
  );
}
