import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { PrivateShell } from "@/components/private-shell";
import { prisma } from "@/lib/prisma";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = session.user.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { createdAt: true } })
    : null;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <PrivateShell user={session.user} createdAt={dbUser?.createdAt ?? null} signOutAction={signOutAction}>
      {children}
    </PrivateShell>
  );
}
