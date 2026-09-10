"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

export function UpdateToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onUpdate = () => setShow(true);
    window.addEventListener("pwa:update-available", onUpdate);
    return () => window.removeEventListener("pwa:update-available", onUpdate);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg md:bottom-6">
      <p className="text-sm font-semibold">Update available</p>
      <p className="mt-0.5 text-xs text-muted-foreground">A new version is ready. Reload to update.</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="primary" onPress={() => window.location.reload()} className="flex-1">
          Reload
        </Button>
        <Button size="sm" variant="tertiary" onPress={() => setShow(false)} className="flex-1">
          Later
        </Button>
      </div>
    </div>
  );
}
