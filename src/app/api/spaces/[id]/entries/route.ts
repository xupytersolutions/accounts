import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validators";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";
import { ensureCategory } from "@/lib/actions/categories";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: spaceId } = await params;
    const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
    if (!space) return jsonError("Space not found", 404);
    const entries = await prisma.vaultEntry.findMany({ where: { spaceId }, include: { categoryRef: true }, orderBy: { createdAt: "desc" } });
    return Response.json({ entries });
  } catch (e) {
    return withError(e);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: spaceId } = await params;
    const body = await req.json();
    const parsedEntry = entrySchema.safeParse({
      title: body.title ?? null,
      email: body.email,
      password: body.password,
      url: body.url ?? null,
      description: body.description ?? null,
      category: body.category ?? body.customCategory ?? null,
      icon: body.icon ?? null,
      color: body.color ?? null,
      logoUrl: body.logoUrl ?? null,
      categoryId: body.categoryId ?? null,
      customCategory: body.customCategory ?? null,
    });
    if (!parsedEntry.success) return jsonError(parsedEntry.error.issues[0].message, 422, { issues: parsedEntry.error.issues });
    const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
    if (!space) return jsonError("Space not found", 404);
    if (body.title) {
      const dup = await prisma.vaultEntry.findFirst({ where: { spaceId, title: { equals: String(body.title).trim(), mode: "insensitive" } } });
      if (dup) return jsonError("Title must be unique in this space", 409);
    }
    let categoryId: string | null = null;
    let category: string | null = null;
    let icon: string | null = body.icon ?? null;
    let color: string | null = body.color ?? "#006FEE";
    let logoUrl: string | null = body.logoUrl ?? null;
    const rawCategoryId = body.categoryId ? String(body.categoryId).trim() : null;
    const rawCategory = body.category ? String(body.category).trim() || null : null;
    const customCategory = body.customCategory ? String(body.customCategory).trim() || null : null;
    if (rawCategoryId && rawCategoryId !== "none") {
      if (rawCategoryId === "custom" && customCategory) {
        const cat = await ensureCategory(customCategory, icon, color, logoUrl, user.id);
        categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl;
      } else if (rawCategoryId !== "custom") {
        const cat = await prisma.category.findFirst({ where: { id: rawCategoryId, ownerId: user.id } });
        if (!cat) return jsonError("Category not found", 404);
        categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl;
      }
    } else if (rawCategory) {
      const cat = await ensureCategory(rawCategory, icon, color, logoUrl, user.id);
      categoryId = cat.id; category = cat.name; icon = cat.icon; color = cat.color; logoUrl = cat.logoUrl;
    }
    const entry = await prisma.vaultEntry.create({
      data: { spaceId, title: body.title ? String(body.title).trim() || null : null, email: String(body.email).trim(), password: String(body.password), description: body.description ? String(body.description).trim() || null : null, url: body.url ? String(body.url).trim() || null : null, category, icon, color, logoUrl, categoryId },
      include: { categoryRef: true },
    });
    return Response.json({ entry }, { status: 201 });
  } catch (e) {
    return withError(e);
  }
}
