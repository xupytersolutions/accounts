import { prisma } from "@/lib/prisma";
import { CATEGORY_PRESETS } from "@/lib/constants/category-presets";

/**
 * Ensures default categories exist for a user.
 * Idempotent: only creates presets that do not already exist (case-insensitive name match).
 * Called on first load of spaces so dropdown is DB-driven, not hardcoded.
 */
export async function ensureDefaultCategories(ownerId: string) {
  const existing = await prisma.category.findMany({
    where: { ownerId },
    select: { name: true },
  });
  const existingLower = new Set(existing.map((c) => c.name.toLowerCase()));

  const toCreate = CATEGORY_PRESETS.filter((p) => !existingLower.has(p.label.toLowerCase())).map((p) => ({
    name: p.label,
    icon: p.icon,
    color: p.color,
    logoUrl: p.logoUrl,
    ownerId,
  }));

  if (toCreate.length === 0) return;

  // createMany with skipDuplicates not reliable for case-insensitive, so create sequentially
  for (const data of toCreate) {
    await prisma.category.create({ data });
  }
}
