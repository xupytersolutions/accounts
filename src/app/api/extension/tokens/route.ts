import { prisma } from "@/lib/prisma";
import { requireUser, jsonError, withError } from "@/lib/api-helpers";
import { createExtensionToken } from "@/lib/auth-extension";

export async function GET() {
  try {
    const user = await requireUser();
    const tokens = await prisma.extensionToken.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, createdAt: true, expiresAt: true, revokedAt: true, lastUsedAt: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ tokens });
  } catch (e) {
    return withError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const name = body.name ? String(body.name).trim().slice(0, 100) || null : null;
    const expiresInDays = body.expiresInDays ? Math.min(Math.max(Number(body.expiresInDays), 1), 14) : 14;

    // Limit active tokens to prevent abuse
    const activeCount = await prisma.extensionToken.count({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (activeCount >= 10) return jsonError("Too many active tokens (max 10). Revoke one first.", 409);

    const { raw, record } = await createExtensionToken(user.id, { name: name || undefined, expiresInDays });
    // Return raw token ONCE; never log it
    return Response.json(
      { token: raw, id: record.id, expiresAt: record.expiresAt, name: record.name },
      { status: 201 }
    );
  } catch (e) {
    return withError(e);
  }
}
