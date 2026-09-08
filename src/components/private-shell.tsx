"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Dropdown, Input, TextField, Label } from "@heroui/react";
import { ThemeSwitcher } from "./theme-switcher";
import { useState, useTransition, useEffect } from "react";
import { updateProfile } from "@/lib/actions";

export function PrivateShell({ children, user, signOutAction }: { children: React.ReactNode; user: { email?: string | null; name?: string | null; image?: string | null }; signOutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSpacesActive = pathname === "/dashboard" || pathname?.startsWith("/spaces");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [accountName, setAccountName] = useState(user.name ?? "");
  const [accountImage, setAccountImage] = useState(user.image ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAccountOpen) {
      setAccountName(user.name ?? "");
      setAccountImage(user.image ?? "");
      setError(null);
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsAccountOpen(false); };
      window.addEventListener("keydown", onKey);
      return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
    }
  }, [isAccountOpen, user.name, user.image]);

  const handleAction = (key: React.Key) => {
    if (key === "account") setIsAccountOpen(true);
    if (key === "logout") {
      startTransition(() => {
        // signOutAction redirects via Next.js — do not catch, let Next handle NEXT_REDIRECT
        void signOutAction();
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    // ensure we send trimmed values from controlled state (TextField/Input may not sync)
    fd.set("name", accountName.trim());
    fd.set("image", accountImage.trim());
    startTransition(async () => {
      try {
        await updateProfile(fd);
        setIsAccountOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile");
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold">V</div>
                <span className="text-base font-semibold text-foreground">Vaulta</span>
              </Link>
              <nav className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={isSpacesActive ? "text-foreground font-medium" : "text-muted-foreground font-medium"}
                  >
                    Spaces
                  </Button>
                </Link>
                <Link href="/">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground font-medium"
                  >
                    Public site
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <Dropdown>
                <Button
                  variant="ghost"
                  aria-label="User menu"
                  className="flex items-center gap-2 h-auto py-1 px-2 rounded-lg hover:bg-muted data-[hovered]:bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium overflow-hidden shrink-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name || user.email || "User"} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (user.name ?? user.email ?? "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground leading-none">{user.name ?? "User"}</span>
                    <span className="text-xs text-muted-foreground leading-none">{user.email}</span>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl min-w-[220px]">
                <Dropdown.Menu aria-label="User menu" className="p-1" onAction={handleAction}>
                  <Dropdown.Item id="account-header" textValue="Profile" isDisabled className="h-14 gap-2 rounded-lg opacity-100 cursor-default data-[focused]:bg-transparent">
                    <p className="font-semibold text-foreground">{user.name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </Dropdown.Item>
                  <Dropdown.Item id="account" textValue="Account" className="rounded-lg text-foreground data-[focused]:bg-muted data-[focused]:text-foreground">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Account</span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item id="logout" textValue="Sign out" className="rounded-lg text-destructive data-[focused]:bg-destructive/10 data-[focused]:text-destructive">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign out</span>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>

      {isAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={() => setIsAccountOpen(false)} role="dialog" aria-modal="true" aria-label="Edit account">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-border p-6 shrink-0">
              <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center overflow-hidden shrink-0">
                {accountImage ? (
                  <img src={accountImage} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                ) : (
                  <span className="font-semibold">{(accountName || user.email || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">Account</h3>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => setIsAccountOpen(false)} aria-label="Close" className="shrink-0 -mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
                {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}

                <TextField name="name" className="w-full" value={accountName} onChange={setAccountName}>
                  <Label className="text-sm font-medium text-foreground mb-2">Name</Label>
                  <Input placeholder="Your name" className="h-10" />
                </TextField>

                <TextField name="image" className="w-full" value={accountImage} onChange={setAccountImage}>
                  <Label className="text-sm font-medium text-foreground mb-2">Avatar image URL</Label>
                  <Input placeholder="https://..." className="h-10" />
                </TextField>

                <TextField isDisabled className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Email</Label>
                  <Input value={user.email ?? ""} className="h-10 bg-muted" aria-label="Email" />
                </TextField>
                <p className="text-xs text-muted-foreground -mt-2">Email is managed by your provider.</p>
              </div>

              <div className="flex gap-3 p-6 pt-4 border-t border-border shrink-0 bg-card">
                <Button variant="tertiary" type="button" onPress={() => setIsAccountOpen(false)} className="flex-1 h-10" isDisabled={isPending}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="flex-1 h-10 font-medium" isDisabled={isPending}>
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
