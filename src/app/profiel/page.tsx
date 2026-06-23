import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlekjeCard from "@/components/PlekjeCard";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import CityPicker from "./CityPicker";
import AvatarUpload from "./AvatarUpload";
import BioEditor from "./BioEditor";
import ProfielTabs from "./ProfielTabs";
import RewardsHeader from "@/components/RewardsHeader";
import { isToppertjeLike, toppertjeTitle } from "@/lib/titleMap";
import { flairFor } from "@/lib/rewards";

export default async function ProfielPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 px-4 py-16 text-center">
          <p className="text-espresso-light">Je moet ingelogd zijn.</p>
        </main>
        <Footer />
      </>
    );
  }

  const supabase = await createClient();

  // Award profile-completion points if the profile is now complete (idempotent,
  // scoped to the signed-in user inside the function via auth.uid()).
  await supabase.rpc("complete_profile");

  // Run the independent queries in parallel
  const [cityRes, myLocationsRes, favoritesRes, badgesRes, rewardRes] = await Promise.all([
    user.preferred_city_id
      ? supabase
          .from("cities")
          .select("name")
          .eq("id", user.preferred_city_id)
          .single()
      : Promise.resolve({ data: null as any }),
    supabase
      .from("locations")
      .select(
        `id, name, neighborhood, image_url, status, created_at, favorites_count,
         location_tags (tags (name, emoji))`
      )
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("favorites")
      .select(
        `location_id,
         locations (
           id, name, neighborhood, image_url, status, favorites_count,
           location_tags (tags (name, emoji)),
           users!locations_submitted_by_fkey (display_name, pronoun, role, points)
         )`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_badges")
      .select(`badge_slug, badges (slug, name, emoji, sort_order)`)
      .eq("user_id", user.id),
    // Fresh reward stats (reflects any award_points fired by complete_profile above).
    supabase
      .from("users")
      .select("points, current_streak")
      .eq("id", user.id)
      .single(),
  ]);
  const preferredCityName: string | null = (cityRes.data as any)?.name ?? null;
  const myLocations = myLocationsRes.data;
  const favorites = favoritesRes.data;

  const myBadges = (((badgesRes.data as any[]) || [])
    .map((r) => r.badges)
    .filter(Boolean) as { slug: string; name: string; emoji: string; sort_order: number }[])
    .sort((a, b) => a.sort_order - b.sort_order);
  const rewardStats = (rewardRes.data as any) ?? { points: 0, current_streak: 0 };

  const userIsToppertje = isToppertjeLike(user.role);

  const myPublished = (myLocations || []).filter((l: any) => l.status === "published");
  const myPending = (myLocations || []).filter((l: any) => l.status === "pending");
  const myRejected = (myLocations || []).filter((l: any) => l.status === "rejected");

  // Compute approved count from actual published locations instead of trusting
  // the denormalised counter on the user row — it can drift when a previously
  // approved location is later rejected or deleted.
  const liveApprovedCount = myPublished.length;

  function mapPlekje(loc: any) {
    return {
      id: loc.id,
      name: loc.name,
      neighborhood: loc.neighborhood,
      imageUrl: loc.image_url,
      tags: (loc.location_tags || []).map((lt: any) => ({
        emoji: lt.tags?.emoji || "",
        name: lt.tags?.name || "",
      })),
      toppertjeName: user!.display_name,
      toppertjeTitle: flairFor({
        role: user!.role,
        pronoun: user!.pronoun,
        points: rewardStats.points,
      }),
      currentUserId: user!.id,
      favoritesCount: loc.favorites_count ?? 0,
    };
  }

  const favoritePlekjes = ((favorites || []) as any[])
    .map((f: any) => f.locations)
    .filter((l: any) => l && l.status === "published")
    .map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      neighborhood: loc.neighborhood,
      imageUrl: loc.image_url,
      tags: (loc.location_tags || []).map((lt: any) => ({
        emoji: lt.tags?.emoji || "",
        name: lt.tags?.name || "",
      })),
      toppertjeName: loc.users?.display_name,
      toppertjeTitle: flairFor({
        role: loc.users?.role,
        pronoun: loc.users?.pronoun,
        points: loc.users?.points,
      }),
      // All items in "Opgeslagen" are by definition favorited
      initialFavorited: true,
      currentUserId: user!.id,
      favoritesCount: loc.favorites_count ?? 0,
    }));

  // Smaak-score: % of "up" votes across the user's location_tags
  let smaakScore: number | null = null;
  let smaakTotal = 0;
  let upvotesReceived = 0;
  if (myPublished.length > 0) {
    const locationIds = myPublished.map((l: any) => l.id);
    const { data: ltRows } = await supabase
      .from("location_tags")
      .select("score, total_votes")
      .in("location_id", locationIds);
    const totals = (ltRows || []).reduce(
      (acc: { up: number; total: number }, lt: any) => {
        acc.up += lt.score || 0;
        acc.total += lt.total_votes || 0;
        return acc;
      },
      { up: 0, total: 0 }
    );
    smaakTotal = totals.total;
    upvotesReceived = totals.up;
    if (totals.total >= 30) smaakScore = Math.round((totals.up / totals.total) * 100);
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <RewardsHeader
            points={rewardStats.points ?? 0}
            streak={rewardStats.current_streak ?? 0}
            badges={myBadges}
            spots={myPublished.length}
            upvotes={upvotesReceived}
          />

          {/* Profile header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
            <AvatarUpload
              userId={user.id}
              initialUrl={user.avatar_url ?? null}
              fallbackInitial={user.display_name.charAt(0).toUpperCase()}
            />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-espresso">
                {user.display_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {userIsToppertje ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-spritz/10 px-3 py-1 text-sm font-medium text-spritz">
                    {user.role === "admin" || user.role === "superadmin"
                      ? "Beheerder"
                      : toppertjeTitle(user.pronoun)}
                  </span>
                ) : (
                  <span className="text-sm text-espresso-light">
                    {liveApprovedCount} / 5 plekjes tot Toppertje
                  </span>
                )}
                <CityPicker
                  userId={user.id}
                  initialCityId={user.preferred_city_id ?? null}
                  initialCityName={preferredCityName}
                />
                {smaakScore !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-frisgroen/10 px-3 py-1 text-sm font-medium text-frisgroen">
                    {smaakScore}% Lekker
                  </span>
                )}
                <span className="text-xs text-espresso-light">
                  Lid sinds{" "}
                  {new Date(user.created_at).toLocaleDateString("nl-NL", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="mt-3">
                <BioEditor userId={user.id} initialBio={user.bio ?? null} />
              </div>
              {smaakScore === null && smaakTotal > 0 && (
                <p className="mt-2 text-xs text-espresso-light/70">
                  Smaak-score zichtbaar vanaf 30 stemmen ({smaakTotal}/30)
                </p>
              )}
            </div>
          </div>

          {/* Progress bar for non-toppertjes */}
          {user.role === "user" && (
            <div className="mb-8 rounded-xl bg-spritz/5 border border-spritz/15 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-espresso">
                  {liveApprovedCount >= 5
                    ? "Bijna! Wacht op de volgende goedkeuring 🎉"
                    : `Nog ${5 - liveApprovedCount} goedgekeurde ${
                        5 - liveApprovedCount === 1 ? "plekje" : "plekjes"
                      } te gaan en je bent een ${toppertjeTitle(user.pronoun)}!`}
                </span>
                <span className="text-espresso-light">{liveApprovedCount}/5</span>
              </div>
              <div className="h-2 rounded-full bg-espresso/5">
                <div
                  className="h-2 rounded-full bg-spritz transition-all"
                  style={{
                    width: `${Math.min((liveApprovedCount / 5) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Tabs: Mijn plekjes / Opgeslagen / Wachtkamer */}
          <ProfielTabs
            published={myPublished.map(mapPlekje)}
            saved={favoritePlekjes}
            pending={myPending.map((l: any) => ({
              id: l.id,
              name: l.name,
              neighborhood: l.neighborhood,
              created_at: l.created_at,
              status: l.status as "pending" | "rejected",
            }))}
            rejected={myRejected.map((l: any) => ({
              id: l.id,
              name: l.name,
              neighborhood: l.neighborhood,
              created_at: l.created_at,
              status: l.status as "pending" | "rejected",
            }))}
          />

          {/* Settings + logout */}
          <div className="mt-12 pt-6 border-t border-espresso/8 flex items-center justify-between">
            <a
              href="/profiel/instellingen"
              className="text-xs text-espresso-light/70 hover:text-espresso transition-colors"
            >
              Profiel bewerken & instellingen
            </a>
            <LogoutButton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
