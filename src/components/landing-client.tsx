"use client";

import Link from "next/link";
import { Button, Card, Chip, Separator } from "@heroui/react";
import { ThemeSwitcher } from "./theme-switcher";

export function LandingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">V</div>
            <span className="font-semibold text-lg tracking-tight text-foreground">Vaulta</span>
            <Chip size="sm" variant="soft" className="ml-2 hidden sm:inline-flex bg-primary/10 text-primary border border-primary/20">
              beta
            </Chip>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <span className="opacity-60">Password generator — soon</span>
            <span className="opacity-60">Blogs — soon</span>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">Go to dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">Sign in with Google</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 relative">
            <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="flex flex-col gap-8">
                <Chip className="w-fit bg-primary/10 text-primary border border-primary/20">
                  🔐 Google-only login • No passwords to remember
                </Chip>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight text-foreground">
                  All your accounts,
                  <br />
                  <span className="text-primary">neatly organized</span>
                </h1>
                <p className="max-w-xl text-xl leading-8 text-muted-foreground">
                  Create spaces for personal, company and clients. Store account email, password and notes in a clean vault. Private by default, public pages for tools and guides coming soon.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-base px-8">Start with Google →</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="border-border hover:bg-muted text-base px-8">Open vault</Button>
                  </Link>
                </div>
                <div className="flex items-center gap-3 pt-4 text-sm text-muted-foreground">
                  <span>Prisma + Postgres</span>
                  <Separator orientation="vertical" className="h-4 bg-border" />
                  <span>NextAuth</span>
                  <Separator orientation="vertical" className="h-4 bg-border" />
                  <span>HeroUI</span>
                </div>
              </div>

              <Card className="border border-border bg-card shadow-sm">
                <Card.Content className="gap-5 p-7">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-lg text-foreground">Your spaces</p>
                    <Chip size="sm" className="bg-muted text-muted-foreground border border-border">
                      3 types
                    </Chip>
                  </div>
                  <div className="grid gap-3">
                    {[
                      { name: "Personal", type: "personal", count: "· private", color: "bg-blue-500" },
                      { name: "Acme Company", type: "company", count: "· team", color: "bg-emerald-500" },
                      { name: "Client — Studio", type: "client", count: "· external", color: "bg-amber-500" },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-5 py-4 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{s.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.type} {s.count}
                            </p>
                          </div>
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">→</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="bg-border" />
                  <div className="rounded-xl bg-muted border border-border px-5 py-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Inside a space</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">email · password · description — encrypted at rest (soon)</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip size="sm" className="bg-card text-muted-foreground border border-border">
                        account@email.com
                      </Chip>
                      <Chip size="sm" className="bg-card text-muted-foreground border border-border">
                        ••••••••
                      </Chip>
                    </div>
                  </div>
                </Card.Content>
              </Card>
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

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-card">
        <p>Vaulta • Built with Next.js, HeroUI, Prisma & NextAuth (Google)</p>
      </footer>
    </div>
  );
}
