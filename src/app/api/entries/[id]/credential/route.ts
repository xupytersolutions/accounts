import { prisma } from "@/lib/prisma";
import { jsonError, withError } from "@/lib/api-helpers";
import { requireExtensionUser } from "@/lib/auth-extension";
import { decryptIfNeeded } from "@/lib/crypto";
import { auth } from "@/auth";

async function requireUserOrExtension(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return requireExtensionUser(req);
  }
  const session = await auth();
  if (!session?.user?.email) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUserOrExtension(req);
    const { id: entryId } = await params;
    if (!entryId) return jsonError("Missing entry id", 422);

    const entry = await prisma.vaultEntry.findUnique({ where: { id: entryId }, include: { space: true } });
    if (!entry) return jsonError("Entry not found", 404);

    const space = await prisma.space.findFirst({ where: { id: entry.spaceId, ownerId: user.id } });
    if (!space) return jsonError("Unauthorized", 401);

    const password = decryptIfNeeded(entry.password);
    return Response.json({ id: entry.id, password, email: entry.email, title: entry.title, url: entry.url });
  } catch (e) {
    return withError(e);
  }
}
