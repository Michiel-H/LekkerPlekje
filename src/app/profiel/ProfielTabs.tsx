"use client";

import { useState } from "react";
import PlekjeCard from "@/components/PlekjeCard";

interface Plekje {
  id: string;
  name: string;
  neighborhood?: string | null;
  imageUrl?: string | null;
  tags: { emoji: string; name: string }[];
  toppertjeName?: string;
  toppertjeTitle?: string;
}

interface QueueItem {
  id: string;
  name: string;
  neighborhood: string | null;
  created_at: string;
  status: "pending" | "rejected";
}

type Tab = "mine" | "saved" | "queue";

export default function ProfielTabs({
  published,
  saved,
  pending,
  rejected,
}: {
  published: Plekje[];
  saved: Plekje[];
  pending: QueueItem[];
  rejected: QueueItem[];
}) {
  const [tab, setTab] = useState<Tab>("mine");

  const queueCount = pending.length + rejected.length;

  const tabs: { key: Tab; label: string; count: number; badge?: boolean }[] = [
    { key: "mine", label: "Mijn plekjes", count: published.length },
    { key: "saved", label: "Opgeslagen", count: saved.length },
    { key: "queue", label: "Wachtkamer", count: queueCount, badge: pending.length > 0 },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-espresso/10 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? "text-spritz border-b-2 border-spritz -mb-px"
                : "text-espresso-light hover:text-espresso"
            }`}
          >
            {t.label}
            <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-espresso/5 px-1.5 text-xs font-semibold text-espresso-light">
              {t.count}
            </span>
            {t.badge && (
              <span className="absolute top-2 right-1.5 h-2 w-2 rounded-full bg-spritz" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "mine" && (
        <>
          {published.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {published.map((p) => (
                <PlekjeCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <EmptyState text="Je hebt nog geen goedgekeurde plekjes. Begin met je eerste!" />
          )}
        </>
      )}

      {tab === "saved" && (
        <>
          {saved.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((p) => (
                <PlekjeCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <EmptyState text="Je hebt nog geen plekjes opgeslagen. Klik op het ❤ bij een plekje om het hier te bewaren." />
          )}
        </>
      )}

      {tab === "queue" && (
        <>
          {queueCount === 0 ? (
            <EmptyState text="Geen inzendingen in de wachtkamer." />
          ) : (
            <div className="space-y-3">
              {pending.map((q) => (
                <QueueRow key={q.id} item={q} />
              ))}
              {rejected.map((q) => (
                <QueueRow key={q.id} item={q} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-white border border-espresso/8 p-8 text-center">
      <p className="text-espresso-light">{text}</p>
    </div>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  const isPending = item.status === "pending";
  return (
    <div className="rounded-xl bg-white border border-espresso/8 p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-espresso truncate">{item.name}</p>
        {item.neighborhood && (
          <p className="text-sm text-espresso-light truncate">{item.neighborhood}</p>
        )}
        <p className="text-xs text-espresso-light/70 mt-0.5">
          Ingestuurd op {new Date(item.created_at).toLocaleDateString("nl-NL")}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
          isPending ? "bg-spritz/10 text-spritz" : "bg-koraal/10 text-koraal"
        }`}
      >
        {isPending ? "⏳ Wacht op goedkeuring" : "❌ Afgewezen"}
      </span>
    </div>
  );
}
