import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: entryId } = await params;
    const { targetSpaceId } = await req.json();
    if (!targetSpaceId) return jsonError("Target space required", 422);
    const entry = await prisma.vaultEntry.findUnique({ where: { id: entryId }, include: { space: true } });
    if (!entry) return jsonError("Entry not found", 404);
    const sourceSpace = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
    if (!sourceSpace) return jsonError("Unauthorized source", 401);
    const target = await prisma.space.findFirst({ where: { id: targetSpaceId, ownerId: user.id } });
    if (!target) return jsonError("Target space not found", 404);
    if (entry.spaceId === targetSpaceId) return jsonError("Already in this space", 409);
    if (entry.title) { const dup = await prisma.vaultEntry.findFirst({ where: { spaceId: targetSpaceId, title: { equals: entry.title, mode: "insensitive" } } }); if (dup) return jsonError("Title already exists in target space", 409); }
    const updated = await prisma.vaultEntry.update({ where: { id: entryId }, data: { spaceId: targetSpaceId }, include: { categoryRef: true } });
    return Response.json({ entry: updated });
  } catch (e) { return withError(e); }
}
