import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin, isSuperAdmin } from "@/lib/auth";

/**
 * Server-side guard for admin *pages* (the route-handler equivalent lives in
 * `adminApi.ts`). Every admin page calls this so auth is enforced per-route,
 * not just by the layout — never trust that the layout ran.
 *
 * Redirects to "/" for anyone who isn't an admin and returns the verified
 * user otherwise.
 */
export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    redirect("/");
  }
  return user;
}

/** Same as {@link requireAdminPage} but for superadmin-only surfaces. */
export async function requireSuperAdminPage() {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user.role)) {
    redirect("/admin");
  }
  return user;
}
