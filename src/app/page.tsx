import { auth } from "@/auth";
import { LandingClient } from "@/components/landing-client";

export default async function Page() {
  const session = await auth();
  return <LandingClient isLoggedIn={!!session?.user} />;
}
