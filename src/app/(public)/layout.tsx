import Link from "next/link";
import { Button } from "@heroui/react";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        actions={
          isLoggedIn ? (
            <Link href="/dashboard"><Button variant="primary">Dashboard</Button></Link>
          ) : (
            <Link href="/login"><Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">Sign in</Button></Link>
          )
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
