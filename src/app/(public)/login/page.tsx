import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { LoginCard } from "@/components/login/login-card";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) redirect(callbackUrl ?? "/dashboard");

  async function action() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" });
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <LoginCard action={action} />
    </div>
  );
}
