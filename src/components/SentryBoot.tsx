"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Belt-and-braces bootstrap for Sentry's browser SDK.
//
// On Next 16 + Turbopack we observed that `src/instrumentation-client.ts`
// was sometimes not bundled on Vercel (the `private-next-instrumentation-client`
// alias fell through to the empty-module no-op). Mounting this client
// component from the root layout guarantees the SDK ships in the bundle
// and `Sentry.init` runs once on first render.

const dsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
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
