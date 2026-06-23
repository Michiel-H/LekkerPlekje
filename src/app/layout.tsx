import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import SentryBoot from "@/components/SentryBoot";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

// Nunito matches the rounded, friendly feel of the LekkerPlekje wordmark.
// One font for the whole site — headings use the heavier weights.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lekkerplekje.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LekkerPlekje.com — Vind het lekkerste plekje voor elk moment",
  description:
    "Geen sterren, geen lange recensies. Gewoon goeie tips voor het juiste plekje op het juiste moment.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LekkerPlekje",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "LekkerPlekje.com — Vind het lekkerste plekje voor elk moment",
    description:
      "Geen sterren, geen lange recensies. Gewoon goeie tips voor het juiste plekje.",
    images: [{ url: "/og-image.png", width: 1998, height: 787, alt: "LekkerPlekje" }],
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    title: "LekkerPlekje.com",
    description: "Geen sterren. Gewoon goeie tips.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // respect iPhone safe areas in standalone mode
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SentryBoot />
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
