"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { createClient } from "@/lib/supabase/client";

interface ComingSoonModalProps {
  city: string;
  citySlug?: string;
  open: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({
  city,
  citySlug,
  open,
  onClose,
}: ComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const slug = (citySlug ?? city).toLowerCase().replace(/ /g, "-");
      const { data: cityRow, error: cityErr } = await supabase
        .from("cities")
        .select("id")
        .eq("slug", slug)
        .single();
      if (cityErr || !cityRow) {
        setError("Stad niet gevonden. Probeer het later opnieuw.");
        setSubmitting(false);
        return;
      }
      const { error: insertErr } = await supabase
        .from("waitlist_signups")
        .insert({
          email: email.trim(),
          city_id: (cityRow as { id: string }).id,
        } as never);
      if (insertErr) {
        // Treat duplicate sign-ups as success — the user is already on the list.
        if (insertErr.code !== "23505") {
          setError("Aanmelden mislukt. Probeer het later opnieuw.");
          setSubmitting(false);
          return;
        }
      }
      setSubmitted(true);
    } catch {
      setError("Aanmelden mislukt. Probeer het later opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      {submitted ? (
        <div className="text-center py-4">
          <h2 className="font-display text-xl font-semibold text-espresso">
            Genoteerd!
          </h2>
          <p className="mt-2 text-sm text-espresso-light">
            We laten je weten zodra {city} live gaat.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-display text-xl font-semibold text-espresso">
            {city} komt eraan!
          </h2>
          <p className="mt-2 text-sm text-espresso-light">
            We zijn druk bezig met de lekkerste plekjes van {city}. Laat je
            e-mail achter en we geven je een seintje.
          </p>
          {error && (
            <p className="mt-3 text-sm text-koraal">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="je@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-espresso/15 bg-white px-4 py-2.5 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Bezig..." : "Houd me op de hoogte"}
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}
