import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";
import { ensureCategory } from "@/lib/actions/categories";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: spaceId } = await params;
    const body = await req.json();
    const entries: Array<{ title?: string | null; email: string; password: string; url?: string | null; description?: string | null; category?: string | null; icon?: string | null; color?: string | null; logoUrl?: string | null; categoryId?: string | null }> = body.entries;
    if (!Array.isArray(entries) || entries.length === 0) return jsonError("No entries provided", 422);
    const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
    if (!space) return jsonError("Space not found", 404);
    const existingTitles = new Set((await prisma.vaultEntry.findMany({ where: { spaceId }, select: { title: true } })).map((e) => (e.title ?? "").toLowerCase()).filter(Boolean));
    const seen = new Set<string>();
    for (const e of entries) {
      if (!e.email || !e.password) return jsonError("Each entry needs login and password", 422);
      if (e.title) {
        const base = e.title.trim(); let low = base.toLowerCase(); let n = 2;
        while (existingTitles.has(low) || seen.has(low)) { const candidate = `${base} (${n})`; low = candidate.toLowerCase(); if (!existingTitles.has(low) && !seen.has(low)) { e.title = candidate; break; } n++; if (n > 100) return jsonError(`Duplicate title: ${base}`, 409); }
        seen.add(low); existingTitles.add(low);
      }
    }
    const mapped = await Promise.all(entries.map(async (e) => {
      let categoryId: string | null = e.categoryId ?? null; let category: string | null = e.category?.trim() || null; let icon: string | null = e.icon ?? null; let color: string | null = e.color ?? null; let logoUrl: string | null = e.logoUrl ?? null;
      if (categoryId) { const cat = await prisma.category.findFirst({ where: { id: categoryId, ownerId: user.id } }); if (cat) { category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; } }
      else if (category) { const cat = await ensureCategory(category, icon, color, logoUrl, user.id); categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl; }
      return { spaceId, title: e.title?.trim() || null, email: e.email.trim(), password: encrypt(String(e.password)), url: e.url?.trim() || null, description: e.description?.trim() || null, category, icon, color: color || "#006FEE", logoUrl, categoryId };
    }));
    await prisma.vaultEntry.createMany({ data: mapped });
    const created = await prisma.vaultEntry.findMany({ where: { spaceId }, include: { categoryRef: true }, orderBy: { createdAt: "desc" } });
    const sanitized = created.map((e) => {
      const { password: _p, ...rest } = e;
      void _p;
      return rest;
    });
    return Response.json({ entries: sanitized }, { status: 201 });
  } catch (e) {
    return withError(e);
  }
}
