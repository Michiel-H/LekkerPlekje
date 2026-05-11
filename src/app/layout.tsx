import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LekkerPlekje.nl — Vind het lekkerste plekje voor elk moment",
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
  openGraph: {
    title: "LekkerPlekje.nl — Vind het lekkerste plekje voor elk moment",
    description:
      "Geen sterren, geen lange recensies. Gewoon goeie tips voor het juiste plekje.",
    images: [{ url: "/og-image.png", width: 1998, height: 787, alt: "LekkerPlekje" }],
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    title: "LekkerPlekje.nl",
    description: "Geen sterren. Gewoon goeie tips.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
