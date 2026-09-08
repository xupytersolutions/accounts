import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard-client";
import { createSpace, deleteSpace, updateSpace } from "@/lib/actions";
import { DEFAULT_SPACES } from "@/lib/constants/default-spaces";

export default async function DashboardPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
  let spaces = await prisma.space.findMany({
    where: { ownerId: user!.id },
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Lazy seed for users registered before this feature or if createUser event failed
  if (spaces.length === 0 && user) {
    try {
      await prisma.space.createMany({
        data: DEFAULT_SPACES.map((s) => ({
          name: s.name,
          type: s.type,
          description: s.description,
          color: s.color,
          icon: s.icon,
          ownerId: user.id,
        })),
      });
      spaces = await prisma.space.findMany({
        where: { ownerId: user.id },
        include: { _count: { select: { entries: true } } },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("[dashboard] failed to seed default spaces", e);
    }
  }

  return <DashboardClient spaces={spaces as never} createSpace={createSpace} deleteSpace={deleteSpace} updateSpace={updateSpace} />;
}
