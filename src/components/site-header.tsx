"use client";

import Link from "next/link";
import { Chip } from "@heroui/react";
import { ThemeSwitcher } from "./theme-switcher";

type SiteHeaderProps = {
  logoHref?: string;
  actions?: React.ReactNode;
  showThemeSwitcher?: boolean;
};

export function SiteHeader({
  logoHref = "/",
  actions,
  showThemeSwitcher = true,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8 min-w-0">
          <Link href={logoHref} className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              V
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">Vaulta</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showThemeSwitcher && <ThemeSwitcher />}
          {actions}
        </div>
      </div>
    </header>
  );
}
