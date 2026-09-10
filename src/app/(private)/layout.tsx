import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { PrivateShell } from "@/components/private-shell";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <PrivateShell user={session.user} signOutAction={signOutAction}>
      {children}
    </PrivateShell>
  );
}
