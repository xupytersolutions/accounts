import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { entryIds, spaceId } = await req.json();
    if (!Array.isArray(entryIds) || entryIds.length === 0) return jsonError("No entries selected", 422);
    if (!spaceId) return jsonError("Space required", 422);
    const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
    if (!space) return jsonError("Space not found", 404);
    await prisma.vaultEntry.deleteMany({ where: { id: { in: entryIds }, spaceId } });
    return Response.json({ ok: true });
  } catch (e) { return withError(e); }
}
