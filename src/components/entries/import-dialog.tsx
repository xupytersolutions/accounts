"use client";
import { useRef } from "react";
import { Button, Input } from "@heroui/react";
import type { ImportRow } from "@/lib/types";

type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  rows: ImportRow[];
  onRowsChange: (rows: ImportRow[]) => void;
  fileName: string;
  onFile: (f: File | null) => void;
  error: string;
  onConfirm: () => void;
};

export function ImportDialog({ isOpen, onClose, rows, onRowsChange, fileName, onFile, error, onConfirm }: ImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;
  const updateRow = (uid: string, patch: Partial<ImportRow>) => onRowsChange(rows.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-5xl max-h-[90dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0"><div><h3 className="text-lg font-semibold text-foreground">Import accounts</h3><p className="text-xs text-muted-foreground">Upload txt (CSV or JSON), review, edit or remove rows, then import.</p></div><Button variant="ghost" isIconOnly size="sm" onPress={onClose} aria-label="Close">✕</Button></div>
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"><input ref={fileRef} type="file" accept=".txt,.csv,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} /><Button variant="tertiary" onPress={() => fileRef.current?.click()} className="shrink-0">Choose txt file</Button><span className="text-sm text-muted-foreground truncate">{fileName || "No file chosen"}</span><span className="ml-auto text-xs text-muted-foreground hidden sm:block">Supports: account;password &amp; title,email,password,url,description,category or JSON</span></div>
          {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
          {rows.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[820px]"><thead className="bg-muted/40 border-b border-border"><tr className="text-xs text-muted-foreground"><th className="text-left font-medium px-3 py-2 w-[140px]">Title</th><th className="text-left font-medium px-3 py-2">Login</th><th className="text-left font-medium px-3 py-2">Password</th><th className="text-left font-medium px-3 py-2">URL</th><th className="text-left font-medium px-3 py-2">Note</th><th className="text-left font-medium px-3 py-2 w-[120px]">Category</th><th className="px-3 py-2 w-12"></th></tr></thead>
                  <tbody className="divide-y divide-border">{rows.map((r) => (<tr key={r.uid} className="hover:bg-muted/20"><td className="px-2 py-1.5"><Input value={r.title} onChange={(e) => updateRow(r.uid, { title: (e.target as HTMLInputElement).value })} placeholder="Title" className="text-sm" /></td><td className="px-2 py-1.5"><Input value={r.email} onChange={(e) => updateRow(r.uid, { email: (e.target as HTMLInputElement).value })} placeholder="username" className="text-sm" /></td><td className="px-2 py-1.5"><Input value={r.password} onChange={(e) => updateRow(r.uid, { password: (e.target as HTMLInputElement).value })} placeholder="••••" className="text-sm" /></td><td className="px-2 py-1.5"><Input value={r.url} onChange={(e) => updateRow(r.uid, { url: (e.target as HTMLInputElement).value })} placeholder="https://" className="text-sm" /></td><td className="px-2 py-1.5"><Input value={r.description} onChange={(e) => updateRow(r.uid, { description: (e.target as HTMLInputElement).value })} placeholder="note" className="text-sm" /></td><td className="px-2 py-1.5"><Input value={r.category} onChange={(e) => updateRow(r.uid, { category: (e.target as HTMLInputElement).value })} placeholder="gmail" className="text-sm" /></td><td className="px-2 py-1.5"><Button size="sm" variant="tertiary" onPress={() => onRowsChange(rows.filter((x) => x.uid !== r.uid))} className="h-8">Remove</Button></td></tr>))}</tbody></table>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t border-border"><span className="text-xs text-muted-foreground">{rows.length} rows to import</span><Button size="sm" variant="tertiary" onPress={() => onRowsChange([])}>Clear all</Button></div>
            </div>
          )}
          {rows.length === 0 && !error && <p className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-8 text-center">Choose a txt file to preview. You can edit any cell or remove rows before importing.</p>}
        </div>
        <div className="flex gap-3 p-4 sm:p-6 border-t border-border shrink-0 bg-card"><Button variant="tertiary" className="flex-1" onPress={onClose}>Cancel</Button><Button variant="primary" className="flex-1" isDisabled={rows.length === 0} onPress={onConfirm}>Import {rows.length ? `(${rows.length})` : ""}</Button></div>
      </div>
    </div>
  );
}
