// Sentry initialisation for the BROWSER bundle.
//
// We deliberately disable session replay and tracing — they're useful but
// they burn through Sentry's free-tier quota and a soft-launch project
// doesn't need them. If `NEXT_PUBLIC_SENTRY_DSN` is absent (e.g. preview
// branches without the env var set), the SDK no-ops cleanly.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    enabled: true,
    // Pure error reporting — no performance, no replay.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Don't print Sentry's own status banner to the user's devtools.
    debug: false,
    // Capture unhandled promise rejections + window errors automatically.
    sendDefaultPii: false,
  });
}

// Required by Next 16 App Router to attribute router-transition errors.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
