import { NextResponse, type NextRequest } from "next/server";
import { isForbidden, recordAuditEvent, requireAdmin } from "@/lib/adminApi";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Hide or unhide an individual abusive `location_tag` by toggling `hidden_at`.
 * Same auth + audit pattern as the other admin mutations.
 *
 * Body: { hidden: boolean }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const ctx = await requireAdmin();
  if (isForbidden(ctx)) return ctx.response;
  const { id } = await params;

  let body: { hidden?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  if (typeof body.hidden !== "boolean") {
    return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
  }

  const hiddenAt = body.hidden ? new Date().toISOString() : null;

  const { error } = await ctx.admin
    .from("location_tags")
    .update({ hidden_at: hiddenAt } as never)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditEvent(ctx.admin, {
    adminId: ctx.adminId,
    action: body.hidden ? "hide_location_tag" : "unhide_location_tag",
    targetType: "location_tag",
    targetId: id,
  });

  return NextResponse.json({ ok: true, hidden_at: hiddenAt });
}
