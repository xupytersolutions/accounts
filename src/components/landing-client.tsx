"use client";

import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import { SiteHeader } from "./site-header";
import { PasswordGenerator } from "./password-generator";
import { LandingFeatures } from "./landing-features";
import { LandingCtaFaq } from "./landing-cta-faq";
import { SiteFooter } from "./site-footer";
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
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-normal uppercase text-foreground">
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

              <div id="generator">
                <PasswordGenerator />
              </div>
            </div>
          </div>
        </section>

        <LandingFeatures />
        <LandingCtaFaq isLoggedIn={isLoggedIn} />
      </main>

      <SiteFooter />
    </div>
  );
}
