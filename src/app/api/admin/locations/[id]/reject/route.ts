import { NextResponse, type NextRequest } from "next/server";
import { isForbidden, recordAuditEvent, requireAdmin } from "@/lib/adminApi";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  const ctx = await requireAdmin();
  if (isForbidden(ctx)) return ctx.response;
  const { id } = await params;

  const { error } = await ctx.admin
    .from("locations")
    .update({
      status: "rejected",
      approved_at: null,
      approved_by: ctx.adminId,
    } as never)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditEvent({
    adminId: ctx.adminId,
    action: "reject_location",
    targetType: "location",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
