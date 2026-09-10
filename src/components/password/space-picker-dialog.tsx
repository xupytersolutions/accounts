"use client";
import { Button } from "@heroui/react";
import { XMarkIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type SpaceOpt = { id: string; name: string; type: string; color?: string | null };
type Props = {
  isOpen: boolean;
  onClose: () => void;
  spaces: SpaceOpt[];
  loading: boolean;
  error: string | null;
  password: string;
  onSelect: (id: string) => void;
};

export function SpacePickerDialog({ isOpen, onClose, spaces, loading, error, password, onSelect }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md max-h-[80dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0"><div><h3 className="text-base font-semibold text-foreground">Save to space</h3><p className="text-xs text-muted-foreground">Select a space — we&apos;ll open the account form with your password ready.</p></div><Button variant="ghost" isIconOnly size="sm" onPress={onClose} aria-label="Close" className="shrink-0 -mr-1"><XMarkIcon className="w-5 h-5" /></Button></div>
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {loading ? <p className="text-sm text-muted-foreground p-4 text-center">Loading spaces…</p> : error ? <p className="text-sm text-destructive p-4 text-center">{error}</p> : spaces.length === 0 ? <div className="p-4 text-center space-y-3"><p className="text-sm text-muted-foreground">No spaces yet. Create one from your dashboard.</p><Link href="/dashboard"><Button variant="primary" className="w-full">Go to dashboard</Button></Link></div> : spaces.map((s) => (
            <button key={s.id} onClick={() => onSelect(s.id)} className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: s.color || "#006FEE" }}>{s.name.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{s.name}</p><p className="text-xs text-muted-foreground capitalize">{s.type}</p></div>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border bg-card shrink-0"><p className="text-xs text-muted-foreground truncate font-mono">Password: {password}</p></div>
      </div>
    </div>
  );
}
