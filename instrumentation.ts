// Sentry initialisation for the SERVER (Node) and EDGE runtimes.
//
// Next.js calls `register()` once per cold start in each runtime. We pick
// the matching Sentry init based on `process.env.NEXT_RUNTIME`. As with
// the client config, we keep this to error-only — no tracing, no profiling.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0,
      debug: false,
      sendDefaultPii: false,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0,
      debug: false,
      sendDefaultPii: false,
    });
  }
}

// Captures errors thrown inside React Server Components, route handlers,
// and server actions.
export const onRequestError = Sentry.captureRequestError;
