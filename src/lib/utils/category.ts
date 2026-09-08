import type { Category, VaultEntry } from "@/lib/types";
import { CATEGORY_PRESETS, findPresetByName } from "@/lib/constants/category-presets";

export type DisplayCategory = {
  name: string;
  icon: string | null;
  color: string;
  logoUrl: string | null;
};

/**
 * Resolves the display category for an entry
 */
export function getDisplayCategory(
  entry: VaultEntry,
  allCategories: Category[]
): DisplayCategory | null {
  // Use linked category reference first
  if (entry.categoryRef) {
    const preset = findPresetByName(entry.categoryRef.name);
    return {
      name: entry.categoryRef.name,
      icon: entry.categoryRef.icon || preset?.icon || null,
      color: entry.categoryRef.color || preset?.color || "#006FEE",
      logoUrl: entry.categoryRef.logoUrl || preset?.logoUrl || null,
    };
  }

  // Fall back to legacy category string
  if (entry.category) {
    const preset = findPresetByName(entry.category);
    if (preset) {
      return {
        name: preset.label,
        icon: preset.icon,
        color: preset.color,
        logoUrl: preset.logoUrl,
      };
    }

    // Check existing categories
    const existing = allCategories.find(
      (c) => c.name.toLowerCase() === entry.category!.toLowerCase()
    );
    if (existing) {
      const existingPreset = findPresetByName(existing.name);
      return {
        name: existing.name,
        icon: existing.icon || existingPreset?.icon || null,
        color: existing.color || existingPreset?.color || "#006FEE",
        logoUrl: existing.logoUrl || existingPreset?.logoUrl || null,
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
 * Syncs category selection state with icon/color/logo
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

  // Check presets
  const preset = CATEGORY_PRESETS.find((p) => p.id === categoryKey);
  if (preset) {
    return {
      icon: preset.icon,
      color: preset.color,
      logoUrl: preset.logoUrl,
    };
  }

  // Check existing categories
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
