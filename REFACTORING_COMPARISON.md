# Refactoring - Before & After Comparison

## Problem: 1099-Line Monster File

### ❌ Before (space-client.tsx)
```tsx
"use client";
// 40+ imports from various places
import { Card, Button, TextField, Input, ... } from "@heroui/react";
import { 20+ heroicons imports... } from "@heroicons/react/24/solid";

// Inline type definitions (duplicated elsewhere)
type Category = { id: string; name: string; icon: string | null; ... };
type Entry = { id: string; title: string | null; email: string; ... };
type Space = { id: string; name: string; type: string; ... };
type SpaceOpt = { id: string; name: string; type: string };

// Constants (duplicated in dashboard-client)
const CATEGORY_COLORS = ["#006FEE", "#17C964", ...];
const CATEGORY_ICON_OPTIONS = [ ... 80 lines ... ];
const CATEGORY_ICON_MAP = Object.fromEntries(...);
const ACCOUNT_CATEGORY_PRESETS = [ ... 60 lines ... ];

// Inline component (should be extracted)
function CategoryIcon({ icon, className }) { ... }

// Inline utility (duplicated elsewhere)
function getPresetLogoUrl(id: string) { ... }

// CSV utilities (200+ lines, duplicated)
function csvEscape(v: string) { ... }
function parseCsvLine(line: string, delim: string) { ... }
function detectDelim(sample: string) { ... }
function splitCsvRows(text: string) { ... }
function parseImportTxt(text: string) { ... 80 lines ... }

// Time utility (duplicated)
function timeAgo(d?: string | Date | null) { ... }

// Main component with 20+ useState hooks
export function SpaceClient({ ... }) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  // ... 20 more useState hooks ...
  
  // 100+ lines of useEffect hooks for modal management
  useEffect(() => { ... }, [isAddOpen, ...]);
  useEffect(() => { ... }, [entryCtx]);
  useEffect(() => { ... }, [editing]);
  // ... 10 more useEffect hooks ...
  
  // Selection logic (should be a hook)
  const toggleSelect = (id: string) => { ... };
  const selectAll = () => { ... };
  
  // Export logic (should be utility)
  const handleExport = () => { ... 20 lines ... };
  
  // Import logic (should be utility)
  const handleFile = async (f: File | null) => { ... 10 lines ... };
  
  // ... 500 more lines of inline logic ...
  
  return (
    <div>
      {/* 300+ lines of JSX */}
      {/* Massive inline modals */}
      {/* Repeated patterns */}
    </div>
  );
}
```

**Problems:**
- ❌ 1099 lines in one file
- ❌ Types duplicated in 3+ places
- ❌ Constants duplicated in 2+ places
- ❌ CSV utilities duplicated
- ❌ 20+ useState hooks
- ❌ 10+ useEffect hooks
- ❌ Inline components everywhere
- ❌ Can't reuse anything
- ❌ Hard to test
- ❌ Hard to find bugs
- ❌ Hard to add features

---

## ✅ After: Clean, Modular Architecture

### 1. Types (One Source of Truth)
```tsx
// src/lib/types/index.ts (50 lines)
export type Category = { ... };
export type VaultEntry = { ... };
export type Space = { ... };
export type SpaceWithEntries = { ... };
export type ImportRow = { ... };
```

### 2. Constants (Centralized)
```tsx
// src/lib/constants/icons.ts (48 lines)
export const ICON_OPTIONS: IconOption[] = [ ... ];
export const ICON_MAP: Record<string, React.ElementType> = { ... };
export const COLORS = ["#006FEE", ...];

// src/lib/constants/category-presets.ts (90 lines)
export const CATEGORY_PRESETS: CategoryPreset[] = [ ... ];
export function getPresetLogoUrl(id: string) { ... }
export function findPresetByName(name: string) { ... }
```

### 3. Utilities (Pure Functions)
```tsx
// src/lib/utils/csv.ts (170 lines)
export function csvEscape(value: string): string { ... }
export function parseCsvLine(line: string, delimiter: string): string[] { ... }
export function parseImportText(text: string): ImportRow[] { ... }

// src/lib/utils/time.ts (15 lines)
export function timeAgo(date?: string | Date | null): string { ... }

// src/lib/utils/category.ts (100 lines)
export function getDisplayCategory(entry, categories) { ... }
export function syncCategoryFields(categoryKey, categories) { ... }

// src/lib/utils/export.ts (35 lines)
export function exportEntriesToFile(entries, spaceName) { ... }
```

