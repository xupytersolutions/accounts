# PageHeader Component Usage Guide

The `PageHeader` component provides a consistent, responsive header for all pages with breadcrumbs, title, description, badge, and action button support.

## Features

✅ **Responsive** - Mobile-first design with proper truncation  
✅ **Breadcrumbs** - With back navigation and proper spacing  
✅ **Badge** - Category/type chips with color variants  
✅ **Action Button** - Right-aligned CTA  
✅ **Flexible** - Works with or without title/breadcrumbs  

## Props

```typescript
type PageHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];  // Optional breadcrumb navigation
  title?: string;                   // Main page title
  description?: string;             // Subtitle/description
  badge?: {                         // Category badge
    label: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
  };
  action?: React.ReactNode;         // Action button (right side)
};
```

## Usage Examples

### 1. Dashboard Page (Title + Description + Action)

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/solid";

function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Spaces"
        description="Organize your credentials by personal, company or clients."
        action={
          <Button
            onPress={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Space</span>
          </Button>
        }
      />
      
      {/* Page content */}
    </div>
  );
}
```

**Result:**
- Title: "Spaces" (large, bold)
- Description below title
- "+ Space" button on the right
- Responsive: button moves below on mobile

---

### 2. Space Detail Page (Breadcrumbs + Badge)

```tsx
import { PageHeader } from "@/components/ui/page-header";

function SpaceDetailPage({ space }: { space: Space }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        breadcrumbs={[
          { label: "Spaces", href: "/dashboard" },
          { label: space.name },
        ]}
        badge={{ label: space.type }}
      />
      
      {/* Page content */}
    </div>
  );
}
```

**Result:**
- ← Spaces / WorkspaceName with "personal" badge
- Back arrow on first breadcrumb
- Last breadcrumb is bold
- Badge appears after breadcrumbs

---

### 3. Account Page (Breadcrumbs + Badge + Action)

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@heroui/react";

function AccountPage({ space, account }: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        breadcrumbs={[
          { label: "Spaces", href: "/dashboard" },
          { label: space.name, href: `/spaces/${space.id}` },
          { label: account.title || account.email },
        ]}
        badge={{ label: account.category || "uncategorized", variant: "primary" }}
        action={
          <Button variant="tertiary">
            Edit Account
          </Button>
        }
      />
      
      {/* Page content */}
    </div>
  );
}
```

**Result:**
- ← Spaces / MySpace / Gmail with blue "gmail" badge
- Edit button on the right
- All truncates properly on mobile

---

### 4. Settings Page (Title + Badge)

```tsx
import { PageHeader } from "@/components/ui/page-header";

function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and security."
        badge={{ label: "Beta", variant: "warning" }}
      />
      
      {/* Settings form */}
    </div>
  );
}
```

**Result:**
- "Settings" title with yellow "Beta" badge next to it
- Description below

---

### 5. Error Page (Title Only)

```tsx
import { PageHeader } from "@/components/ui/page-header";

function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
      />
      
      {/* Error content */}
    </div>
  );
}
```

---

## Badge Variants

```tsx
// Default (gray)
<PageHeader badge={{ label: "Draft" }} />

// Primary (blue)
<PageHeader badge={{ label: "Active", variant: "primary" }} />

// Success (green)
<PageHeader badge={{ label: "Verified", variant: "success" }} />

// Warning (yellow/orange)
<PageHeader badge={{ label: "Beta", variant: "warning" }} />

// Danger (red)
<PageHeader badge={{ label: "Deprecated", variant: "danger" }} />
```

## Responsive Behavior

### Desktop (≥640px)
```
┌─────────────────────────────────────────────────┐
│ ← Spaces / MySpace    [personal]                │
│                                                  │
│ Title Text Here                    [+ Action]   │
│ Description text below title                    │
└─────────────────────────────────────────────────┘
```

### Mobile (<640px)
```
┌──────────────────────────┐
│ ← Spaces / MySpace…      │
│ [personal]               │
│                          │
│ Title Text               │
│ Description              │
│ [+ Action Button]        │
└──────────────────────────┘
```

## Key Features

### 1. Breadcrumb Navigation
- First item shows back arrow (←)
- Last item is bold and truncates
- Clickable items are hover-able
- Separator is "/" with proper spacing

### 2. Mobile Truncation
- Breadcrumbs truncate at `max-w-[50vw]` on mobile
- Full width on desktop (`sm:max-w-none`)
- Text overflow with ellipsis (…)

### 3. Flexible Layout
- Title + Action: Side by side on desktop, stacked on mobile
- Breadcrumbs always stack vertically if needed
- Badge placement: After breadcrumbs or next to title

### 4. Proper Spacing
- Consistent `mb-6 sm:mb-8` bottom margin
- Internal spacing handled by component
- No need for extra wrappers

## Common Patterns

### Pattern 1: List Page
```tsx
<PageHeader
  title="Resources"
  description="Manage your resources"
  action={<Button>+ Create</Button>}
/>
```

### Pattern 2: Detail Page
```tsx
<PageHeader
  breadcrumbs={[
    { label: "List", href: "/list" },
    { label: item.name },
  ]}
  badge={{ label: item.status }}
  action={<Button>Edit</Button>}
/>
```

### Pattern 3: Nested Detail
```tsx
<PageHeader
  breadcrumbs={[
    { label: "Level 1", href: "/l1" },
    { label: "Level 2", href: "/l1/l2" },
    { label: "Level 3" },
  ]}
  badge={{ label: "Active", variant: "success" }}
/>
```

## Integration with Existing Pages

### Before (Manual Header)
```tsx
// 15-20 lines of header code in every page
<div className="mb-6 sm:mb-8 flex flex-col sm:flex-row...">
  <div className="min-w-0">
    <h1 className="text-2xl sm:text-3xl...">Title</h1>
    <p className="text-sm sm:text-base...">Description</p>
  </div>
  <Button>Action</Button>
</div>
```

### After (PageHeader Component)
```tsx
// 1-8 lines, consistent, tested
<PageHeader
  title="Title"
  description="Description"
  action={<Button>Action</Button>}
/>
```

## TypeScript Support

Fully typed with IntelliSense support:
- Required vs optional props enforced
- Badge variant autocomplete
- Breadcrumb structure validated

## Accessibility

- Semantic HTML (`<h1>`, `<nav>`)
- Proper link hierarchy
- Mobile-friendly touch targets
- Keyboard navigation support

## Summary

The `PageHeader` component provides:
- ✅ Consistent headers across all pages
- ✅ Responsive design built-in
- ✅ Flexible API for different page types
- ✅ Zero duplication
- ✅ Type-safe
- ✅ Accessible

Use it on every page for a professional, consistent UI! 🎉
