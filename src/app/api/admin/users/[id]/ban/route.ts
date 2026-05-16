import { NextResponse, type NextRequest } from "next/server";
import { isForbidden, recordAuditEvent, requireAdmin } from "@/lib/adminApi";
import type { UserRole } from "@/lib/supabase/types";

interface Params {
  params: Promise<{ id: string }>;
}

type BanAction = "ban" | "unban";

export async function POST(request: NextRequest, { params }: Params) {
  const ctx = await requireAdmin();
  if (isForbidden(ctx)) return ctx.response;
  const { id } = await params;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const action = body.action as BanAction | undefined;
  if (action !== "ban" && action !== "unban") {
    return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
  }

  if (id === ctx.adminId) {
    return NextResponse.json(
      { error: "Je kan jezelf niet (de)bannen." },
      { status: 400 }
    );
  }

  const { data: currentRow, error: readErr } = await ctx.admin
    .from("users")
    .select("role, banned_at")
    .eq("id", id)
    .single();
  if (readErr || !currentRow) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  const target = currentRow as { role: UserRole; banned_at: string | null };

  if (target.role === "superadmin") {
    return NextResponse.json(
      { error: "Superadmin kan niet gebanned worden." },
      { status: 403 }
    );
  }
  if (target.role === "admin" && ctx.adminRole !== "superadmin") {
    return NextResponse.json(
      { error: "Alleen superadmin kan admins bannen." },
      { status: 403 }
    );
  }

  const nextBannedAt = action === "ban" ? new Date().toISOString() : null;

  const { error } = await ctx.admin
    .from("users")
    .update({ banned_at: nextBannedAt } as never)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditEvent(ctx.admin, {
    adminId: ctx.adminId,
    action: action === "ban" ? "ban_user" : "unban_user",
    targetType: "user",
    targetId: id,
    metadata: { previous_banned_at: target.banned_at },
  });

  return NextResponse.json({ ok: true, banned_at: nextBannedAt });
}
