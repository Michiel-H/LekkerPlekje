"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Link from "next/link";

export default function RegistrerenPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pronoun, setPronoun] = useState<"vent" | "griet" | "neutraal">(
    "neutraal"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Supabase auth signUp + insert into users table
  }

  return (
    <>
      <Header />
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
            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Naam
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Hoe wil je heten?"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
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
                Hoe wil je genoemd worden als Scout?
              </label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "vent", label: "Lekker ventje" },
                    { value: "griet", label: "Lekker grietje" },
                    { value: "neutraal", label: "Toppertje" },
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

            <Button type="submit" size="lg" className="w-full">
              Account aanmaken
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
      <Footer />
    </>
  );
}