### 4. Custom Hooks (Reusable Logic)
```tsx
// src/lib/hooks/use-modal-lock.ts (25 lines)
export function useModalLock(isOpen: boolean, onClose: () => void) { ... }

// src/lib/hooks/use-outside-click.ts (30 lines)
export function useOutsideClick(isOpen: boolean, onClose: () => void, selector: string) { ... }

// src/lib/hooks/use-selection.ts (50 lines)
export function useSelection(totalCount: number, ids: string[]) {
  return { selected, toggle, toggleAll, clear, remove };
}
```

### 5. UI Components (Reusable)
```tsx
// src/components/ui/icon.tsx (20 lines)
export function Icon({ icon, className }: IconProps) { ... }

// src/components/ui/icon-picker.tsx (40 lines)
export function IconPicker({ value, onChange, label }: IconPickerProps) { ... }

// src/components/ui/color-picker.tsx (40 lines)
export function ColorPicker({ value, onChange, label }: ColorPickerProps) { ... }

// src/components/ui/category-select.tsx (120 lines)
export function CategorySelect({ ... }: CategorySelectProps) { ... }

// src/components/ui/confirm-dialog.tsx (70 lines)
export function ConfirmDialog({ ... }: ConfirmDialogProps) { ... }

// src/components/ui/context-menu.tsx (50 lines)
export function ContextMenu({ ... }: ContextMenuProps) { ... }
```

### 6. Feature Components
```tsx
// src/components/account/account-card.tsx (180 lines)
export function AccountCard({ entry, isSelected, ... }: AccountCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const displayCat = getDisplayCategory(entry, allCategories);
  
  return (
    <div className="p-2">
      <div className="bg-card border rounded-2xl p-4 ...">
        {/* Clean, focused card layout */}
      </div>
    </div>
  );
}
```

### 7. Main Component (Clean & Simple)
```tsx
// src/components/space-client.tsx (280 lines)
"use client";
import type { VaultEntry, Category } from "@/lib/types";
import { useSelection, useModalLock, useOutsideClick } from "@/lib/hooks";
import { parseImportText, exportEntriesToFile } from "@/lib/utils";
import { AccountCard } from "@/components/account/account-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContextMenu } from "@/components/ui/context-menu";

export function SpaceClient({ space, ... }: SpaceClientProps) {
  // Clean, focused state
  const { selected, toggle, toggleAll, clear } = useSelection(
    space.entries.length,
    space.entries.map((e) => e.id)
  );
  
  const [deleteTarget, setDeleteTarget] = useState<VaultEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Clean handlers
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteEntry(deleteTarget.id, space.id);
    setIsDeleting(false);
  };
  
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      {/* Main Card */}
      {/* Accounts List using AccountCard component */}
      
      <ContextMenu ... />
      <ConfirmDialog ... />
    </div>
  );
}
```

## Benefits Summary

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Lines in main file** | 1099 | 280 | ✅ 75% reduction |
| **Type definitions** | Duplicated 3x | Single source | ✅ DRY |
| **Constants** | Duplicated 2x | Centralized | ✅ DRY |
| **CSV utils** | Inline, 200 lines | Separate module | ✅ Testable |
| **Reusable components** | 0 | 6+ | ✅ Reusability |
| **Custom hooks** | 0 | 3 | ✅ Logic reuse |
| **Testability** | Hard | Easy | ✅ Unit testable |
| **Maintainability** | Low | High | ✅ Single responsibility |
| **Type safety** | Partial | Full | ✅ Centralized types |
| **Code duplication** | High | None | ✅ DRY principle |

## Migration Complete! 🎉

The refactored codebase is:
- ✅ **Cleaner** - Each file has one purpose
- ✅ **More maintainable** - Easy to find and fix bugs
- ✅ **More testable** - Pure functions and isolated hooks
- ✅ **More reusable** - Components work anywhere
- ✅ **Type-safe** - Shared types prevent errors
- ✅ **DRY** - No duplication anywhere
- ✅ **Scalable** - Easy to add new features
