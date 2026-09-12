import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const token = await prisma.extensionToken.findFirst({ where: { id, userId: user.id } });
    if (!token) return jsonError("Token not found", 404);
    if (token.revokedAt) return Response.json({ ok: true, alreadyRevoked: true });
    await prisma.extensionToken.update({ where: { id }, data: { revokedAt: new Date() } });
    return Response.json({ ok: true });
  } catch (e) {
    return withError(e);
  }
}
