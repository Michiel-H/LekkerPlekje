import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// The Supabase Storage hostname is derived from the project URL so we don't
// have to maintain a hard-coded list. Falls back to a wildcard match in case
// the env var isn't available at build time.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost: string | undefined;
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  supabaseHost = undefined;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [
          {
            protocol: "https",
            hostname: "*.supabase.co",
            pathname: "/storage/v1/object/public/**",
          },
        ],
  },
};

// Sentry build-time integration. Source-map upload is gated on SENTRY_AUTH_TOKEN
// — without it, errors still report but show minified frames. Add the token in
// Vercel env (Sentry → Settings → Auth Tokens) to enable readable stack traces.
export default withSentryConfig(nextConfig, {
  org: "lekkerplekje",
  project: "javascript-nextjs",
  // Suppress Sentry's own build-time logging — keeps `next build` output clean.
  silent: !process.env.CI,
  // Upload source maps only when an auth token is present.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Hide source-map files from the public bundle even when uploading.
  widenClientFileUpload: true,
  // Route browser requests through /monitoring so ad-blockers don't drop them.
  tunnelRoute: "/monitoring",
  disableLogger: true,
});
