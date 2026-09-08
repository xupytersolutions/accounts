# Refactoring Guide - Using the New Structure

## 📦 Import Patterns

### ✅ Good - Use Barrel Exports
```tsx
// Import types
import type { VaultEntry, Category, Space } from "@/lib/types";

// Import hooks
import { useSelection, useModalLock } from "@/lib/hooks";

// Import utilities
import { timeAgo, parseImportText, exportEntriesToFile } from "@/lib/utils";

// Import constants
import { ICON_OPTIONS, COLORS, CATEGORY_PRESETS } from "@/lib";

// Import components
import { AccountCard } from "@/components/account/account-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
```

### ❌ Bad - Direct Deep Imports
```tsx
// Don't do this
import { VaultEntry } from "@/lib/types/index";
import { useSelection } from "@/lib/hooks/use-selection";
import { parseImportText } from "@/lib/utils/csv";
```

## 🎯 Usage Examples

### 1. Using Selection Hook
```tsx
import { useSelection } from "@/lib/hooks";

function MyComponent({ items }: { items: Item[] }) {
  const { selected, toggle, toggleAll, clear } = useSelection(
    items.length,
    items.map(i => i.id)
  );
  
  return (
    <>
      <button onClick={toggleAll}>Select All</button>
      {items.map(item => (
        <Checkbox
          key={item.id}
          checked={selected.has(item.id)}
          onChange={() => toggle(item.id)}
        />
      ))}
      <p>{selected.size} selected</p>
    </>
  );
}
```

### 2. Using Modal Lock Hook
```tsx
import { useModalLock } from "@/lib/hooks";

function MyModal({ isOpen, onClose }: ModalProps) {
  // Automatically locks body scroll and handles Escape key
  useModalLock(isOpen, onClose);
  
  if (!isOpen) return null;
  
  return <div className="modal">...</div>;
}
```

### 3. Using Outside Click Hook
```tsx
import { useOutsideClick } from "@/lib/hooks";

function MyDropdown({ isOpen, onClose }: DropdownProps) {
  // Closes when clicking outside the dropdown
  useOutsideClick(isOpen, onClose, "[data-dropdown]");
  
  if (!isOpen) return null;
  
  return <div data-dropdown>...</div>;
}
```

### 4. Using CSV Utilities
```tsx
import { parseImportText, csvEscape } from "@/lib/utils";

function ImportModal() {
  const handleImport = async (file: File) => {
    const text = await file.text();
    const rows = parseImportText(text); // Handles both CSV and JSON
    
    // rows is typed as ImportRow[]
    rows.forEach(row => {
      console.log(row.email, row.password);
    });
  };
  
  const handleExport = (data: any[]) => {
    const csv = data.map(row => 
      [row.name, row.email].map(csvEscape).join(",")
    ).join("\n");
    
    // Download CSV
  };
}
```

### 5. Using Icon Component
```tsx
import { Icon } from "@/components/ui/icon";
import { ICON_OPTIONS } from "@/lib";

function MyComponent() {
  return (
    <div>
      {/* Renders the icon component if icon exists */}
      <Icon icon="FolderIcon" className="w-6 h-6 text-blue-500" />
      
      {/* Returns null if icon doesn't exist */}
      <Icon icon={null} />
      
      {/* All available icons */}
      {ICON_OPTIONS.map(opt => (
        <Icon key={opt.id} icon={opt.id} />
      ))}
    </div>
  );
}
```

### 6. Using IconPicker Component
```tsx
import { IconPicker } from "@/components/ui/icon-picker";

function CreateSpaceForm() {
  const [icon, setIcon] = useState("");
  
  return (
    <form>
      <IconPicker
        value={icon}
        onChange={setIcon}
        label="Choose Icon"
      />
    </form>
  );
}
```

### 7. Using ColorPicker Component
```tsx
import { ColorPicker } from "@/components/ui/color-picker";
import { COLORS } from "@/lib";

function CreateSpaceForm() {
  const [color, setColor] = useState(COLORS[0]);
  
  return (
    <form>
      <ColorPicker
        value={color}
        onChange={setColor}
        label="Choose Color"
      />
    </form>
  );
}
```

### 8. Using CategorySelect Component
```tsx
import { CategorySelect } from "@/components/ui/category-select";
import type { Category } from "@/lib/types";

function CreateAccountForm({ categories }: { categories: Category[] }) {
  const [catKey, setCatKey] = useState("none");
  const [customName, setCustomName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#006FEE");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  return (
    <form>
      <CategorySelect
        value={catKey}
        onChange={setCatKey}
        categories={categories}
        customName={customName}
        onCustomNameChange={setCustomName}
        icon={icon}
        onIconChange={setIcon}
        color={color}
        onColorChange={setColor}
        logoUrl={logoUrl}
      />
    </form>
  );
}
```

### 9. Using ConfirmDialog Component
```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteItem();
    setIsDeleting(false);
    setShowDialog(false);
  };
  
  return (
    <>
      <button onClick={() => setShowDialog(true)}>Delete</button>
      
      <ConfirmDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleDelete}
        title="Delete item?"
        description="This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
```

### 10. Using ContextMenu Component
```tsx
import { ContextMenu } from "@/components/ui/context-menu";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

function MyComponent() {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  
  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
      >
        Right-click me
      </div>
      
      {menuPos && (
        <ContextMenu
          isOpen={!!menuPos}
          onClose={() => setMenuPos(null)}
          x={menuPos.x}
          y={menuPos.y}
          items={[
            {
              id: "edit",
              label: "Edit",
              icon: <PencilIcon className="w-4 h-4" />,
              onClick: () => console.log("Edit"),
            },
            {
              id: "delete",
              label: "Delete",
              icon: <TrashIcon className="w-4 h-4" />,
              variant: "danger",
              onClick: () => console.log("Delete"),
            },
          ]}
        />
      )}
    </>
  );
}
```

