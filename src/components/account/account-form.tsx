"use client";
import { Input, TextField, Label, Button } from "@heroui/react";

type AccountFormProps = {
  defaultName?: string | null;
  defaultImage?: string | null;
  email?: string | null;
  valueName?: string;
  valueImage?: string;
  onNameChange?: (v: string) => void;
  onImageChange?: (v: string) => void;
  error?: string | null;
  isPending?: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  action?: (fd: FormData) => Promise<void>;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
};

export function AccountForm({ defaultName, defaultImage, email, valueName, valueImage, onNameChange, onImageChange, error, isPending, onSubmit, action, submitLabel = "Save changes", showCancel, onCancel }: AccountFormProps) {
  const isControlled = valueName !== undefined;
  return (
    <form onSubmit={onSubmit} action={action} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
        {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
        {isControlled ? (
          <>
            <TextField name="name" className="w-full" value={valueName ?? ""} onChange={(v) => onNameChange?.(v as string)}><Label className="text-sm font-medium text-foreground mb-2">Name</Label><Input placeholder="Your name" /></TextField>
            <TextField name="image" className="w-full" value={valueImage ?? ""} onChange={(v) => onImageChange?.(v as string)}><Label className="text-sm font-medium text-foreground mb-2">Avatar image URL</Label><Input placeholder="https://..." /></TextField>
          </>
        ) : (
          <>
            <TextField name="name" defaultValue={defaultName ?? ""} className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Name</Label><Input placeholder="Your name" /></TextField>
            <TextField name="image" defaultValue={defaultImage ?? ""} className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Avatar image URL</Label><Input placeholder="https://..." /></TextField>
          </>
        )}
        <TextField isDisabled className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Email</Label><Input value={email ?? ""} aria-label="Email" /></TextField>
        <p className="text-xs text-muted-foreground -mt-2">Email is managed by your provider.</p>
      </div>
      <div className="flex gap-3 p-6 pt-4 border-t border-border shrink-0 bg-card">
        {showCancel && <Button variant="tertiary" type="button" onPress={onCancel} className="flex-1 h-10" isDisabled={isPending}>Cancel</Button>}
        <Button variant="primary" type="submit" className={`${showCancel ? "flex-1" : "w-fit"} h-10 font-medium bg-primary text-primary-foreground`} isDisabled={isPending}>{isPending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
