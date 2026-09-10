"use server";
import { prisma } from "@/lib/prisma";

export async function ensureCategory(name: string, icon: string | null, color: string | null, logoUrl: string | null, ownerId: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name required");
  let cat = await prisma.category.findFirst({ where: { ownerId, name: { equals: trimmed, mode: "insensitive" } } });
  if (cat) {
    if ((icon && cat.icon !== icon) || (color && cat.color !== color) || (logoUrl && cat.logoUrl !== logoUrl)) {
      cat = await prisma.category.update({ where: { id: cat.id }, data: { icon: icon ?? cat.icon, color: color ?? cat.color, logoUrl: logoUrl ?? cat.logoUrl } });
    }
    return cat;
  }
  return await prisma.category.create({ data: { name: trimmed, icon: icon || null, color: color || "#006FEE", logoUrl: logoUrl || null, ownerId } });
}
