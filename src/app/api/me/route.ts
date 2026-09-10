import { requireUser, withError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    });
    return Response.json({ user: dbUser });
  } catch (e) {
    return withError(e);
  }
}
