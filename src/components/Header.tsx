"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  isAdmin?: boolean;
}

export default function Header({ isAdmin = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-espresso/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-spritz">LP</span>
            <span className="font-display text-xl font-semibold text-espresso">
              LekkerPlekje
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/amsterdam"
              className="text-sm font-medium text-espresso-light hover:text-espresso transition-colors"
            >
              Amsterdam
            </Link>
            <Link
              href="/hoe-het-werkt"
              className="text-sm font-medium text-espresso-light hover:text-espresso transition-colors"
            >
              Hoe het werkt
            </Link>
            <Link
              href="/toevoegen"
              className="text-sm font-medium text-spritz hover:text-spritz-hover transition-colors"
            >
              + Plekje toevoegen
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-groen hover:text-groen/80 transition-colors"
              >
                Admin
              </Link>
            )}
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-espresso px-4 py-2 text-sm font-medium text-creme hover:bg-espresso-light transition-colors"
            >
              Inloggen
            </Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-espresso"
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link
              href="/amsterdam"
              className="text-sm font-medium text-espresso-light hover:text-espresso"
              onClick={() => setMenuOpen(false)}
            >
              Amsterdam
            </Link>
            <Link
              href="/hoe-het-werkt"
              className="text-sm font-medium text-espresso-light hover:text-espresso"
              onClick={() => setMenuOpen(false)}
            >
              Hoe het werkt
            </Link>
            <Link
              href="/toevoegen"
              className="text-sm font-medium text-spritz hover:text-spritz-hover"
              onClick={() => setMenuOpen(false)}
            >
              + Plekje toevoegen
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-groen hover:text-groen/80"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link
              href="/login"
              className="inline-flex w-fit items-center rounded-full bg-espresso px-4 py-2 text-sm font-medium text-creme"
              onClick={() => setMenuOpen(false)}
            >
              Inloggen
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
