import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";
import { decryptIfNeeded } from "@/lib/crypto";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: spaceId } = await params;
    const space = await prisma.space.findFirst({ where: { id: spaceId, ownerId: user.id } });
    if (!space) return jsonError("Space not found", 404);
    const entries = await prisma.vaultEntry.findMany({ where: { spaceId }, include: { categoryRef: true }, orderBy: { createdAt: "desc" } });
    const withSecrets = entries.map((e) => ({ ...e, password: decryptIfNeeded(e.password) }));
    return Response.json({ entries: withSecrets, space });
  } catch (e) {
    return withError(e);
  }
}
