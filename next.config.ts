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

// Sentry build-time wrapper — kept minimal so it doesn't fight Turbopack.
// `tunnelRoute`, `disableLogger`, `widenClientFileUpload` are webpack-only
// (Sentry warns about them under Turbopack); removing them avoids any
// side-effect that might prevent instrumentation-client.ts from being bundled.
export default withSentryConfig(nextConfig, {
  org: "lekkerplekje",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
