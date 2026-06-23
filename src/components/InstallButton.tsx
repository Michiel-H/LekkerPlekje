"use client";
import { useEffect, useState } from "react";
import { useHydrated, useIsStandalone } from "@/lib/pwa/hooks";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallButton({ className = "" }: { className?: string }) {
  const hydrated = useHydrated();
  const installed = useIsStandalone();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showIosSheet, setShowIosSheet] = useState(false);

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    // Clear any captured prompt once the app is installed.
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Don't render until hydrated (avoids hydration mismatch) or if already installed.
  if (!hydrated || installed) return null;
  // On Android show only once we have a usable prompt; on iOS always show (we guide manually).
  if (!deferred && !isIos()) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    if (isIos()) setShowIosSheet(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-full bg-spritz px-5 py-2.5 font-semibold text-creme shadow-md transition hover:bg-spritz-hover ${className}`}
      >
        Zet op je beginscherm
      </button>

      {showIosSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/40 p-4"
          onClick={() => setShowIosSheet(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-creme p-6 text-espresso shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold">Toevoegen aan beginscherm</h2>
            <ol className="mt-3 space-y-2 text-sm text-espresso-light">
              <li>1. Tik op het <strong>deel-icoon</strong> onderin Safari.</li>
              <li>2. Kies <strong>&lsquo;Zet op beginscherm&rsquo;</strong>.</li>
              <li>3. Tik op <strong>&lsquo;Voeg toe&rsquo;</strong> — klaar!</li>
            </ol>
            <button
              onClick={() => setShowIosSheet(false)}
              className="mt-5 w-full rounded-full bg-spritz py-2.5 font-semibold text-creme"
            >
              Begrepen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
