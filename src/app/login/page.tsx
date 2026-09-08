import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { LoginClient } from "@/components/login-client";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) redirect(callbackUrl ?? "/dashboard");

  async function action() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" });
  }

  return <LoginClient action={action} />;
}
