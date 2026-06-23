import { levelInfo } from "@/lib/rewards";

export default function RewardsHeader({
  points,
  streak,
  badges,
  spots,
  upvotes,
}: {
  points: number;
  streak: number;
  badges: { slug: string; name: string; emoji: string }[];
  spots: number;
  upvotes: number;
}) {
  const lvl = levelInfo(points);
  return (
    <section className="rounded-2xl bg-white border border-espresso/8 p-5 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl font-bold text-espresso">
            {lvl.current.emoji} {lvl.current.name}
          </p>
          <p className="text-sm text-espresso-light">
            {points} punten · 🔥 {streak} dagen
          </p>
        </div>
        <div className="text-right text-sm text-espresso-light">
          <span className="font-semibold text-espresso">{spots}</span> plekjes ·{" "}
          <span className="font-semibold text-espresso">{upvotes}</span> duimpjes
        </div>
      </div>

      {lvl.next && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-espresso/8 overflow-hidden">
            <div
              className="h-full bg-spritz"
              style={{ width: `${Math.round(lvl.progress * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-espresso-light">
            Nog {lvl.toNext} punten tot {lvl.next.name} {lvl.next.emoji}
          </p>
        </div>
      )}

      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.slug}
              title={b.name}
              className="inline-flex items-center gap-1 rounded-full bg-groen/10 px-3 py-1 text-xs font-medium text-groen"
            >
              {b.emoji} {b.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
