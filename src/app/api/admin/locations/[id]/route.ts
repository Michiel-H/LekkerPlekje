import { NextResponse, type NextRequest } from "next/server";
import { isForbidden, recordAuditEvent, requireAdmin } from "@/lib/adminApi";

interface Params {
  params: Promise<{ id: string }>;
}

const MAX_NAME = 120;
const MAX_ADDRESS = 200;
const MAX_NEIGHBORHOOD = 100;

export async function PATCH(request: NextRequest, { params }: Params) {
  const ctx = await requireAdmin();
  if (isForbidden(ctx)) return ctx.response;
  const { id } = await params;

  let body: { name?: string; address?: string; neighborhood?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const update: Record<string, string | null> = {};
  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed || trimmed.length > MAX_NAME) {
      return NextResponse.json({ error: "Ongeldige naam." }, { status: 400 });
    }
    update.name = trimmed;
  }
  if (typeof body.address === "string") {
    const trimmed = body.address.trim();
    if (!trimmed || trimmed.length > MAX_ADDRESS) {
      return NextResponse.json({ error: "Ongeldig adres." }, { status: 400 });
    }
    update.address = trimmed;
  }
  if (body.neighborhood !== undefined) {
    if (body.neighborhood === null || body.neighborhood === "") {
      update.neighborhood = null;
    } else if (typeof body.neighborhood === "string") {
      const trimmed = body.neighborhood.trim();
      if (trimmed.length > MAX_NEIGHBORHOOD) {
        return NextResponse.json({ error: "Buurt te lang." }, { status: 400 });
      }
      update.neighborhood = trimmed;
    }
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Niets om bij te werken." }, { status: 400 });
  }

  const { error } = await ctx.admin
    .from("locations")
    .update(update as never)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditEvent({
    adminId: ctx.adminId,
    action: "edit_location",
    targetType: "location",
    targetId: id,
    metadata: update,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const ctx = await requireAdmin();
  if (isForbidden(ctx)) return ctx.response;
  const { id } = await params;

  const { error } = await ctx.admin.from("locations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditEvent({
    adminId: ctx.adminId,
    action: "delete_location",
    targetType: "location",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
