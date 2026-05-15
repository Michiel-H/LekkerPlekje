import * as Sentry from "@sentry/nextjs";

/**
 * Standard error-reporting helper used across the codebase. Logs to the
 * console (so local dev still sees the stack) AND forwards to Sentry.
 *
 * If `NEXT_PUBLIC_SENTRY_DSN` isn't set, Sentry no-ops — making this safe
 * to call from anywhere, including preview branches without monitoring.
 *
 * Use the optional `context` arg for ad-hoc breadcrumb-style metadata:
 *   reportError(err, { where: "VoteButtons", locationTagId })
 */
export function reportError(
  err: unknown,
  context?: Record<string, unknown>
) {
  // Always log locally — Sentry's own console output is intentionally quiet.
  console.error(err);
  Sentry.captureException(err, context ? { extra: context } : undefined);
}
