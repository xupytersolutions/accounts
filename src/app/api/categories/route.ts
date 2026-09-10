import { prisma } from "@/lib/prisma";
import { requireUser, withError } from "@/lib/api-helpers";
import { ensureDefaultCategories } from "@/lib/category-seed";

export async function GET() {
  try {
    const user = await requireUser();
    await ensureDefaultCategories(user.id);
    const categories = await prisma.category.findMany({ where: { ownerId: user.id }, orderBy: { name: "asc" } });
    return Response.json({ categories });
  } catch (e) { return withError(e); }
}
