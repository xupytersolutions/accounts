"use client";
import { Button, Select, ListBox, Label } from "@heroui/react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

type TransferDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: () => void;
  spaces: { id: string; name: string; type: string }[];
  currentSpaceId: string;
  target: string;
  onTargetChange: (v: string) => void;
  isTransferring: boolean;
  count: number;
};

export function TransferDialog({ isOpen, onClose, onTransfer, spaces, currentSpaceId, target, onTargetChange, isTransferring, count }: TransferDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md p-4 sm:p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><ArrowsRightLeftIcon className="w-5 h-5 text-primary" /></div><div><h3 className="text-lg font-semibold text-foreground">Transfer {count} account(s)</h3><p className="text-sm text-muted-foreground">Choose a target space</p></div></div>
        <Select selectedKey={target} onSelectionChange={(k) => onTargetChange(String(k))} className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Target space</Label><Select.Trigger><Select.Value /></Select.Trigger><Select.Popover className="bg-popover border border-border shadow-sm"><ListBox className="p-1">{spaces.filter((s) => s.id !== currentSpaceId).map((s) => (<ListBox.Item key={s.id} id={s.id}>{s.name} — {s.type}</ListBox.Item>))}</ListBox></Select.Popover></Select>
        <div className="flex gap-3 pt-2"><Button variant="tertiary" className="flex-1" onPress={onClose} isDisabled={isTransferring}>Cancel</Button><Button variant="primary" className="flex-1" isDisabled={!target || isTransferring} onPress={onTransfer}>{isTransferring ? "Transferring…" : "Transfer"}</Button></div>
      </div>
    </div>
  );
}
