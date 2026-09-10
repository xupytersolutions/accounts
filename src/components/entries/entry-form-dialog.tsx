"use client";
import { useEffect, useState } from "react";
import { Button, TextField, Input, InputGroup, TextArea, Select, ListBox, Label, FieldError } from "@heroui/react";
import { EyeIcon, EyeSlashIcon, KeyIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { entrySchema, updateEntrySchema } from "@/lib/validators";
import { ICON_OPTIONS, COLORS } from "@/lib/constants/icons";
import { Icon } from "@/components/ui/icon";
import { useModalLock } from "@/lib/hooks/use-modal-lock";
import { PasswordGenerator } from "@/components/password-generator";
import { useCategoryForm } from "@/lib/hooks/use-category-form";
import type { VaultEntry, Category } from "@/lib/types";

type EntryFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  editing: VaultEntry | null;
  spaceId: string;
  allCategories: Category[];
  createEntry: (fd: FormData) => Promise<void>;
  updateEntry: (fd: FormData) => Promise<void>;
  genPassword?: string | null;
  genCreate?: boolean;
  onGenConsumed?: () => void;
};

export function EntryFormDialog({ isOpen, onClose, editing, spaceId, allCategories, createEntry, updateEntry, genPassword, genCreate, onGenConsumed }: EntryFormDialogProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [createPwd, setCreatePwd] = useState("");
  const [editPwd, setEditPwd] = useState("");
  const [titleVal, setTitleVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [urlVal, setUrlVal] = useState("");
  const [descVal, setDescVal] = useState("");
  const [showCatCustomize, setShowCatCustomize] = useState(false);
  const mode = editing ? "edit" as const : "create" as const;
  const cat = useCategoryForm(allCategories, editing, isOpen, mode);

  useModalLock(isOpen || showGenModal, onClose);

  useEffect(() => {
    if (!isOpen) { setShowPassword(false); setShowGenModal(false); setShowCatCustomize(false); }
  }, [isOpen]);

  useEffect(() => { setShowCatCustomize(false); }, [cat.catKey]);

  // init field values when dialog opens or editing changes — preserves typed values while generator is open
  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setTitleVal(editing.title ?? "");
      setEmailVal(editing.email ?? "");
      setUrlVal(editing.url ?? "");
      setDescVal(editing.description ?? "");
      setEditPwd("");
    } else {
      // create mode: on fresh open (or switching from edit to create) reset to blank
      // preserve user-typed values when just toggling generator (isOpen stays true, editing stays null -> effect not re-run)
      setTitleVal("");
      setEmailVal("");
      setUrlVal("");
      setDescVal("");
      if (genPassword) setCreatePwd(genPassword);
      else setCreatePwd((prev) => (prev ? prev : ""));
    }
  }, [isOpen, editing, genPassword]);
  useEffect(() => { if (editing) setEditPwd(""); }, [editing]);
  useEffect(() => { if (isOpen) { setFieldErrors({}); } }, [isOpen]);

  // reset create text fields on close
  useEffect(() => {
    if (!isOpen && !editing) {
      setTitleVal("");
      setEmailVal("");
      setUrlVal("");
      setDescVal("");
      setCreatePwd("");
    }
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const handleAction = async (fd: FormData) => {
    setFieldErrors({});
    try {
      if (editing) {
        fd.set("entryId", editing.id);
        if (cat.catKey === "none") { fd.set("categoryId", "none"); fd.delete("category"); fd.delete("customCategory"); fd.delete("icon"); fd.delete("color"); fd.delete("logoUrl"); }
        else if (cat.catKey === "custom") { fd.set("categoryId", "custom"); fd.set("customCategory", cat.customName); fd.set("icon", cat.icon); fd.set("color", cat.color); fd.set("logoUrl", cat.logoUrl || ""); }
        else { fd.set("categoryId", cat.catKey); fd.delete("category"); fd.delete("customCategory"); fd.set("icon", cat.icon); fd.set("color", cat.color); fd.set("logoUrl", cat.logoUrl || ""); }
        const toCheck: Record<string, unknown> = { title: String(fd.get("title") || "").trim() || null, email: String(fd.get("email") || "").trim(), password: String(fd.get("password") || "") || null, url: String(fd.get("url") || "").trim() || null, description: String(fd.get("description") || "").trim() || null, category: String(fd.get("category") || fd.get("customCategory") || "").trim() || null, icon: String(fd.get("icon") || "").trim() || null, color: String(fd.get("color") || "").trim() || null, logoUrl: String(fd.get("logoUrl") || "").trim() || null, entryId: editing.id, spaceId };
        const parsed = updateEntrySchema.safeParse(toCheck);
        if (!parsed.success) { const m: Record<string, string> = {}; for (const iss of parsed.error.issues as Array<{ path: string; message: string }>) if (!m[iss.path]) m[iss.path] = iss.message; setFieldErrors(m); return; }
        await updateEntry(fd);
      } else {
        if (cat.catKey === "none") fd.set("categoryId", "none");
        else if (cat.catKey === "custom") { fd.set("categoryId", "custom"); fd.set("customCategory", cat.customName); fd.set("icon", cat.icon); fd.set("color", cat.color); fd.set("logoUrl", cat.logoUrl || ""); }
        else { fd.set("categoryId", cat.catKey); fd.set("icon", cat.icon); fd.set("color", cat.color); fd.set("logoUrl", cat.logoUrl || ""); }
        const toCheck: Record<string, unknown> = { title: String(fd.get("title") || "").trim() || null, email: String(fd.get("email") || "").trim(), password: String(fd.get("password") || "").trim(), url: String(fd.get("url") || "").trim() || null, description: String(fd.get("description") || "").trim() || null, category: String(fd.get("category") || fd.get("customCategory") || "").trim() || null, icon: String(fd.get("icon") || "").trim() || null, color: String(fd.get("color") || "").trim() || null, logoUrl: String(fd.get("logoUrl") || "").trim() || null };
        const parsed = entrySchema.safeParse(toCheck);
        if (!parsed.success) { const m: Record<string, string> = {}; for (const iss of parsed.error.issues as Array<{ path: string; message: string }>) if (!m[iss.path]) m[iss.path] = iss.message; setFieldErrors(m); return; }
        await createEntry(fd);
      }
      onClose(); onGenConsumed?.(); setFieldErrors({});
      // clear create fields after success
      if (!editing) {
        setTitleVal(""); setEmailVal(""); setUrlVal(""); setDescVal(""); setCreatePwd("");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Validation failed"; const lower = msg.toLowerCase(); const m: Record<string, string> = {};
      if (lower.includes("title")) m.title = msg; else if (lower.includes("login") || lower.includes("username") || lower.includes("email")) m.email = msg; else if (lower.includes("password")) m.password = msg; else if (lower.includes("url")) m.url = msg; else if (lower.includes("description") || lower.includes("note")) m.description = msg; else if (lower.includes("category")) m.category = msg; else m.email = msg;
      setFieldErrors(m);
    }
  };

  return (
    <>
      {/* Add account modal — hidden while generator is open to avoid double backdrop / empty gap */}
      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto ${showGenModal ? "hidden" : ""}`} onClick={onClose} role="dialog" aria-modal="true" aria-hidden={showGenModal}>
        <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-border shrink-0"><h3 className="text-lg font-semibold text-foreground">{editing ? "Edit account" : "Add account"}</h3><Button variant="ghost" isIconOnly size="sm" onPress={onClose} aria-label="Close" className="shrink-0 -mr-1"><XMarkIcon className="w-5 h-5" /></Button></div>
          <form noValidate key={editing?.id ?? "new"} action={handleAction} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4 overscroll-contain">
              <input type="hidden" name="spaceId" value={spaceId} />
              <TextField value={titleVal} onChange={(v) => setTitleVal(v as string)} name="title" isInvalid={!!fieldErrors.title} validationBehavior="aria" className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Title <span className="text-muted-foreground font-normal">(unique)</span></Label><Input placeholder="e.g. Gmail, AWS root" autoFocus={!!genCreate && !editing} />{fieldErrors.title && <FieldError>{fieldErrors.title}</FieldError>}</TextField>
              <Select selectedKey={cat.catKey} onSelectionChange={(k) => cat.setCatKey(String(k))} className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Category</Label><Select.Trigger><Select.Value /></Select.Trigger><Select.Popover className="bg-popover border border-border shadow-sm"><ListBox className="p-1"><ListBox.Item id="none">No category</ListBox.Item><ListBox.Item id="custom">Custom…</ListBox.Item>{allCategories.map((c) => (<ListBox.Item key={c.id} id={c.id} textValue={c.name}><div className="flex items-center gap-2">{c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-4 h-4 object-contain" /> : c.icon ? <Icon icon={c.icon} className="w-4 h-4" /> : null}<span>{c.name}</span></div></ListBox.Item>))}</ListBox></Select.Popover></Select>
              {cat.catKey === "custom" && (<TextField className="w-full" value={cat.customName} onChange={(v) => cat.setCustomName(v as string)}><Label className="text-sm font-medium text-foreground mb-2">Custom category name</Label><Input placeholder="e.g. My Bank, Work SSO" /></TextField>)}
              {cat.catKey === "custom" && (<><div className="space-y-2"><Label className="text-sm font-medium text-foreground">Icon</Label><div className="flex flex-wrap gap-1.5">{ICON_OPTIONS.map(({ id, label, Icon: C }) => { const active = cat.icon === id; return (<button key={id || "none"} type="button" onClick={() => cat.setIcon(id)} className={`w-9 h-9 rounded-lg border flex items-center justify-center ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"}`} aria-label={label} title={label}>{C ? <C className="w-5 h-5" /> : <span className="text-xs font-semibold">Aa</span>}</button>); })}</div></div><div className="space-y-2"><Label className="text-sm font-medium text-foreground">Color</Label><div className="flex flex-wrap gap-2">{COLORS.map((c) => { const active = cat.color === c; return (<button key={c} type="button" onClick={() => cat.setColor(c)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${active ? "border-foreground scale-110" : "border-card"}`} style={{ backgroundColor: c }} aria-label={`Color ${c}`}>{active && <span className="w-2 h-2 bg-white rounded-full" />}</button>); })}</div><div className="flex items-center gap-2 pt-1"><div className="w-7 h-7 rounded-md flex items-center justify-center text-white overflow-hidden" style={{ backgroundColor: cat.color }}>{cat.logoUrl ? <img src={cat.logoUrl} alt="logo" className="w-5 h-5 object-contain" onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.display = "none")} /> : cat.icon ? <Icon icon={cat.icon} className="w-4 h-4 text-white" /> : <span className="text-xs font-semibold">{(cat.customName || "Aa").charAt(0).toUpperCase()}</span>}</div><span className="text-xs text-muted-foreground">Preview</span></div></div></>)}
              {cat.catKey !== "none" && cat.catKey !== "custom" && (
                <>
                  {(() => {
                    const selected = allCategories.find((x) => x.id === cat.catKey);
                    return (
                      <div className="flex items-center gap-3 py-1 px-3 rounded-xl border border-border bg-muted/30">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white shrink-0 overflow-hidden" style={{ backgroundColor: cat.color }}>
                          {cat.logoUrl ? <img src={cat.logoUrl} alt={selected?.name ?? "category"} className="w-5 h-5 object-contain" onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.display = "none")} /> : cat.icon ? <Icon icon={cat.icon} className="w-5 h-5 text-white" /> : <span className="text-xs font-semibold">{(selected?.name ?? "Aa").charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{selected?.name ?? "Category"}</p>
                          <p className="text-xs text-muted-foreground">Uses category icon & color</p>
                        </div>
                        <Button variant="ghost" size="sm" onPress={() => setShowCatCustomize((v) => !v)} className="h-7 text-xs shrink-0">{showCatCustomize ? "Hide" : "Customize"}</Button>
                      </div>
                    );
                  })()}
                  {showCatCustomize && (
                    <div className="space-y-2"><Label className="text-sm font-medium text-foreground">Color <span className="text-muted-foreground font-normal">(override)</span></Label><div className="flex flex-wrap gap-2">{COLORS.map((c) => { const active = cat.color === c; return (<button key={c} type="button" onClick={() => cat.setColor(c)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${active ? "border-foreground scale-110" : "border-card"}`} style={{ backgroundColor: c }} aria-label={`Color ${c}`}>{active && <span className="w-2 h-2 bg-white rounded-full" />}</button>); })}</div><div className="flex items-center gap-2 pt-1"><div className="w-7 h-7 rounded-md flex items-center justify-center text-white overflow-hidden" style={{ backgroundColor: cat.color }}>{cat.logoUrl ? <img src={cat.logoUrl} alt="logo" className="w-5 h-5 object-contain" onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.display = "none")} /> : cat.icon ? <Icon icon={cat.icon} className="w-4 h-4 text-white" /> : <span className="text-xs font-semibold">{(allCategories.find((x) => x.id === cat.catKey)?.name || "Aa").charAt(0).toUpperCase()}</span>}</div><span className="text-xs text-muted-foreground">Preview — overrides color for this entry</span></div></div>
                  )}
                </>
              )}
              <TextField value={emailVal} onChange={(v) => setEmailVal(v as string)} name="email" isRequired isInvalid={!!fieldErrors.email} validationBehavior="aria" className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Account / Username</Label><Input placeholder="username, email or account name" />{fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}</TextField>
              <div className="w-full space-y-2"><Label className="text-sm font-medium text-foreground">Password {editing && <span className="text-muted-foreground font-normal">(leave blank to keep)</span>}</Label><InputGroup fullWidth><InputGroup.Input name="password" type={showPassword ? "text" : "password"} value={editing ? editPwd : createPwd} onChange={(e) => { const v = typeof e === "string" ? e : (e.target as HTMLInputElement).value; if (editing) setEditPwd(v); else setCreatePwd(v); }} placeholder={editing ? "•••••••• (unchanged)" : "••••••••"} aria-invalid={!!fieldErrors.password} className="font-mono" /><InputGroup.Suffix className="gap-0 pr-0.5"><Button isIconOnly size="sm" variant="ghost" aria-label={showPassword ? "Hide password" : "Show password"} onPress={() => setShowPassword((v) => !v)} className="h-8 w-8 text-muted-foreground hover:text-foreground">{showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</Button><Button isIconOnly size="sm" variant="ghost" aria-label="Generate password" onPress={() => setShowGenModal(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground"><KeyIcon className="w-4 h-4" /></Button></InputGroup.Suffix></InputGroup>{fieldErrors.password && <div className="text-sm text-danger">{fieldErrors.password}</div>}</div>
              <TextField value={urlVal} onChange={(v) => setUrlVal(v as string)} name="url" type="url" isInvalid={!!fieldErrors.url} validationBehavior="aria" className="w-full"><Label className="text-sm font-medium text-foreground mb-2">URL (optional)</Label><Input placeholder="https://..." type="url" />{fieldErrors.url && <FieldError>{fieldErrors.url}</FieldError>}</TextField>
              <TextField value={descVal} onChange={(v) => setDescVal(v as string)} name="description" isInvalid={!!fieldErrors.description} validationBehavior="aria" className="w-full"><Label className="text-sm font-medium text-foreground mb-2">Description</Label><TextArea placeholder="Notes, recovery codes, 2FA hints…" rows={3} />{fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}</TextField>
            </div>
            <div className="flex gap-3 p-4 sm:p-6 pt-4 border-t border-border shrink-0 bg-card"><Button variant="tertiary" type="button" onPress={onClose} className="flex-1 h-10">Cancel</Button><Button type="submit" variant="primary" className="flex-1 h-10 font-medium">{editing ? "Save changes" : "Save account"}</Button></div>
          </form>
        </div>
      </div>
      {showGenModal && (<div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={() => setShowGenModal(false)} role="dialog" aria-modal="true"><div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-border shrink-0"><h3 className="text-lg font-semibold text-foreground">Generate password</h3><Button variant="ghost" isIconOnly size="sm" onPress={() => setShowGenModal(false)} aria-label="Close" className="shrink-0 -mr-1"><XMarkIcon className="w-5 h-5" /></Button></div><div className="flex-1 overflow-y-auto overscroll-contain"><PasswordGenerator onChoose={(pwd) => { if (editing) setEditPwd(pwd); else setCreatePwd(pwd); setShowGenModal(false); setShowPassword(true); }} hideAddToSpace /></div></div></div>)}
    </>
  );
}
