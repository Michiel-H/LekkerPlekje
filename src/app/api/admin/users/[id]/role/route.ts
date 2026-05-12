import { NextResponse, type NextRequest } from "next/server";
import { isForbidden, recordAuditEvent, requireAdmin } from "@/lib/adminApi";
import type { UserRole } from "@/lib/supabase/types";

const VALID_TARGET_ROLES: UserRole[] = ["user", "toppertje", "admin"];

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const ctx = await requireAdmin();
  if (isForbidden(ctx)) return ctx.response;
  const { id } = await params;

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const nextRole = body.role as UserRole | undefined;
  if (!nextRole || !VALID_TARGET_ROLES.includes(nextRole)) {
    return NextResponse.json({ error: "Ongeldige rol." }, { status: 400 });
  }

  // Only superadmins can grant or revoke the admin role; regular admins can
  // only flip users between 'user' and 'toppertje'.
  if (nextRole === "admin" && ctx.adminRole !== "superadmin") {
    return NextResponse.json(
      { error: "Alleen superadmin kan admins maken." },
      { status: 403 }
    );
  }

  const { data: currentRow, error: readErr } = await ctx.admin
    .from("users")
    .select("role")
    .eq("id", id)
    .single();
  if (readErr || !currentRow) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }
  const currentRole = (currentRow as { role: UserRole }).role;
  if (currentRole === "superadmin") {
    return NextResponse.json(
      { error: "Superadmin-rol kan niet via deze route gewijzigd worden." },
      { status: 403 }
    );
  }
  if (currentRole === "admin" && ctx.adminRole !== "superadmin") {
    return NextResponse.json(
      { error: "Alleen superadmin kan admins demoten." },
      { status: 403 }
    );
  }

  const { error } = await ctx.admin
    .from("users")
    .update({ role: nextRole } as never)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditEvent({
    adminId: ctx.adminId,
    action: "change_user_role",
    targetType: "user",
    targetId: id,
    metadata: { from: currentRole, to: nextRole },
  });

  return NextResponse.json({ ok: true });
}
