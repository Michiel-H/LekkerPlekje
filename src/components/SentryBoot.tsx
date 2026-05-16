"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Browser bootstrap for Sentry. Mounted once from the root layout so the
// SDK is guaranteed to ship in the client bundle and Sentry.init runs on
// first render.
//
// Why not `instrumentation-client.ts`? On Next 16 + Turbopack the
// `private-next-instrumentation-client` resolution alias was hitting the
// empty-module no-op shim on Vercel — so the file existed in source but
// produced zero output. Bootstrapping from a real client component that
// the layout already imports sidesteps that bug entirely.
//
// The hardcoded fallback exists because (a) Sentry DSNs are PUBLIC by
// design — they're already shipped to every browser — and (b) Next 16
// Turbopack's `process.env.NEXT_PUBLIC_*` inlining wasn't reliable in
// our Vercel builds. Keeping the literal here means the project keeps
// reporting errors even if the env var is dropped or mis-typed.
const dsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://3effd261007c193863004e6e19bb0e6f@o4511376878862336.ingest.de.sentry.io/4511376884301904";

let booted = false;

function ensureInit() {
  if (booted) return;
  booted = true;
  if (!dsn) return;
  try {
    Sentry.init({
      dsn,
      enabled: true,
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      debug: false,
      sendDefaultPii: false,
    });
  } catch {
    /* swallow — error reporting must never break the page */
  }
}

export default function SentryBoot() {
  useEffect(() => {
    ensureInit();
  }, []);
  return null;
}
