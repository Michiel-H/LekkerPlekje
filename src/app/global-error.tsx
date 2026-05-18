"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Top-level error boundary for the App Router. Catches anything not handled
 * by a nested `error.tsx`. Reports the error to Sentry and shows a minimal
 * Dutch fallback page — we deliberately don't render the styled layout
 * here because we can't assume any of the providers above us still work.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="nl">
      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#FDFBF7",
          color: "#2C2119",
          margin: 0,
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Oeps, er ging iets mis.
        </h1>
        <p style={{ marginTop: "0.5rem", opacity: 0.75 }}>
          We hebben de fout ontvangen en kijken er naar. Probeer de pagina te
          herladen.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "none",
            background: "#2C2119",
            color: "#FDFBF7",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Herlaad de pagina
        </button>
      </body>
    </html>
  );
}
