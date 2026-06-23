import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { LEVELS } from "@/lib/rewards";

export const metadata: Metadata = {
  title: "Toppers · LekkerPlekje.com",
  description: "De fanatiekste ontdekkers van LekkerPlekje.",
};

interface Props {
  searchParams: Promise<{ periode?: string }>;
}

export default async function ToppersPage({ searchParams }: Props) {
  const { periode } = await searchParams;
  const period = periode === "all" ? "all" : "month";

  const supabase = await createClient();
  // The repo's hand-written Database type doesn't infer rpc arg/return shapes.
  const { data } = await supabase.rpc("get_leaderboard", {
    p_period: period,
    p_limit: 50,
  } as never);
  const rows = (data ?? []) as {
    user_id: string;
    display_name: string;
    level: number;
    points: number;
  }[];

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-espresso">Toppers</h1>
          <p className="mt-1 text-sm text-espresso-light">
            De fanatiekste ontdekkers van LekkerPlekje.
          </p>

          {/* Period toggle */}
          <div className="mt-6 inline-flex rounded-full bg-espresso/5 p-1 text-sm font-medium">
            <Link
              href="/toppers?periode=month"
              className={`rounded-full px-4 py-1.5 transition-colors ${
                period === "month" ? "bg-spritz text-creme" : "text-espresso-light hover:text-espresso"
              }`}
            >
              Deze maand
            </Link>
            <Link
              href="/toppers?periode=all"
              className={`rounded-full px-4 py-1.5 transition-colors ${
                period === "all" ? "bg-spritz text-creme" : "text-espresso-light hover:text-espresso"
              }`}
            >
              Aller tijden
            </Link>
          </div>

          {rows.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-white border border-espresso/8 p-8 text-center text-espresso-light">
              Nog geen punten deze periode. Voeg een plekje toe of stem op je favorieten!
            </p>
          ) : (
            <ol className="mt-6 space-y-2">
              {rows.map((row, i) => {
                const lvl = LEVELS[row.level] ?? LEVELS[0];
                return (
                  <li
                    key={row.user_id}
                    className="flex items-center gap-4 rounded-2xl bg-white border border-espresso/8 px-4 py-3"
                  >
                    <span className="w-8 flex-shrink-0 text-center text-lg font-bold text-espresso-light">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-espresso">
                        {row.display_name}
                      </p>
                      <p className="text-xs text-espresso-light">{lvl.name}</p>
                    </div>
                    <span className="flex-shrink-0 font-display font-bold text-spritz">
                      {row.points} pt
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
