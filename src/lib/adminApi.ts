import { NextResponse } from "next/server";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUser, isAdmin, isSuperAdmin } from "@/lib/auth";
import type { Database } from "@/lib/supabase/types";
import { reportError } from "@/lib/reportError";

interface AuthorizedContext {
  adminId: string;
  adminRole: "admin" | "superadmin";
  admin: SupabaseClient<Database>;
}

interface ForbiddenResult {
  response: NextResponse;
}

/**
 * Verify the caller is an admin via cookie session, then hand back a
 * service-role client (which bypasses RLS) for the actual write. The
 * service-role key is only ever used server-side from this helper.
 */
export async function requireAdmin(): Promise<AuthorizedContext | ForbiddenResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Niet ingelogd." }, { status: 401 }),
    };
  }
  if (!isAdmin(user.role)) {
    return {
      response: NextResponse.json({ error: "Geen toegang." }, { status: 403 }),
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return {
      response: NextResponse.json(
        { error: "Server is niet correct geconfigureerd." },
        { status: 500 }
      ),
    };
  }

  const admin = createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    adminId: user.id,
    adminRole: user.role as "admin" | "superadmin",
    admin,
  };
}

export function isForbidden(
  ctx: AuthorizedContext | ForbiddenResult
): ctx is ForbiddenResult {
  return "response" in ctx;
}

interface AuditPayload {
  adminId: string;
  action: string;
  targetType: "location" | "user" | "location_tag";
  targetId: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Write a row to admin_audit_log. Best-effort: a logging failure must
 * NOT prevent the actual moderation action from completing.
 *
 * Uses the service-role client (from requireAdmin) rather than the cookie
 * session, so a logging miss can't be caused by an expired token — and
 * the write goes through even if the admin's RLS context is somehow off.
 */
export async function recordAuditEvent(
  client: SupabaseClient<Database>,
  payload: AuditPayload
) {
  try {
    await client.from("admin_audit_log").insert({
      admin_id: payload.adminId,
      action: payload.action,
      target_type: payload.targetType,
      target_id: payload.targetId,
      metadata: payload.metadata ?? null,
    } as never);
  } catch (err) {
    reportError(err, { where: "recordAuditEvent", payload });
  }
}

export function requireSuperAdmin(
  ctx: AuthorizedContext
): NextResponse | null {
  if (!isSuperAdmin(ctx.adminRole)) {
    return NextResponse.json(
      { error: "Alleen superadmin." },
      { status: 403 }
    );
  }
  return null;
}
