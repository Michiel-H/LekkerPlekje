"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  // "identifier" can be either an email or a username — we resolve it to an
  // email server-side before calling signInWithPassword.
  const [identifier, setIdentifier] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsConfirm(false);
    setResendMsg(null);
    setLoading(true);

    try {
      const trimmed = identifier.trim();
      let emailToUse = trimmed;

      // If the identifier doesn't look like an email, treat it as a username
      // and resolve to the underlying email via the admin route.
      if (!trimmed.includes("@")) {
        const res = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmed }),
        });
        if (!res.ok) {
          setError("E-mailadres of wachtwoord klopt niet.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        emailToUse = data.email;
      }
      setResolvedEmail(emailToUse);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        // Supabase returns this when the user signed up but hasn't clicked the
        // confirmation link yet. Surface a clear UI for it.
        const msg = error.message?.toLowerCase() ?? "";
        if (
          (error as any).code === "email_not_confirmed" ||
          msg.includes("email not confirmed") ||
          msg.includes("not confirmed")
        ) {
          setNeedsConfirm(true);
        } else if (
          msg.includes("invalid login") ||
          msg.includes("invalid credentials")
        ) {
          setError("E-mailadres of wachtwoord klopt niet.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      router.push("/profiel");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Er is iets misgegaan.");
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    const target = resolvedEmail || identifier;
    if (!target || !target.includes("@")) return;
    setResending(true);
    setResendMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: target,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    setResendMsg(
      error
        ? "Verzenden mislukt. Probeer het later opnieuw."
        : "Nieuwe bevestigingsmail verstuurd."
    );
  }

  return (
    <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-espresso">
              Welkom terug
            </h1>
            <p className="mt-1 text-sm text-espresso-light">
              Log in om plekjes toe te voegen en te stemmen.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-koraal/10 border border-koraal/30 px-4 py-3 text-sm text-koraal">
              {error}
            </div>
          )}

          {needsConfirm && (
            <div className="mb-4 rounded-xl bg-spritz/5 border border-spritz/20 px-4 py-3 text-sm">
              <p className="font-medium text-espresso">
                Je e-mail is nog niet bevestigd.
              </p>
              <p className="mt-1 text-espresso-light">
                We hebben een bevestigingsmail gestuurd naar{" "}
                <strong className="text-espresso">{resolvedEmail || identifier}</strong>. Klik op de
                link in die mail om je account te activeren.
              </p>
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                className="mt-2 text-xs font-medium text-spritz hover:text-spritz-hover disabled:opacity-50"
              >
                {resending ? "Versturen..." : "Stuur nieuwe bevestigingsmail"}
              </button>
              {resendMsg && (
                <p className="mt-1 text-xs text-espresso-light">{resendMsg}</p>
              )}
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

            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Wachtwoord
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Je wachtwoord"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Bezig..." : "Inloggen"}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-espresso/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-creme px-3 text-espresso-light">of</span>
            </div>
          </div>

          <button
            disabled
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-espresso/10 bg-espresso/5 px-4 py-3 text-sm font-medium text-espresso-light cursor-not-allowed opacity-60"
          >
            <svg className="h-5 w-5 grayscale opacity-50" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Inloggen met Google
            <span className="ml-1 text-xs text-espresso-light/70">coming soon</span>
          </button>

          <button
            disabled
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-espresso/10 bg-espresso/5 px-4 py-3 text-sm font-medium text-espresso-light cursor-not-allowed opacity-60"
          >
            <svg className="h-5 w-5 opacity-50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Inloggen met Apple
            <span className="ml-1 text-xs text-espresso-light/70">coming soon</span>
          </button>

          <p className="mt-6 text-center text-sm text-espresso-light">
            Nog geen account?{" "}
            <Link
              href="/registreren"
              className="font-medium text-spritz hover:text-spritz-hover"
            >
              Maak er een aan
            </Link>
          </p>
        </div>
    </main>
  );
}
