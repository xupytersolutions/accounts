import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard-client";
import { createSpace, deleteSpace, updateSpace } from "@/lib/actions";

export default async function DashboardPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
  const spaces = await prisma.space.findMany({
    where: { ownerId: user!.id },
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient spaces={spaces as never} createSpace={createSpace} deleteSpace={deleteSpace} updateSpace={updateSpace} />;
}
