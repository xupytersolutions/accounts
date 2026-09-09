"use client";
import { Button, Card, Separator } from "@heroui/react";
import Link from "next/link";
import { SiteHeader } from "./site-header";

export function LoginClient({ action }: { action: () => Promise<void> }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md border border-border bg-card shadow-sm">
          <Card.Header className="flex flex-col gap-2 px-8 pb-0 pt-8">
            <Card.Title className="text-2xl font-bold text-foreground">Welcome back</Card.Title>
            <Card.Description className="text-base text-muted-foreground">Sign in with Google to access your vault. No passwords stored here — we delegate to Google.</Card.Description>
          </Card.Header>
          <Card.Content className="gap-6 px-8 pb-8 pt-6">
            <form action={action}>
              <Button type="submit" size="lg" className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold">
                <span className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </span>
              </Button>
            </form>
            <Separator className="bg-border" />
            <p className="text-center text-sm text-muted-foreground">By continuing you agree to store account credentials encrypted in your private spaces.</p>
            <div className="text-center">
              <Link href="/" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to public home
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
