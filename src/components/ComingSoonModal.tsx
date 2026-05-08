"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface ComingSoonModalProps {
  city: string;
  open: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({
  city,
  open,
  onClose,
}: ComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: write to waitlist_signups via Supabase
    setSubmitted(true);
  }

  return (
    <Modal open={open} onClose={onClose}>
      {submitted ? (
        <div className="text-center py-4">
          <p className="text-4xl mb-3">🍊</p>
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
            {city} komt eraan! 🍊
          </h2>
          <p className="mt-2 text-sm text-espresso-light">
            We zijn druk bezig met de lekkerste plekjes van {city}. Laat je
            e-mail achter en we geven je een seintje.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="je@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-espresso/15 bg-white px-4 py-2.5 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
            />
            <Button type="submit">Houd me op de hoogte</Button>
          </form>
        </>
      )}
    </Modal>
  );
}
