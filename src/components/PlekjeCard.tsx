import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";

interface PlekjeCardProps {
  id: string;
  name: string;
  neighborhood?: string | null;
  imageUrl?: string | null;
  tags: { emoji: string; name: string }[];
  toppertjeName?: string;
  toppertjeTitle?: string;
  /** Pass-through to FavoriteButton to avoid per-card auth/favorites round trip */
  initialFavorited?: boolean;
  currentUserId?: string | null;
  /** Denormalised favourite total — when provided, the heart shows the count */
  favoritesCount?: number;
}

export default function PlekjeCard({
  id,
  name,
  neighborhood,
  imageUrl,
  tags,
  toppertjeName,
  toppertjeTitle,
  initialFavorited,
  currentUserId,
  favoritesCount,
}: PlekjeCardProps) {
  return (
    <Link
      href={`/plekje/${id}`}
      className="group block rounded-2xl bg-white border border-espresso/8 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] bg-groen/10 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-display font-semibold text-groen/40">
            Geen afbeelding
          </div>
        )}
        <div className="absolute top-2 right-2">
          <FavoriteButton
            locationId={id}
            size="sm"
            initialFavorited={initialFavorited}
            currentUserId={currentUserId}
            initialCount={favoritesCount}
          />
        </div>
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
                {tag.name}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-espresso/5 px-2.5 py-1 text-xs text-espresso-light">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {toppertjeName && (
          <p className="mt-3 text-xs text-spritz font-medium">
            Ontdekt door: {toppertjeName}{" "}
            {toppertjeTitle && <span className="opacity-70">{toppertjeTitle}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
