import HeaderClient, { type HeaderUser } from "./HeaderClient";
import { getCurrentUser, isAdmin as roleIsAdmin } from "@/lib/auth";

/**
 * Server component. Fetches the current user once per request (deduped via
 * React `cache` so multiple Header + page calls share the same query) and
 * passes the rendered data to the lightweight client component.
 *
 * This eliminates the extra client-side auth + profile round trip that used
 * to happen on every page load.
 */
export default async function Header() {
  const user = await getCurrentUser();

  const headerUser: HeaderUser | null = user
    ? {
        displayName: user.display_name,
        initial: user.display_name.charAt(0).toUpperCase(),
        avatarUrl: user.avatar_url ?? null,
      }
    : null;

  return <HeaderClient user={headerUser} isAdmin={user ? roleIsAdmin(user.role) : false} />;
}
