import { useMemo } from "react";
import type { Space } from "@/lib/types";

export function useSpaceFilters(
  spaces: Space[],
  search: string,
  typeFilter: string,
  sortBy: string
) {
  const filtered = useMemo(() => {
    return spaces
      .filter((s) => {
        if (typeFilter !== "all" && s.type !== typeFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "entries") return b._count.entries - a._count.entries;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [spaces, search, typeFilter, sortBy]);

  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (sortBy !== "updated" ? 1 : 0);

  return { filteredSpaces: filtered, activeFilterCount };
}
