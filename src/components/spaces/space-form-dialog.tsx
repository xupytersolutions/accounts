"use client";

import { useEffect, useState } from "react";
import { Button, TextField, Input, TextArea, Select, ListBox, Label, FieldError } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { spaceSchema } from "@/lib/validators";
import { ICON_OPTIONS, COLORS } from "@/lib/constants/icons";
import { Icon } from "@/components/ui/icon";
import { useModalLock } from "@/lib/hooks/use-modal-lock";
import type { SpaceFormDialogProps } from "@/lib/types";

export function SpaceFormDialog({ isOpen, onClose, onSubmit, initialData, title, submitLabel, isPending }: SpaceFormDialogProps) {
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [nameVal, setNameVal] = useState("");
  const [typeVal, setTypeVal] = useState("personal");
  const [descVal, setDescVal] = useState("");

  useModalLock(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColor(initialData.color || COLORS[0]);
      setIcon(initialData.icon || "");
      setNameVal(initialData.name ?? "");
      setTypeVal(initialData.type ?? "personal");
      setDescVal(initialData.description ?? "");
    } else {
      setColor(COLORS[0]);
      setIcon("");
      setNameVal("");
      setTypeVal("personal");
      setDescVal("");
    }
    setFieldErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isDirty = !initialData
    ? nameVal.trim() !== "" || descVal.trim() !== "" || typeVal !== "personal" || color !== COLORS[0] || icon !== ""
    : nameVal.trim() !== (initialData.name ?? "") || typeVal !== (initialData.type ?? "personal") || descVal.trim() !== (initialData.description ?? "") || color !== (initialData.color || COLORS[0]) || icon !== (initialData.icon || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    const toCheck = {
      name: nameVal.trim(),
      type: typeVal,
      description: descVal.trim() || null,
      color: color || null,
      icon: icon || null,
    };
    const parsed = spaceSchema.safeParse(toCheck);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const iss of parsed.error.issues) if (!map[iss.path]) map[iss.path] = iss.message;
      setFieldErrors(map);
      return;
    }
    try {
      await onSubmit(parsed.data);
      onClose();
      setFieldErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save space";
      const lower = msg.toLowerCase();
      if (lower.includes("description")) setFieldErrors({ description: msg });
      else setFieldErrors({ name: msg });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border p-6 shrink-0">
          <div className="flex-1 min-w-0"><h3 className="text-lg font-semibold text-foreground">{title}</h3></div>
          <Button variant="ghost" isIconOnly size="sm" onPress={onClose} aria-label="Close" className="shrink-0 -mr-2">
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
            <TextField value={nameVal} onChange={(v) => setNameVal(String(v))} isRequired isInvalid={!!fieldErrors.name} validationBehavior="aria" className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Space name</Label>
              <Input placeholder="e.g. Client XYZ" />
              {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
            </TextField>

            <Select selectedKey={typeVal} onSelectionChange={(k) => setTypeVal(String(k))} className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Type</Label>
              <Select.Trigger><Select.Value /></Select.Trigger>
              <Select.Popover className="bg-popover border border-border shadow-sm">
                <ListBox className="p-1">
                  <ListBox.Item id="personal" className="text-popover-foreground data-[focused]:bg-muted">Personal</ListBox.Item>
                  <ListBox.Item id="company" className="text-popover-foreground data-[focused]:bg-muted">Company</ListBox.Item>
                  <ListBox.Item id="client" className="text-popover-foreground data-[focused]:bg-muted">Client</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map(({ id, label, Icon: IconComp }) => (
                  <button key={id || "none"} type="button" onClick={() => setIcon(id)} className={`w-9 h-9 rounded-lg border flex items-center justify-center ${icon === id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"}`} aria-label={label} title={label}>
                    {IconComp ? <IconComp className="w-5 h-5" /> : <span className="text-xs font-semibold">Aa</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${color === c ? "border-foreground scale-110" : "border-white dark:border-border"}`} style={{ backgroundColor: c }} aria-label={`Color ${c}`}>
                    {color === c && <span className="w-2 h-2 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                  {icon ? <Icon icon={icon} className="w-4 h-4 text-white" /> : <span className="text-xs font-semibold">{(initialData?.name ?? "Aa").charAt(0).toUpperCase()}</span>}
                </div>
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            </div>

            <TextField value={descVal} onChange={(v) => setDescVal(String(v))} isInvalid={!!fieldErrors.description} validationBehavior="aria" className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Description</Label>
              <TextArea placeholder="Optional note about this space..." rows={3} />
              {fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}
            </TextField>
          </div>

          <div className="flex gap-3 p-6 pt-4 border-t border-border shrink-0 bg-card">
            <Button variant="tertiary" type="button" onPress={onClose} isDisabled={!!isPending} className="flex-1 h-10">Cancel</Button>
            <Button type="submit" isDisabled={!!isPending || (!!initialData && !isDirty)} className="flex-1 h-10 text-primary-foreground font-medium bg-primary hover:bg-primary-hover">
              {isPending ? <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</span> : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
