import { useMemo } from "react";
import type { VaultEntry, Category } from "@/lib/types";

export function useEntryFilters(
  entries: VaultEntry[],
  search: string,
  categoryFilter: string,
  sortBy: string
) {
  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (categoryFilter !== "all") {
          if (categoryFilter === "none") {
            const hasCat = (e as unknown as { categoryRef?: Category | null }).categoryRef || e.category;
            return !hasCat;
          }
          const catId = (e as unknown as { categoryRef?: Category | null }).categoryRef?.id ?? "";
          const catName = (e as unknown as { categoryRef?: Category | null }).categoryRef?.name?.toLowerCase() ?? e.category?.toLowerCase() ?? "";
          if (catId === categoryFilter) return true;
          if (catName === categoryFilter.toLowerCase()) return true;
          return false;
        }
        return true;
      })
      .filter((e) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const catName = (e as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? e.category ?? "";
        return (
          (e.title ?? "").toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q) ||
          (e.url ?? "").toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") return (a.title ?? a.email).localeCompare(b.title ?? b.email);
        if (sortBy === "email") return a.email.localeCompare(b.email);
        if (sortBy === "category") {
          const ca = (a as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? a.category ?? "";
          const cb = (b as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? b.category ?? "";
          return ca.localeCompare(cb);
        }
        const da = a.updatedAt ? new Date(a.updatedAt as unknown as string).getTime() : 0;
        const db = b.updatedAt ? new Date(b.updatedAt as unknown as string).getTime() : 0;
        return db - da;
      });
  }, [entries, search, categoryFilter, sortBy]);

  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (sortBy !== "updated" ? 1 : 0);
  return { filteredEntries: filtered, activeFilterCount };
}
