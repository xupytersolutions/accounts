import { prisma } from "@/lib/prisma";
import { withError, jsonError } from "@/lib/api-helpers";
import { requireExtensionUser } from "@/lib/auth-extension";
import { isDomainMatch } from "@/lib/utils/domain";

export async function GET(req: Request) {
  try {
    const user = await requireExtensionUser(req);
    const { searchParams } = new URL(req.url);
    const host = searchParams.get("host");
    const q = searchParams.get("q")?.trim() || "";
    const spaceId = searchParams.get("spaceId");

    // Fetch user spaces first to scope query
    const spaces = await prisma.space.findMany({ where: { ownerId: user.id }, select: { id: true } });
    const spaceIds = spaceId ? [spaceId] : spaces.map((s) => s.id);
    if (spaceId && !spaceIds.includes(spaceId)) {
      const owned = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
      if (!owned) return jsonError("Space not found", 404);
    }

    const where: Record<string, unknown> = { spaceId: { in: spaceIds } };
    if (q) {
      (where as Record<string, unknown>).OR = [
        { title: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { url: { contains: q, mode: "insensitive" } },
      ];
    }

    const entries = await prisma.vaultEntry.findMany({
      where: where as never,
      include: { categoryRef: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    let filtered = entries;
    if (host) {
      filtered = entries.filter((e) => isDomainMatch(e.url, host));
    }

    const sanitized = filtered.map((e) => {
      const { password: _p, ...rest } = e;
      void _p;
      return rest;
    });

    return Response.json({ entries: sanitized });
  } catch (e) {
    return withError(e);
  }
}
