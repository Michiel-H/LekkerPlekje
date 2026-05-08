import Link from "next/link";

interface PlekjeCardProps {
  id: string;
  name: string;
  neighborhood?: string | null;
  imageUrl?: string | null;
  tags: { emoji: string; name: string }[];
  scoutName?: string;
  scoutTitle?: string;
}

export default function PlekjeCard({
  id,
  name,
  neighborhood,
  imageUrl,
  tags,
  scoutName,
  scoutTitle,
}: PlekjeCardProps) {
  return (
    <Link
      href={`/plekje/${id}`}
      className="group block rounded-2xl bg-white border border-espresso/8 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] bg-groen/10 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍊
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-espresso group-hover:text-spritz transition-colors">
          {name}
        </h3>
        {neighborhood && (
          <p className="mt-0.5 text-sm text-espresso-light">{neighborhood}</p>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center gap-1 rounded-full bg-groen/10 px-2.5 py-1 text-xs font-medium text-groen"
              >
                {tag.emoji} {tag.name}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-espresso/5 px-2.5 py-1 text-xs text-espresso-light">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {scoutName && (
          <p className="mt-3 text-xs text-spritz font-medium">
            Ontdekt door: {scoutName}{" "}
            {scoutTitle && <span className="opacity-70">🏅 {scoutTitle}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
