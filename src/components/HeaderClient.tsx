"use client";

import Link from "next/link";
import { useState } from "react";
import CitiesMenu from "./CitiesMenu";

export interface HeaderUser {
  displayName: string;
  initial: string;
  avatarUrl: string | null;
}

interface Props {
  user: HeaderUser | null;
  isAdmin: boolean;
}

export default function HeaderClient({ user, isAdmin }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-espresso/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="LekkerPlekje">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png?v=4"
              alt="LekkerPlekje"
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/hoe-het-werkt"
              className="text-sm font-semibold text-espresso hover:text-spritz transition-colors"
            >
              Hoe het werkt
            </Link>
            <CitiesMenu />
            <Link
              href="/toevoegen"
              prefetch={false}
              className="text-sm font-medium text-spritz hover:text-spritz-hover transition-colors"
            >
              + Plekje toevoegen
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full bg-groen/10 px-3 py-1.5 text-sm font-medium text-groen hover:bg-groen/20 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                Admin
              </Link>
            )}
            {user ? (
              <Link
                href="/profiel"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full bg-spritz/10 px-3 py-1.5 text-sm font-medium text-spritz hover:bg-spritz/20 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-spritz text-xs font-bold text-white overflow-hidden">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.initial
                  )}
                </span>
                {user.displayName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-espresso px-4 py-2 text-sm font-medium text-creme hover:bg-espresso-light transition-colors"
              >
                Inloggen
              </Link>
            )}
          </nav>

          {/* Mobile-only persistent CTA so users can always submit a plekje */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/toevoegen"
              prefetch={false}
              className="inline-flex items-center rounded-full bg-spritz px-3 py-1.5 text-xs font-semibold text-white hover:bg-spritz-hover transition-colors"
            >
              + Plekje
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-espresso"
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
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link
              href="/hoe-het-werkt"
              className="text-sm font-semibold text-espresso hover:text-spritz"
              onClick={() => setMenuOpen(false)}
            >
              Hoe het werkt
            </Link>
            <CitiesMenu mobile />
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-groen/10 px-3 py-1.5 text-sm font-medium text-groen"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                Admin
              </Link>
            )}
            {user ? (
              <Link
                href="/profiel"
                prefetch={false}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-spritz/10 px-3 py-1.5 text-sm font-medium text-spritz"
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-spritz text-xs font-bold text-white overflow-hidden">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.initial
                  )}
                </span>
                {user.displayName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex w-fit items-center rounded-full bg-espresso px-4 py-2 text-sm font-medium text-creme"
                onClick={() => setMenuOpen(false)}
              >
                Inloggen
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
