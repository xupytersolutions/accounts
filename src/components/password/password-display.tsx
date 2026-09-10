"use client";
import { Button } from "@heroui/react";
import { ClipboardDocumentIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

type Props = {
  password: string;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
};

export function PasswordDisplay({ password, copied, onCopy, onRegenerate }: Props) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-3">
      <span className="flex-1 min-w-0 break-all font-mono text-sm sm:text-base font-medium text-foreground select-all leading-tight">{password || "••••••••••••"}</span>
      <div className="relative shrink-0 flex items-center gap-1.5">
        {copied && <span className="absolute -top-8 right-0 z-10 text-xs font-medium bg-foreground text-background px-2 py-1 rounded-md shadow-sm pointer-events-none whitespace-nowrap">Copied</span>}
        <Button size="sm" variant="ghost" isIconOnly aria-label={copied ? "Copied" : "Copy password"} onPress={onCopy} className={`h-8 w-8 shrink-0 border ${copied ? "bg-success/10 border-success/20 text-success" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}</Button>
        <Button size="sm" variant="ghost" isIconOnly aria-label="Regenerate" onPress={onRegenerate} className="h-8 w-8 shrink-0 border border-border bg-card hover:bg-muted"><ArrowPathIcon className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
