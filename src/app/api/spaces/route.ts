import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ spaces: [] }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return Response.json({ spaces: [] }, { status: 404 });
  const spaces = await prisma.space.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true, type: true, color: true, icon: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ spaces });
}
