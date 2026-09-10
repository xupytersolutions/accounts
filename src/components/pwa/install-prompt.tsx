"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStandalone(isStandalone());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(localStorage.getItem("pwa-install-dismissed") === "1");

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setDeferred(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  // Don't show if already installed or dismissed or no prompt available
  if (standalone || dismissed || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg md:bottom-6 md:left-auto md:right-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold">Install OneAccount</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add to your home screen for a faster, app-like experience.
          </p>
        </div>
        <button
          aria-label="Dismiss"
          onClick={handleDismiss}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="primary" onPress={handleInstall} className="flex-1">
          Install
        </Button>
        <Button size="sm" variant="tertiary" onPress={handleDismiss} className="flex-1">
          Not now
        </Button>
      </div>
    </div>
  );
}
