import { prisma } from "@/lib/prisma";
import { withError } from "@/lib/api-helpers";
import { requireExtensionUser } from "@/lib/auth-extension";

export async function GET(req: Request) {
  try {
    const user = await requireExtensionUser(req);
    const spaces = await prisma.space.findMany({
      where: { ownerId: user.id },
      include: { _count: { select: { entries: true } } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ spaces });
  } catch (e) {
    return withError(e);
  }
}
