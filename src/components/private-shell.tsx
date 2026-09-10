"use client";

import { useRouter } from "next/navigation";
import { Button, Dropdown } from "@heroui/react";
import { Header } from "./header";
import { useState, useTransition, useEffect } from "react";
import { updateProfile } from "@/lib/actions";
import { ChevronDownIcon, UserIcon, ArrowRightStartOnRectangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { timeAgo } from "@/lib/utils/time";
import { AccountForm } from "./account/account-form";
import { useMe } from "@/lib/query/use-me";

export function PrivateShell({
  children,
  user,
  signOutAction,
}: {
  children: React.ReactNode;
  user: { email?: string | null; name?: string | null; image?: string | null };
  signOutAction: () => Promise<void>;
}) {
  const { data: me } = useMe();
  const createdAt = me?.createdAt ?? null;
  const router = useRouter();
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
      <Header
        logoHref="/dashboard"
        actions={
          <Dropdown>
            <Button
              variant="ghost"
              aria-label="User menu"
              className="flex items-center gap-2 h-auto py-1 px-2 rounded-xl hover:bg-muted data-[hovered]:bg-muted max-w-[200px] sm:max-w-[240px]"
            >
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium overflow-hidden shrink-0">
                {user.image ? (
                  <img src={user.image} alt={user.name || user.email || "User"} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (user.name ?? user.email ?? "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left min-w-0 max-w-[140px]">
                <span className="text-sm font-medium text-foreground leading-none truncate w-full block">{user.name ?? "User"}</span>
                <span className="text-xs text-muted-foreground leading-none truncate w-full block">{user.email}</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl p-0 min-w-[260px] max-w-[320px]">
              <Dropdown.Menu aria-label="User menu" onAction={handleAction} className="p-0 pb-3">
                <Dropdown.Item
                  id="account-header"
                  textValue="Profile"
                  isDisabled
                  className="rounded-none mb-2 opacity-100 cursor-default bg-muted py-3 border-b " 
                >
                  <div className="flex flex-col gap-0.5 min-w-0 max-w-[260px]">
                    <p className="font-semibold text-foreground truncate text-sm leading-tight">{user.name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
                    {createdAt && (
                      <p className="text-[11px] text-muted-foreground/80 leading-none pt-1">Joined {timeAgo(createdAt)}</p>
                    )}
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  id="account"
                  textValue="Account"
                  className="rounded-lg text-foreground mx-2 w-auto data-[focused]:bg-muted data-[focused]:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Account</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  id="logout"
                  textValue="Sign out"
                  className="rounded-lg text-destructive mx-2 w-auto data-[focused]:bg-destructive/10 data-[focused]:text-destructive"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                    <span>Sign out</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        }
      />
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
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>

            <AccountForm valueName={accountName} valueImage={accountImage} onNameChange={setAccountName} onImageChange={setAccountImage} email={user.email ?? ""} error={error} isPending={isPending} onSubmit={handleUpdateProfile} showCancel onCancel={() => setIsAccountOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
