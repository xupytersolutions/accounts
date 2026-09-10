"use client";
import { Button } from "@heroui/react";
import { ExclamationTriangleIcon, ArchiveBoxIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border border-destructive/20 rounded-xl bg-destructive/5">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm text-center px-4">{message}</p>
      {onRetry && <Button variant="tertiary" onPress={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ icon: Icon = ArchiveBoxIcon, title, description, action }: { icon?: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-muted-foreground" /></div>
      <p className="text-base font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">{description}</p>
      {action}
    </div>
  );
}

export function FilterEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl bg-muted/20">
      <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-foreground mb-1">No matches</p>
      <p className="text-sm text-muted-foreground mb-4">Try adjusting search or filters.</p>
      <Button variant="tertiary" onPress={onClear}>Clear filters</Button>
    </div>
  );
}

export function InlineSpinner() {
  return <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
}