### 11. Using AccountCard Component
```tsx
import { AccountCard } from "@/components/account/account-card";
import type { VaultEntry } from "@/lib/types";

function AccountList({ entries }: { entries: VaultEntry[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  return (
    <div className="space-y-2">
      {entries.map(entry => (
        <AccountCard
          key={entry.id}
          entry={entry}
          isSelected={selected.has(entry.id)}
          onToggleSelect={() => {
            const next = new Set(selected);
            if (next.has(entry.id)) {
              next.delete(entry.id);
            } else {
              next.add(entry.id);
            }
            setSelected(next);
          }}
          onMenuClick={(x, y) => {
            // Show context menu at x, y
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            // Show context menu
          }}
        />
      ))}
    </div>
  );
}
```

### 12. Using Category Utilities
```tsx
import { getDisplayCategory, syncCategoryFields } from "@/lib/utils";
import type { VaultEntry, Category } from "@/lib/types";

function MyComponent({ entry, categories }: { entry: VaultEntry; categories: Category[] }) {
  // Get the resolved display category
  const displayCat = getDisplayCategory(entry, categories);
  
  if (displayCat) {
    console.log(displayCat.name);    // "Gmail"
    console.log(displayCat.color);   // "#EA4335"
    console.log(displayCat.logoUrl); // "https://..."
  }
  
  // Sync fields when category changes
  const fields = syncCategoryFields("gmail", categories);
  console.log(fields.icon);    // "CubeIcon"
  console.log(fields.color);   // "#EA4335"
  console.log(fields.logoUrl); // "https://..."
}
```

### 13. Using Time Utility
```tsx
import { timeAgo } from "@/lib/utils";

function MyComponent({ updatedAt }: { updatedAt: string | Date }) {
  return <span>{timeAgo(updatedAt)}</span>; // "2h ago", "just now", etc.
}
```

### 14. Using Export Utility
```tsx
import { exportEntriesToFile } from "@/lib/utils";
import type { VaultEntry } from "@/lib/types";

function ExportButton({ entries, spaceName }: { entries: VaultEntry[]; spaceName: string }) {
  const handleExport = () => {
    exportEntriesToFile(entries, spaceName);
    // Automatically downloads a CSV file
  };
  
  return <button onClick={handleExport}>Export</button>;
}
```

## 🎨 Component Composition Examples

### Complex Form with Multiple Components
```tsx
import { IconPicker } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";
import { CategorySelect } from "@/components/ui/category-select";
import { COLORS } from "@/lib";
import type { Category } from "@/lib/types";

function CreateAccountModal({ categories }: { categories: Category[] }) {
  const [catKey, setCatKey] = useState("none");
  const [customName, setCustomName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  return (
    <form>
      <TextField>
        <Label>Title</Label>
        <Input placeholder="Account title" />
      </TextField>
      
      <TextField>
        <Label>Email</Label>
        <Input type="email" />
      </TextField>
      
      <TextField>
        <Label>Password</Label>
        <Input type="password" />
      </TextField>
      
      <CategorySelect
        value={catKey}
        onChange={setCatKey}
        categories={categories}
        customName={customName}
        onCustomNameChange={setCustomName}
        icon={icon}
        onIconChange={setIcon}
        color={color}
        onColorChange={setColor}
        logoUrl={logoUrl}
      />
      
      <Button type="submit">Create Account</Button>
    </form>
  );
}
```

## 📝 TypeScript Tips

### Type Imports
```tsx
// Always use 'type' keyword for type-only imports
import type { VaultEntry, Category } from "@/lib/types";

// Not
import { VaultEntry, Category } from "@/lib/types";
```

### Component Props
```tsx
// Always define explicit prop types
type MyComponentProps = {
  entries: VaultEntry[];
  onSelect: (id: string) => void;
};

export function MyComponent({ entries, onSelect }: MyComponentProps) {
  // ...
}
```

## 🧪 Testing Examples

### Testing Utilities
```tsx
import { timeAgo, parseImportText, csvEscape } from "@/lib/utils";

describe("timeAgo", () => {
  it("should return 'just now' for recent dates", () => {
    const now = new Date();
    expect(timeAgo(now)).toBe("just now");
  });
});

describe("csvEscape", () => {
  it("should escape quotes", () => {
    expect(csvEscape('He said "hello"')).toBe('"He said ""hello"""');
  });
});
```

### Testing Hooks
```tsx
import { renderHook, act } from "@testing-library/react";
import { useSelection } from "@/lib/hooks";

describe("useSelection", () => {
  it("should toggle selection", () => {
    const { result } = renderHook(() => 
      useSelection(3, ["a", "b", "c"])
    );
    
    act(() => {
      result.current.toggle("a");
    });
    
    expect(result.current.selected.has("a")).toBe(true);
  });
});
```

## 🚀 Migration Checklist

- [ ] Review `REFACTORING_SUMMARY.md`
- [ ] Review `REFACTORING_COMPARISON.md`
- [ ] Test new components locally
- [ ] Replace old space-client.tsx with refactored version
- [ ] Apply same pattern to dashboard-client.tsx
- [ ] Update imports across the codebase
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Run build: `pnpm build`
- [ ] Test all features manually
- [ ] Write unit tests for new utilities
- [ ] Remove old duplicate code

## 📚 Further Reading

- See `REFACTORING_SUMMARY.md` for high-level overview
- See `REFACTORING_COMPARISON.md` for before/after comparison
- Check individual files for inline documentation
