import type { Category, VaultEntry } from "@/lib/types";

export type DisplayCategory = {
  name: string;
  icon: string | null;
  color: string;
  logoUrl: string | null;
};

/**
 * Resolves the display category for an entry — DB only
 */
export function getDisplayCategory(
  entry: VaultEntry,
  allCategories: Category[]
): DisplayCategory | null {
  // Use linked category reference first
  if (entry.categoryRef) {
    return {
      name: entry.categoryRef.name,
      icon: entry.categoryRef.icon || null,
      color: entry.categoryRef.color || "#006FEE",
      logoUrl: entry.categoryRef.logoUrl || null,
    };
  }

  // Fall back to legacy category string
  if (entry.category) {
    // Check existing categories in DB
    const existing = allCategories.find(
      (c) => c.name.toLowerCase() === entry.category!.toLowerCase()
    );
    if (existing) {
      return {
        name: existing.name,
        icon: existing.icon || null,
        color: existing.color || "#006FEE",
        logoUrl: existing.logoUrl || null,
      };
    }

    // Legacy free-text category
    return {
      name: entry.category,
      icon: entry.icon,
      color: entry.color || "#006FEE",
      logoUrl: (entry as any).logoUrl || null,
    };
  }

  return null;
}

/**
 * Syncs category selection state with icon/color/logo — DB only
 */
export function syncCategoryFields(
  categoryKey: string,
  allCategories: Category[]
): {
  icon: string;
  color: string;
  logoUrl: string | null;
} {
  if (categoryKey === "none" || categoryKey === "custom") {
    return {
      icon: "",
      color: "#006FEE",
      logoUrl: null,
    };
  }

  // Check existing categories in DB
  const cat = allCategories.find((c) => c.id === categoryKey);
  if (cat) {
    return {
      icon: cat.icon || "",
      color: cat.color || "#006FEE",
      logoUrl: cat.logoUrl || null,
    };
  }

  return {
    icon: "",
    color: "#006FEE",
    logoUrl: null,
  };
}
