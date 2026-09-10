import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { entryIds, targetSpaceId } = await req.json();
    if (!Array.isArray(entryIds) || entryIds.length === 0) return jsonError("No entries selected", 422);
    if (!targetSpaceId) return jsonError("Target space required", 422);
    const target = await prisma.space.findFirst({ where: { id: targetSpaceId, ownerId: user.id } });
    if (!target) return jsonError("Target space not found", 404);
    const entries = await prisma.vaultEntry.findMany({ where: { id: { in: entryIds } }, include: { space: true } });
    for (const entry of entries) {
      const source = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
      if (!source) return jsonError("Unauthorized source", 401);
      if (entry.spaceId === targetSpaceId) return jsonError("Already in this space", 409);
      if (entry.title) { const dup = await prisma.vaultEntry.findFirst({ where: { spaceId: targetSpaceId, title: { equals: entry.title, mode: "insensitive" } } }); if (dup) return jsonError(`Title already exists in target space: ${entry.title}`, 409); }
    }
    await prisma.vaultEntry.updateMany({ where: { id: { in: entryIds } }, data: { spaceId: targetSpaceId } });
    return Response.json({ ok: true });
  } catch (e) { return withError(e); }
}
