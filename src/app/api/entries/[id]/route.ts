import { prisma } from "@/lib/prisma";
import { updateEntrySchema } from "@/lib/validators";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";
import { ensureCategory } from "@/lib/actions/categories";
import { encrypt } from "@/lib/crypto";

function sanitize(entry: Record<string, unknown>) {
  const { password: _p, ...rest } = entry as { password: string } & Record<string, unknown>;
  void _p;
  return rest;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: entryId } = await params;
    const body = await req.json();
    const spaceId = String(body.spaceId ?? "");
    const parsed = updateEntrySchema.safeParse({
      title: body.title ?? null,
      email: body.email,
      password: body.password ?? null,
      url: body.url ?? null,
      description: body.description ?? null,
      category: body.category ?? body.customCategory ?? null,
      icon: body.icon ?? null,
      color: body.color ?? null,
      logoUrl: body.logoUrl ?? null,
      entryId,
      spaceId,
      categoryId: body.categoryId ?? null,
      customCategory: body.customCategory ?? null,
    });
    if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422, { issues: parsed.error.issues });
    if (!entryId || !spaceId) return jsonError("Missing fields", 422);
    const existing = await prisma.vaultEntry.findUnique({ where: { id: entryId }, include: { space: true } });
    if (!existing) return jsonError("Entry not found", 404);
    // Authorization: entry must belong to a space owned by user
    const ownerSpace = await prisma.space.findFirst({ where: { id: existing.spaceId, ownerId: user.id } });
    if (!ownerSpace) return jsonError("Unauthorized", 401);
    // Ensure the caller’s spaceId matches the entry’s current space (prevent cross-space IDOR)
    if (existing.spaceId !== spaceId) return jsonError("Space mismatch", 400);
    const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
    if (!space) return jsonError("Space not found", 404);
    if (body.title) {
      const dup = await prisma.vaultEntry.findFirst({ where: { spaceId, title: { equals: String(body.title).trim(), mode: "insensitive" }, NOT: { id: entryId } } });
      if (dup) return jsonError("Title must be unique in this space", 409);
    }
    let categoryId: string | null = null; let category: string | null = null; let icon: string | null = body.icon ?? null; let color: string | null = body.color ?? null; let logoUrl: string | null = body.logoUrl ?? null;
    const rawCategoryId = body.categoryId ? String(body.categoryId).trim() : null;
    const rawCategory = body.category ? String(body.category).trim() || null : null;
    const customCategory = body.customCategory ? String(body.customCategory).trim() || null : null;
    if (rawCategoryId && rawCategoryId !== "none") {
      if (rawCategoryId === "custom" && customCategory) { const cat = await ensureCategory(customCategory, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
      else if (rawCategoryId !== "custom") { const cat = await prisma.category.findFirst({ where: { id: rawCategoryId, ownerId: user.id } }); if (!cat) return jsonError("Category not found", 404); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
    } else if (rawCategory) { const cat = await ensureCategory(rawCategory, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
    else if (rawCategoryId === "none") { categoryId = null; category = null; icon = null; color = null; logoUrl = null; }
    const data: Record<string, unknown> = { title: body.title ? String(body.title).trim() || null : null, email: String(body.email).trim(), description: body.description ? String(body.description).trim() || null : null, url: body.url ? String(body.url).trim() || null : null, category, icon, color, logoUrl, categoryId };
    if (body.password) data.password = encrypt(String(body.password));
    if (rawCategoryId === "none") { data.category = null; data.icon = null; data.color = null; data.logoUrl = null; data.categoryId = null; }
    const entry = await prisma.vaultEntry.update({ where: { id: entryId }, data, include: { categoryRef: true } });
    return Response.json({ entry: sanitize(entry as unknown as Record<string, unknown>) });
  } catch (e) { return withError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: entryId } = await params;
    const entry = await prisma.vaultEntry.findUnique({ where: { id: entryId }, include: { space: true } });
    if (!entry) return jsonError("Entry not found", 404);
    const space = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
    if (!space) return jsonError("Unauthorized", 401);
    await prisma.vaultEntry.delete({ where: { id: entryId } });
    return Response.json({ ok: true });
  } catch (e) { return withError(e); }
}
