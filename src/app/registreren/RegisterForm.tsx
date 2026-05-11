"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import Link from "next/link";

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
  const [pronoun, setPronoun] = useState<"vent" | "griet" | "neutraal">(
    "neutraal"
  );
  const [preferredCityId, setPreferredCityId] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  function validateUsername(name: string): string | null {
    const trimmed = name.trim();
    if (trimmed.length < 3) return "Gebruikersnaam moet minimaal 3 tekens zijn.";
    if (trimmed.length > 24) return "Gebruikersnaam mag maximaal 24 tekens zijn.";
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed))
      return "Alleen letters, cijfers, _ en - zijn toegestaan.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const usernameError = validateUsername(displayName);
      if (usernameError) {
        setError(usernameError);
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

      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
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

      // Save preferred city after signup if chosen
      if (preferredCityId && signUpData.user) {
        await supabase
          .from("users")
          .update({ preferred_city_id: preferredCityId } as never)
          .eq("id", signUpData.user.id);
      }

      router.push("/profiel");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Er is iets misgegaan tijdens het registreren.");
    } finally {
      setLoading(false);
    }
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
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
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
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Kies een unieke naam"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
              <p className="mt-1 text-xs text-espresso-light">
                3–24 tekens. Letters, cijfers, _ en -. Hiermee word je herkend op de site.
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
