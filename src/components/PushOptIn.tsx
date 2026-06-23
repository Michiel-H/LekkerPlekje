"use client";
import { useEffect, useState } from "react";
import { enablePush, disablePush } from "@/lib/push/subscribe";
import { useHydrated, useIsStandalone } from "@/lib/pwa/hooks";

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function hasPushSupport() {
  return (
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
  );
}

type State = "idle" | "loading" | "on" | "error";

export default function PushOptIn() {
  const hydrated = useHydrated();
  const standalone = useIsStandalone();
  const [state, setState] = useState<State>("idle");

  // iOS only supports push from an installed (standalone) PWA.
  const supported = hydrated && hasPushSupport() && (!isIos() || standalone);

  useEffect(() => {
    if (!supported) return;
    if (Notification.permission !== "granted") return;
    // Reflect an already-granted device subscription (setState in async callback).
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "idle"))
      .catch(() => {});
  }, [supported]);

  if (!hydrated) return null;

  if (!supported) {
    // On iOS-in-Safari, nudge the user to install first.
    if (isIos() && !standalone) {
      return (
        <p className="text-sm text-espresso-light">
          Zet LekkerPlekje eerst op je beginscherm om meldingen te kunnen ontvangen.
        </p>
      );
    }
    return null;
  }

  async function turnOn() {
    setState("loading");
    setState((await enablePush()) ? "on" : "error");
  }
  async function turnOff() {
    setState("loading");
    await disablePush().catch(() => {});
    setState("idle");
  }

  if (state === "on") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-frisgroen">Meldingen staan aan ✓</span>
        <button
          onClick={turnOff}
          className="rounded-full bg-espresso/5 px-4 py-2 text-sm font-medium text-espresso-light transition hover:bg-espresso/10"
        >
          Zet uit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        disabled={state === "loading"}
        onClick={turnOn}
        className="rounded-full bg-groen px-5 py-2.5 font-semibold text-creme transition hover:bg-groen-hover disabled:opacity-60"
      >
        {state === "loading" ? "Bezig..." : "Zet meldingen aan"}
      </button>
      {state === "error" && (
        <span className="text-sm text-koraal">Meldingen konden niet aangezet worden.</span>
      )}
    </div>
  );
}
