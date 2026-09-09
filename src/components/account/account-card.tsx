import { useState } from "react";
import { Button } from "@heroui/react";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Icon } from "@/components/ui/icon";
import type { VaultEntry, Category } from "@/lib/types";

type AccountCardProps = {
  entry: VaultEntry;
  isSelected: boolean;
  onToggleSelect: () => void;
  onMenuClick: (x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent) => void;
};

export function AccountCard({
  entry,
  isSelected,
  onToggleSelect,
  onMenuClick,
  onContextMenu,
}: AccountCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine display category — DB only
  const displayCat: Category | { name: string; icon: string | null; color: string | null; logoUrl: string | null } | null =
    entry.categoryRef ??
    (entry.category
      ? {
          name: entry.category,
          icon: entry.icon,
          color: entry.color,
          logoUrl: (entry as any).logoUrl ?? null,
        }
      : null);

  const catColor = displayCat?.color || "#006FEE";
  const catIcon = displayCat?.icon || null;
  const catLogo = (displayCat as any)?.logoUrl || null;

  return (
    <div className="p-2">
      <div
        className="bg-card border border-border rounded-2xl p-4 hover:bg-muted/20 transition-colors group relative"
        onContextMenu={onContextMenu}
      >
        {/* Header: Checkbox + Logo + Title/Email + Menu */}
        <div className="flex items-start gap-3 mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="mt-1 rounded border-border h-4 w-4 shrink-0"
          />
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-white overflow-hidden"
            style={{ backgroundColor: catColor }}
          >
            {catLogo ? (
              <img
                src={catLogo}
                alt={displayCat!.name}
                className="w-7 h-7 object-contain"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : catIcon ? (
              <Icon icon={catIcon} className="w-6 h-6 text-white" />
            ) : (
              <span className="text-white font-bold text-lg">
                {(entry.title ?? entry.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground mb-0.5 truncate">
              {entry.title ?? displayCat?.name ?? "Account"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {entry.email}
            </p>
          </div>
          <Button
            isIconOnly
            variant="tertiary"
            size="sm"
            aria-label="Account menu"
            className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 min-w-8"
            onPress={(ev) => {
              const target = (ev as any).currentTarget;
              const r = target.getBoundingClientRect();
              const x = Math.min(r.right - 160, window.innerWidth - 180);
              const y = r.bottom + 8;
              onMenuClick(x, y);
            }}
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* URL Row */}
        {entry.url && (
          <div className="flex items-center gap-2 mb-3 ml-0 sm:ml-16">
            <svg
              className="w-4 h-4 text-primary shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate flex-1 min-w-0"
            >
              {entry.url}
            </a>
            <svg
              className="w-4 h-4 text-muted-foreground shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        )}

        {/* Password Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 ml-0 sm:ml-16">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <svg
              className="w-4 h-4 text-muted-foreground shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-muted/30">
              <code className="font-mono text-sm text-foreground tracking-wide break-all">
                {showPassword ? entry.password : "••••••••••"}
              </code>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 ml-0 sm:ml-0">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted text-foreground text-sm transition-colors min-w-[80px]"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Show</span>
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(entry.password)}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-sm transition-colors whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Note Section */}
        <div className="ml-0 sm:ml-16 pt-2 border-t border-border">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Note
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                {entry.description?.trim() || "no description"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
