"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Handle updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent("pwa:update-available"));
            }
          });
        });

        // Check for update on load
        reg.update().catch(() => {});

        // Periodically check (every 60m)
        const interval = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
        return () => clearInterval(interval);
      } catch {
        // ignore
      }
    };

    register();

    const onOnline = () => navigator.serviceWorker.getRegistration().then((r) => r?.update());
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}
