"use client";

import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
import { SiteHeader } from "./site-header";
import { PasswordGenerator } from "./password-generator";
import { ArrowRightIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

export function LandingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        actions={
          isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="primary">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">Sign in</Button>
            </Link>
          )
        }
      />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-8 sm:pt-12 pb-20 sm:pb-32 relative">
            <div className="grid gap-10 sm:gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="flex flex-col gap-4">
                <Chip className="w-fit sm:flex gap-1 hidden" variant="soft">
                  <ShieldCheckIcon className="h-4" /> Google-only login • No passwords to remember
                </Chip>
                <h1 className="text-4xl sm:text-5xl font-bold text-display leading-tight text-foreground">
                  All your accounts,
                  <br />
                  <span className="text-primary">neatly organized</span>
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground">
                  Create spaces for personal, company and clients. Store account email, password and notes in a clean vault. Private by default, public pages for tools and guides coming soon.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-base px-8">Start Storing Securely <ArrowRightIcon /></Button>
                  </Link>
                </div>
              </div>

              <PasswordGenerator />
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:grid-cols-3">
            {[
              { title: "Spaces, not folders", desc: "Personal, Company, Clients — model your real life. Each space owns its vault entries.", icon: "📁" },
              { title: "Minimal credential form", desc: "Just email, password and description. Fast to add, easy to search. No bloat.", icon: "⚡" },
              { title: "Public / Private split", desc: "Vault is private and guarded by NextAuth. Public routes stay open for generator & blog.", icon: "🔒" },
            ].map((f) => (
              <Card key={f.title} className="border border-border bg-card hover:border-border-strong transition-colors">
                <Card.Content className="gap-3 p-6">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <p className="font-semibold text-lg text-foreground">{f.title}</p>
                  <p className="text-sm leading-7 text-muted-foreground">{f.desc}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
