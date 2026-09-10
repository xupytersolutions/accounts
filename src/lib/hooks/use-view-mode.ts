import { useEffect, useState } from "react";
import type { ViewMode } from "@/lib/types";

export function useViewMode(storageKey: string, defaultMode: ViewMode = "comfortable") {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ViewMode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "compact" || stored === "comfortable") setViewMode(stored);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, viewMode);
  }, [storageKey, viewMode]);

  return [viewMode, setViewMode] as const;
}
