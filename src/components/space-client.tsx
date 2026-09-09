"use client";
import { Card, Button, TextField, Input, InputGroup, TextArea, Label, Select, ListBox, Dropdown, Separator, Checkbox, FieldError } from "@heroui/react";
import { entrySchema, updateEntrySchema } from "@/lib/validators";
import { useState, useEffect, useRef } from "react";
import { updateEntry } from "@/lib/actions";
import { PageHeader } from "@/components/ui/page-header";
import { CATEGORY_PRESETS, getPresetLogoUrl, findPresetByName } from "@/lib/constants/category-presets";
import { ICON_OPTIONS as CATEGORY_ICON_OPTIONS, ICON_MAP as CATEGORY_ICON_MAP, COLORS as CATEGORY_COLORS } from "@/lib/constants/icons";
import {
  LockClosedIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { FunnelIcon } from "@heroicons/react/24/solid";

type Category = { id: string; name: string; icon: string | null; color: string | null; logoUrl: string | null };
type Entry = { id: string; title: string | null; email: string; password: string; description: string | null; url: string | null; category: string | null; icon: string | null; color: string | null; logoUrl: string | null; categoryId: string | null; categoryRef?: Category | null; updatedAt?: string | Date };
type Space = { id: string; name: string; type: string; description: string | null; entries: Entry[]; updatedAt?: string | Date };
type SpaceOpt = { id: string; name: string; type: string };

function CategoryIcon({ icon, className = "w-5 h-5" }: { icon: string | null; className?: string }) {
  const Comp = icon ? CATEGORY_ICON_MAP[icon] : null;
  if (Comp) return <Comp className={className} />;
  return null;
}

const ACCOUNT_CATEGORY_PRESETS = CATEGORY_PRESETS;

type ImportRow = { uid: string; title: string; email: string; password: string; url: string; description: string; category: string };

// RFC4180-compliant CSV helpers — handles ,"' ; inside quoted fields
function csvEscape(v: string): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}
function parseCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delim && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
function detectDelim(sample: string): string {
  const candidates = [",", ";", "|", "\t"];
  const scores = candidates.map((d) => ({ d, count: (sample.match(new RegExp(d === "\t" ? "\t" : `\\${d}`, "g")) || []).length }));
  scores.sort((a, b) => b.count - a.count);
  return scores[0].count > 0 ? scores[0].d : ",";
}
function splitCsvRows(text: string): string[] {
  const rows: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '""'; i++; }
      else { inQuotes = !inQuotes; cur += ch; }
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      if (cur.trim()) rows.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) rows.push(cur);
  return rows;
}

function parseImportTxt(text: string): ImportRow[] {
  const raw = text.trim();
  if (!raw) return [];
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return (arr as Record<string, unknown>[])
        .filter((o) => typeof o === "object" && o !== null)
        .map((o, i) => ({
          uid: `row-${Date.now()}-${i}`,
          title: String(o.title ?? o.name ?? "").trim(),
          email: String(o.email ?? o.username ?? o.login ?? o["account"] ?? "").trim(),
          password: String(o.password ?? "").trim(),
          url: String(o.url ?? o.link ?? "").trim(),
          description: String(o.description ?? o.note ?? "").trim(),
          category: String(o.category ?? o.cat ?? "").trim(),
        }))
        .filter((r) => r.email || r.password || r.title);
    } catch {}
  }
  const rows = splitCsvRows(raw);
  if (rows.length === 0) return [];
  const headerLower = rows[0].toLowerCase();
  const hasHeader =
    (headerLower.includes("title") && (headerLower.includes("email") || headerLower.includes("login") || headerLower.includes("username") || headerLower.includes("account"))) ||
    (headerLower.includes("account") && headerLower.includes("password"));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const delim = hasHeader ? detectDelim(rows[0]) : detectDelim(dataRows[0] || ",");
  return dataRows.map((line, i) => {
    const parts = parseCsvLine(line, delim);
    // support 2..6 cols; 6th is category (new)
    let title = "", email = "", password = "", url = "", description = "", category = "";
    if (parts.length === 2) {
      [email, password] = parts;
    } else if (parts.length === 3) {
      if (parts[2].includes(".") || parts[2].startsWith("http")) {
        [email, password, url] = parts;
      } else {
        [title, email, password] = parts;
      }
    } else if (parts.length >= 6) {
      [title, email, password, url, description, category] = [...parts, "", "", "", "", "", ""].slice(0, 6);
      // if 6+ cols, extra joins to description? keep category as last
      if (parts.length > 6) category = parts[5] ?? "";
    } else {
      [title = "", email = "", password = "", url = "", description = ""] = [...parts, "", "", "", ""].slice(0, 5);
      if (parts.length === 4 && !title.includes(" ") && email && password && url) {
        [email, password, url, description] = parts as [string, string, string, string];
        title = "";
      }
    }
    return { uid: `row-${Date.now()}-${i}`, title: title.trim(), email: email.trim(), password, url: url.trim(), description: description.trim(), category: category.trim() };
  }).filter((r) => r.email || r.password || r.title);
}

function timeAgo(d?: string | Date | null) {
  if (!d) return "";
  const t = new Date(d).getTime();
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export function SpaceClient({
  space,
  allSpaces,
  allCategories,
  createEntry,
  deleteEntry,
  transferEntry,
  bulkCreateEntries,
  bulkDeleteEntries,
  bulkTransferEntries,
}: {
  space: Space;
  allSpaces: SpaceOpt[];
  allCategories: Category[];
  createEntry: (fd: FormData) => Promise<void>;
  deleteEntry: (entryId: string, spaceId: string) => Promise<void>;
  transferEntry: (entryId: string, targetSpaceId: string) => Promise<void>;
  bulkCreateEntries: (spaceId: string, entries: Array<{ title?: string | null; email: string; password: string; url?: string | null; description?: string | null; category?: string | null; icon?: string | null; color?: string | null; categoryId?: string | null }>) => Promise<void>;
  bulkDeleteEntries: (entryIds: string[], spaceId: string) => Promise<void>;
  bulkTransferEntries: (entryIds: string[], targetSpaceId: string) => Promise<void>;
}) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [isEditSpaceOpen, setIsEditSpaceOpen] = useState(false);
  // category state for create
  const [createCatKey, setCreateCatKey] = useState<string>("none");
  const [createCustomName, setCreateCustomName] = useState("");
  const [createCatIcon, setCreateCatIcon] = useState("");
  const [createCatColor, setCreateCatColor] = useState(CATEGORY_COLORS[0]);
  const [createCatLogoUrl, setCreateCatLogoUrl] = useState<string | null>(null);
  // category state for edit
  const [editCatKey, setEditCatKey] = useState<string>("none");
  const [editCustomName, setEditCustomName] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("");
  const [editCatColor, setEditCatColor] = useState(CATEGORY_COLORS[0]);
  const [editCatLogoUrl, setEditCatLogoUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [transferOpen, setTransferOpen] = useState<{ ids: string[] } | null>(null);
  const [transferTarget, setTransferTarget] = useState<string>("");
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Search / filter / sort — parity with dashboard Spaces
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  type ViewMode = "comfortable" | "compact";
  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");

  // entry context menu + confirm modals
  const [entryCtx, setEntryCtx] = useState<{ id: string; x: number; y: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [entryFormError, setEntryFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAddOpen && !importOpen && !transferOpen && !isEditSpaceOpen && !deleteTarget && !bulkDeleteOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddOpen(false);
        setEditing(null);
        setIsEditSpaceOpen(false);
        setImportOpen(false);
        setTransferOpen(null);
        setDeleteTarget(null);
        setBulkDeleteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [isAddOpen, importOpen, transferOpen, isEditSpaceOpen, deleteTarget, bulkDeleteOpen]);

  // close entry context menu on outside click / scroll / esc
  useEffect(() => {
    if (!entryCtx) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-entry-ctx]")) setEntryCtx(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setEntryCtx(null); };
    const onScroll = () => setEntryCtx(null);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [entryCtx]);

  // reset create category when opening create modal (no editing)
  useEffect(() => {
    if (isAddOpen && !editing) {
      setCreateCatKey("none");
      setCreateCustomName("");
      setCreateCatIcon("");
      setCreateCatLogoUrl(null);
      setCreateCatColor(CATEGORY_COLORS[0]);
    }
    if (isAddOpen) {
      setEntryFormError(null);
      setFieldErrors({});
    }
  }, [isAddOpen, editing]);

  // populate edit category when editing changes
  useEffect(() => {
    if (editing) {
      if (editing.categoryId) {
        const c = allCategories.find((x) => x.id === editing.categoryId);
        if (c) {
          setEditCatKey(c.id);
          setEditCatIcon(c.icon || "");
          setEditCatColor(c.color || CATEGORY_COLORS[0]);
          setEditCatLogoUrl(c.logoUrl || getPresetLogoUrl(c.name.toLowerCase()) || null);
          setEditCustomName("");
          return;
        }
      }
      // try to match by category name to preset or existing category
      if (editing.category) {
        const preset = ACCOUNT_CATEGORY_PRESETS.find((p) => p.label.toLowerCase() === editing.category!.toLowerCase() || p.id === editing.category!.toLowerCase());
        if (preset) {
          setEditCatKey(preset.id);
          setEditCatIcon(preset.icon);
          setEditCatColor(preset.color);
          setEditCatLogoUrl(preset.logoUrl);
          setEditCustomName("");
          return;
        }
        const existing = allCategories.find((c) => c.name.toLowerCase() === editing.category!.toLowerCase());
        if (existing) {
          setEditCatKey(existing.id);
          setEditCatIcon(existing.icon || "");
          setEditCatColor(existing.color || CATEGORY_COLORS[0]);
          setEditCatLogoUrl(existing.logoUrl || null);
          setEditCustomName("");
          return;
        }
        // fallback to legacy free text as custom
        setEditCatKey("custom");
        setEditCustomName(editing.category || "");
        setEditCatIcon(editing.icon || "");
        setEditCatColor(editing.color || CATEGORY_COLORS[0]);
        setEditCatLogoUrl((editing as unknown as { logoUrl?: string | null }).logoUrl || null);
        return;
      }
      setEditCatKey("none");
      setEditCustomName("");
      setEditCatIcon("");
      setEditCatLogoUrl(null);
      setEditCatColor(CATEGORY_COLORS[0]);
    }
  }, [editing, allCategories]);

  // sync icon/color/logo when create select changes to preset/existing
  useEffect(() => {
    if (createCatKey === "none" || createCatKey === "custom") { if (createCatKey === "none") setCreateCatLogoUrl(null); return; }
    const preset = ACCOUNT_CATEGORY_PRESETS.find((p) => p.id === createCatKey);
    if (preset) { setCreateCatIcon(preset.icon); setCreateCatColor(preset.color); setCreateCatLogoUrl(preset.logoUrl); return; }
    const cat = allCategories.find((c) => c.id === createCatKey);
    if (cat) { setCreateCatIcon(cat.icon || ""); setCreateCatColor(cat.color || CATEGORY_COLORS[0]); setCreateCatLogoUrl(cat.logoUrl || null); }
  }, [createCatKey, allCategories]);

  useEffect(() => {
    if (editCatKey === "none" || editCatKey === "custom") { if (editCatKey === "none") setEditCatLogoUrl(null); return; }
    const preset = ACCOUNT_CATEGORY_PRESETS.find((p) => p.id === editCatKey);
    if (preset) { setEditCatIcon(preset.icon); setEditCatColor(preset.color); setEditCatLogoUrl(preset.logoUrl); return; }
    const cat = allCategories.find((c) => c.id === editCatKey);
    if (cat) { setEditCatIcon(cat.icon || ""); setEditCatColor(cat.color || CATEGORY_COLORS[0]); setEditCatLogoUrl(cat.logoUrl || null); }
  }, [editCatKey, allCategories]);

  // Filter open — close on outside click (same pattern as dashboard-client)
  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-filter-pane]") && !target.closest("[data-filter-trigger]")) setFilterOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filterOpen]);
  useEffect(() => {
    const v = localStorage.getItem("vaulta:accountsView") as ViewMode | null;
    if (v === "compact" || v === "comfortable") setViewMode(v);
  }, []);
  useEffect(() => {
    localStorage.setItem("vaulta:accountsView", viewMode);
  }, [viewMode]);

  // Derived filtered & sorted list — parity with dashboard Spaces filtering
  const filteredEntries = space.entries
    .filter((e) => {
      if (categoryFilter !== "all") {
        if (categoryFilter === "none") {
          const hasCat = (e as unknown as { categoryRef?: Category | null }).categoryRef || e.category;
          return !hasCat;
        }
        const catId = (e as unknown as { categoryRef?: Category | null }).categoryRef?.id ?? "";
        const catName = (e as unknown as { categoryRef?: Category | null }).categoryRef?.name?.toLowerCase() ?? e.category?.toLowerCase() ?? "";
        if (catId === categoryFilter) return true;
        if (catName === categoryFilter.toLowerCase()) return true;
        return false;
      }
      return true;
    })
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const catName = (e as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? e.category ?? "";
      return (
        (e.title ?? "").toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.url ?? "").toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "title") return (a.title ?? a.email).localeCompare(b.title ?? b.email);
      if (sortBy === "email") return a.email.localeCompare(b.email);
      if (sortBy === "category") {
        const ca = (a as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? a.category ?? "";
        const cb = (b as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? b.category ?? "";
        return ca.localeCompare(cb);
      }
      const da = a.updatedAt ? new Date(a.updatedAt as unknown as string).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt as unknown as string).getTime() : 0;
      return db - da;
    });

  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (sortBy !== "updated" ? 1 : 0);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const selectAll = () => {
    const ids = filteredEntries.map((e) => e.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
    if (allSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelected((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.add(id));
        return n;
      });
    }
  };

  const handleExport = () => {
    const header = ["title", "email", "password", "url", "description", "category"].map(csvEscape).join(",");
    const lines = space.entries.map((e) => {
      const cat = (e as unknown as { categoryRef?: Category | null }).categoryRef?.name ?? e.category ?? "";
      return [e.title ?? "", e.email, e.password, e.url ?? "", e.description ?? "", cat].map(csvEscape).join(",");
    });
    const content = [header, ...lines].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${space.name.replace(/\s+/g, "_")}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (f: File | null) => {
    if (!f) return;
    setImportFileName(f.name);
    setImportError("");
    const text = await f.text();
    const rows = parseImportTxt(text);
    if (rows.length === 0) setImportError("No valid rows found. Expected txt with CSV/JSON: title,email,password,url,description or JSON array.");
    setImportRows(rows);
  };

  const updateImportRow = (uid: string, patch: Partial<ImportRow>) => {
    setImportRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  };

  const confirmImport = async () => {
    const valid = importRows.filter((r) => r.email && r.password);
    if (valid.length === 0) { setImportError("Each row needs login and password"); return; }
    // client-side row validation (zod) before server
    for (const r of valid) {
      const parsed = entrySchema.safeParse({ title: r.title || null, email: r.email, password: r.password, url: r.url || null, description: r.description || null, category: r.category || null });
      if (!parsed.success) { setImportError(`Row "${r.title || r.email}": ${parsed.error?.issues?.[0]?.message || "Validation failed"}`); return; }
    }
    try {
      await bulkCreateEntries(space.id, valid.map((r) => ({ title: r.title || null, email: r.email, password: r.password, url: r.url || null, description: r.description || null, category: r.category || null })));
      setImportOpen(false);
      setImportRows([]);
      setImportFileName("");
      setImportError("");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed");
    }
  };

  const handleTransfer = async () => {
    if (!transferOpen || !transferTarget) return;
    setIsTransferring(true);
    try {
      if (transferOpen.ids.length === 1) {
        await transferEntry(transferOpen.ids[0], transferTarget);
      } else {
        await bulkTransferEntries(transferOpen.ids, transferTarget);
      }
      setTransferOpen(null);
      setTransferTarget("");
      setSelected(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsTransferring(false);
    }
  };

  const confirmSingleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEntry(deleteTarget.id, space.id);
      setDeleteTarget(null);
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selected.size === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteEntries(Array.from(selected), space.id);
      setBulkDeleteOpen(false);
      setSelected(new Set());
    } finally {
      setIsDeleting(false);
    }
  };

  const entryCtxEntry = entryCtx ? space.entries.find((e) => e.id === entryCtx.id) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Sticky header + toolbar */}
      <div className="sticky top-[65px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-4 mb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <PageHeader
          breadcrumbs={[
            { label: "Spaces", href: "/dashboard" },
            { label: space.name },
          ]}
          title={space.name}
          description={space.description?.trim() ? space.description : `Manage credentials in this ${space.type} space.`}
          badge={{ label: space.type }}
          action={
            <div className="flex items-center gap-2">
              <Button onPress={() => { setEditing(null); setIsAddOpen(true); }} className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium h-9">+ Account</Button>
              <Dropdown>
                <Button isIconOnly variant="tertiary" size="sm" aria-label="Account actions" className="h-9 w-9 border border-border bg-card">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </Button>
                <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl min-w-[200px]">
                  <Dropdown.Menu
                    aria-label="Account actions"
                    className="p-1"
                    onAction={(key) => {
                      if (key === "export") handleExport();
                      if (key === "import") setImportOpen(true);
                      if (key === "bulk-transfer" && selected.size > 0) setTransferOpen({ ids: Array.from(selected) });
                      if (key === "bulk-delete" && selected.size > 0) setBulkDeleteOpen(true);
                    }}
                  >
                    {selected.size > 0 && (
                      <>
                        <Dropdown.Item id="bulk-transfer" textValue="Transfer selected" className="rounded-lg text-foreground data-[focused]:bg-muted">
                          <div className="flex items-center gap-2">
                            <ArrowsRightLeftIcon className="w-4 h-4" />
                            <span>Transfer ({selected.size})</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item id="bulk-delete" textValue="Delete selected" className="rounded-lg text-destructive data-[focused]:bg-destructive/10 data-[focused]:text-destructive">
                          <div className="flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete ({selected.size})</span>
                          </div>
                        </Dropdown.Item>
                        <Separator className="my-1 bg-border" />
                      </>
                    )}
                    <Dropdown.Item id="export" textValue="Export txt" className="rounded-lg text-foreground data-[focused]:bg-muted flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Export txt</span>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item id="import" textValue="Import txt" className="rounded-lg text-foreground data-[focused]:bg-muted flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        <span>Import txt</span>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          }
        />

        {/* Search + Filter + View toggle — sticky */}
        <div className="flex gap-2 sm:gap-3 items-center">
          <div className="flex-1 relative min-w-0">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
              className="pl-10 h-10 border-1 w-full"
              aria-label="Search accounts"
            />
          </div>
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shrink-0">
            <button aria-label="Comfortable view" aria-pressed={viewMode === "comfortable"} onClick={() => setViewMode("comfortable")} className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "comfortable" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title="Comfortable">
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button aria-label="Compact view" aria-pressed={viewMode === "compact"} onClick={() => setViewMode("compact")} className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "compact" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title="Compact">
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="relative shrink-0" data-filter-trigger>
            <Button
              variant="tertiary"
              onPress={() => setFilterOpen((v) => !v)}
              className="h-10 px-4 gap-2 bg-card border border-border shadow-none rounded-xl text-foreground hover:bg-muted shrink-0"
              aria-expanded={filterOpen}
              aria-controls="filter-pane-accounts"
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{activeFilterCount}</span>}
            </Button>
          {filterOpen && (
            <div
              id="filter-pane-accounts"
              data-filter-pane
              className="absolute right-0 top-full mt-2 w-[320px] max-w-[min(320px,calc(100vw-2rem))] bg-popover border border-border shadow-sm rounded-xl p-4 z-20 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Filters</h4>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setCategoryFilter("all"); setSortBy("updated"); setSearch(""); }} className="text-xs text-primary hover:underline">Clear all</button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                <Select selectedKey={categoryFilter} onSelectionChange={(k) => setCategoryFilter(String(k))} className="w-full">
                  <Select.Trigger className="bg-card border border-border text-foreground h-9">
                    <Select.Value className="text-foreground" />
                  </Select.Trigger>
                  <Select.Popover className="bg-popover border border-border shadow-sm">
                    <ListBox className="p-1">
                      <ListBox.Item id="all" className="text-popover-foreground data-[focused]:bg-muted">All categories</ListBox.Item>
                      <ListBox.Item id="none" className="text-popover-foreground data-[focused]:bg-muted">No category</ListBox.Item>
                      {allCategories.map((c) => (
                        <ListBox.Item key={c.id} id={c.id} textValue={c.name} className="text-popover-foreground data-[focused]:bg-muted">{c.name}</ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Sort by</Label>
                <Select selectedKey={sortBy} onSelectionChange={(k) => setSortBy(String(k))} className="w-full">
                  <Select.Trigger className="bg-card border border-border text-foreground h-9">
                    <Select.Value className="text-foreground" />
                  </Select.Trigger>
                  <Select.Popover className="bg-popover border border-border shadow-sm">
                    <ListBox className="p-1">
                      <ListBox.Item id="updated" className="text-popover-foreground data-[focused]:bg-muted">Last updated</ListBox.Item>
                      <ListBox.Item id="title" className="text-popover-foreground data-[focused]:bg-muted">Title</ListBox.Item>
                      <ListBox.Item id="email" className="text-popover-foreground data-[focused]:bg-muted">Login</ListBox.Item>
                      <ListBox.Item id="category" className="text-popover-foreground data-[focused]:bg-muted">Category</ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {space.entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <LockClosedIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground mb-1">No accounts yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first account to this space</p>
          <Button onPress={() => { setEditing(null); setIsAddOpen(true); }} className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium h-9">+ Account</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="text-sm text-muted-foreground">
              {search.trim() || categoryFilter !== "all" || sortBy !== "updated" ? `${filteredEntries.length} of ${space.entries.length} total` : `${space.entries.length} total`}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">updated {timeAgo(space.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-2 px-1 mb-4">
            <Checkbox
              isSelected={filteredEntries.length > 0 && filteredEntries.every((e) => selected.has(e.id))}
              onChange={selectAll}
              className="text-sm"
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                Select all
              </Checkbox.Content>
            </Checkbox>
            <span className="text-sm text-muted-foreground ml-auto">{selected.size} selected{filteredEntries.length !== space.entries.length ? ` • ${filteredEntries.length} shown` : ""}</span>
          </div>

                {filteredEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl bg-muted/20">
                    <p className="text-sm font-medium text-foreground mb-1">No matches</p>
                    <p className="text-sm text-muted-foreground mb-4">Try adjusting search or filters.</p>
                    <Button variant="tertiary" onPress={() => { setSearch(""); setCategoryFilter("all"); setSortBy("updated"); }}>Clear filters</Button>
                  </div>
                ) : (
                <div className={`grid gap-3 mb-8 ${viewMode === "compact" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>{filteredEntries.map((e) => {
                  const presetMatch = (name: string) => ACCOUNT_CATEGORY_PRESETS.find((p) => p.label.toLowerCase() === name.toLowerCase() || p.id === name.toLowerCase());
                  const displayCat: Category | { name: string; icon: string | null; color: string | null; logoUrl: string | null } | null =
                    (e as unknown as { categoryRef?: Category | null }).categoryRef ?? (e.category ? { name: e.category, icon: e.icon, color: e.color, logoUrl: (e as unknown as { logoUrl?: string | null }).logoUrl ?? presetMatch(e.category)?.logoUrl ?? null } : null);
                  const catColor = displayCat?.color || presetMatch(displayCat?.name ?? "")?.color || CATEGORY_COLORS[0];
                  const catIcon = displayCat?.icon || presetMatch(displayCat?.name ?? "")?.icon || null;
                  const presetLogo = displayCat ? presetMatch(displayCat.name)?.logoUrl ?? getPresetLogoUrl(displayCat.name.toLowerCase()) : null;
                  const catLogo = presetLogo || (displayCat as unknown as { logoUrl?: string | null })?.logoUrl || null;
                  const isCompact = viewMode === "compact";
                  return (
                  <Card
                    key={e.id}
                    className="w-full shadow-none hover:scale-[1.02] duration-300 transition-transform rounded-2xl group cursor-pointer"
                    onContextMenu={(e2) => { e2.preventDefault(); setEntryCtx({ id: e.id, x: e2.clientX, y: e2.clientY }); }}
                  >
                    <Card.Content className={isCompact ? "p-3 flex items-center gap-3" : "p-2 flex flex-col gap-3"}>
                      {isCompact ? (
                        <>
                          <div className="flex items-center gap-2 shrink-0" onClick={(ev) => ev.stopPropagation()}>
                            <Checkbox isSelected={selected.has(e.id)} onChange={() => toggleSelect(e.id)} aria-label="Select account" className="shrink-0"><Checkbox.Content><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Content></Checkbox>
                            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: catColor }}>
                              {catLogo ? <img src={catLogo} alt={displayCat!.name} className="w-4 h-4 object-contain" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }} /> : catIcon ? <CategoryIcon icon={catIcon} className="w-4 h-4 text-white" /> : <span className="font-bold text-xs">{(e.title ?? e.email).charAt(0).toUpperCase()}</span>}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{e.title ?? displayCat?.name ?? "Account"}</h3>
                            <span className="text-xs text-muted-foreground truncate block">{e.email}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0" onClick={(ev) => ev.stopPropagation()}>
                            <Button isIconOnly size="sm" variant="ghost" aria-label={copiedId === e.id ? "Copied" : "Copy"} onPress={async () => { await navigator.clipboard.writeText(e.password); setCopiedId(e.id); window.setTimeout(() => setCopiedId((cur) => (cur === e.id ? null : cur)), 1500); }} className={`h-7 w-7 ${copiedId === e.id ? "text-success" : "text-muted-foreground"}`}>{copiedId === e.id ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}</Button>
                            <Button isIconOnly variant="tertiary" size="sm" aria-label="Account menu" className="h-7 w-7" onPress={(ev: unknown) => {
                              const anyEv = ev as { target?: Element; currentTarget?: Element }; const raw = (anyEv?.currentTarget ?? anyEv?.target) as HTMLElement | undefined; const target = (raw?.closest?.("button") as HTMLElement | null) ?? raw ?? null;
                              if (!target?.getBoundingClientRect) { setEntryCtx((prev) => (prev?.id === e.id ? null : { id: e.id, x: window.innerWidth / 2, y: window.innerHeight / 2 })); return; }
                              const r = target.getBoundingClientRect(); const x = Math.min(r.right - 160, window.innerWidth - 180); const y = r.bottom + 8; setEntryCtx((prev) => (prev?.id === e.id ? null : { id: e.id, x, y }));
                            }}><EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" /></Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
                              <Checkbox isSelected={selected.has(e.id)} onChange={() => toggleSelect(e.id)} aria-label="Select account" className="shrink-0"><Checkbox.Content><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Content></Checkbox>
                              <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: catColor }}>
                                {catLogo ? <img src={catLogo} alt={displayCat!.name} className="w-5 h-5 object-contain" onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }} /> : catIcon ? <CategoryIcon icon={catIcon} className="w-5 h-5 text-white" /> : <span className="font-bold text-sm">{(e.title ?? e.email).charAt(0).toUpperCase()}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                              <Button isIconOnly variant="tertiary" size="sm" aria-label="Account menu" className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 min-w-7" onPress={(ev: unknown) => {
                                const anyEv = ev as { target?: Element; currentTarget?: Element }; const raw = (anyEv?.currentTarget ?? anyEv?.target) as HTMLElement | undefined; const target = (raw?.closest?.("button") as HTMLElement | null) ?? raw ?? null;
                                if (!target?.getBoundingClientRect) { setEntryCtx((prev) => (prev?.id === e.id ? null : { id: e.id, x: window.innerWidth / 2, y: window.innerHeight / 2 })); return; }
                                const r = target.getBoundingClientRect(); const x = Math.min(r.right - 160, window.innerWidth - 180); const y = r.bottom + 8; setEntryCtx((prev) => (prev?.id === e.id ? null : { id: e.id, x, y }));
                              }}><EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" /></Button>
                            </div>
                          </div>
                          <div><h3 className="text-lg font-semibold text-foreground truncate leading-5">{e.title ?? displayCat?.name ?? "Account"}</h3><span className="text-xs text-primary truncate block">{displayCat?.name ?? e.email}</span></div>
                          {e.url && (<div className="flex items-center gap-2"><svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg><a href={e.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1 min-w-0" onClick={(ev) => ev.stopPropagation()}>{e.url}</a><svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></div>)}
                          <div className="relative w-full" onClick={(ev) => ev.stopPropagation()}>{copiedId === e.id && <span className="absolute -top-7 right-0 z-10 text-xs font-medium bg-foreground text-background px-2 py-1 rounded-md shadow-sm pointer-events-none">Copied</span>}<InputGroup fullWidth><InputGroup.Input readOnly value={showPasswords[e.id] ? e.password : "••••••••••"} aria-label="Password" className="w-full font-mono text-sm" /><InputGroup.Suffix className="pe-0"><Button isIconOnly size="sm" variant="ghost" aria-label={showPasswords[e.id] ? "Hide password" : "Show password"} onPress={() => setShowPasswords((p) => ({ ...p, [e.id]: !p[e.id] }))} className="h-8 w-8 text-muted-foreground hover:text-foreground">{showPasswords[e.id] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</Button><Button isIconOnly size="sm" variant="ghost" aria-label={copiedId === e.id ? "Copied" : "Copy password"} onPress={async () => { await navigator.clipboard.writeText(e.password); setCopiedId(e.id); window.setTimeout(() => setCopiedId((cur) => (cur === e.id ? null : cur)), 1500); }} className={`h-8 w-8 ${copiedId === e.id ? "text-success" : "text-muted-foreground hover:text-foreground"}`}>{copiedId === e.id ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}</Button></InputGroup.Suffix></InputGroup></div>
                          <div className="flex gap-6 flex-wrap items-center justify-between"><p className="text-xs text-muted-foreground line-clamp-2 max-w-[60%] flex items-center gap-1.5"><svg className="w-3.5 h-3.5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg><span className="line-clamp-2">{e.description?.trim() ? e.description : "no description"}</span></p><div className="flex items-end justify-end flex-col text-[11px] text-muted-foreground"><span className="truncate max-w-[140px]">{e.email}</span><span>updated {timeAgo(e.updatedAt)}</span></div></div>
                        </>
                      )}
                    </Card.Content>
                  </Card>
                  );
                  })}
                  <Card
                    className={`border-2 border-dashed border-border bg-muted/20 hover:border-border-strong hover:bg-muted/30 transition-colors cursor-pointer shadow-none rounded-2xl flex flex-col justify-center h-full ${viewMode === "compact" ? "min-h-[68px]" : "min-h-[180px]"}`}
                    onClick={() => { setEditing(null); setIsAddOpen(true); }}
                  >
                    <Card.Content className={`flex flex-col items-center justify-center text-center ${viewMode === "compact" ? "p-4 py-4" : "p-6 py-8"}`}>
                      <div className={`${viewMode === "compact" ? "w-8 h-8 mb-2" : "w-12 h-12 mb-3"} rounded-xl bg-muted border border-border flex items-center justify-center`}>
                        <svg className={`${viewMode === "compact" ? "w-4 h-4" : "w-6 h-6"} text-muted-foreground`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <p className={`${viewMode === "compact" ? "text-xs" : "text-sm"} font-semibold text-foreground mb-1`}>Create a new account</p>
                      {viewMode !== "compact" && <p className="text-sm text-muted-foreground">Add credentials to this space.</p>}
                    </Card.Content>
                  </Card>
                </div>
                )}

                {/* Entry context menu — same style as space card ctx menu */}
                {entryCtx && entryCtxEntry && (
                  <div
                    data-entry-ctx
                    className="fixed z-40 min-w-[180px] bg-popover border border-border shadow-sm rounded-xl p-1 flex flex-col"
                    style={{ left: Math.min(entryCtx.x, typeof window !== "undefined" ? window.innerWidth - 190 : entryCtx.x), top: entryCtx.y }}
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <button
                      className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2"
                      onClick={() => { setEntryCtx(null); setEditing(entryCtxEntry); setIsAddOpen(true); }}
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2"
                      onClick={async () => {
                        await navigator.clipboard.writeText(entryCtxEntry.password);
                        setCopiedId(entryCtxEntry.id);
                        window.setTimeout(() => setCopiedId((cur) => (cur === entryCtxEntry.id ? null : cur)), 1500);
                        setEntryCtx(null);
                      }}
                    >
                      {copiedId === entryCtxEntry.id ? <CheckIcon className="w-4 h-4 text-success" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                      {copiedId === entryCtxEntry.id ? "Copied" : "Copy password"}
                    </button>
                    <button
                      className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2"
                      onClick={() => { setEntryCtx(null); setTransferOpen({ ids: [entryCtx.id] }); }}
                    >
                      <ArrowsRightLeftIcon className="w-4 h-4" />
                      Transfer
                    </button>
                    <button
                      className="text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2"
                      onClick={() => { setEntryCtx(null); setDeleteTarget(entryCtxEntry); }}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
            </>
          )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={() => { setIsAddOpen(false); setEditing(null); }} role="dialog" aria-modal="true">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-border shrink-0">
              <h3 className="text-lg font-semibold text-foreground">{editing ? "Edit account" : "Add account"}</h3>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => { setIsAddOpen(false); setEditing(null); }} aria-label="Close" className="shrink-0 -mr-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
            <form noValidate key={editing?.id ?? "new"} action={async (fd) => {
                setEntryFormError(null);
                setFieldErrors({});
                try {
                  // inject category fields from state (reference from spaces) — now with dedicated brand logos
                  if (editing) {
                    fd.set("entryId", editing.id);
                    if (editCatKey === "none") {
                      fd.set("categoryId", "none");
                      fd.delete("category"); fd.delete("customCategory"); fd.delete("icon"); fd.delete("color"); fd.delete("logoUrl");
                    } else if (editCatKey === "custom") {
                      fd.set("categoryId", "custom");
                      fd.set("customCategory", editCustomName);
                      fd.set("icon", editCatIcon);
                      fd.set("color", editCatColor);
                      fd.set("logoUrl", editCatLogoUrl || "");
                    } else if (ACCOUNT_CATEGORY_PRESETS.some((p) => p.id === editCatKey)) {
                      const preset = ACCOUNT_CATEGORY_PRESETS.find((p) => p.id === editCatKey)!;
                      fd.set("category", preset.label);
                      fd.set("icon", editCatIcon || preset.icon);
                      fd.set("color", editCatColor || preset.color);
                      fd.set("logoUrl", editCatLogoUrl || preset.logoUrl);
                      fd.delete("categoryId");
                    } else {
                      // existing category id
                      fd.set("categoryId", editCatKey);
                      fd.delete("category"); fd.delete("customCategory");
                      fd.set("icon", editCatIcon);
                      fd.set("color", editCatColor);
                      fd.set("logoUrl", editCatLogoUrl || "");
                    }
                    // client-side zod check before server
                    const toCheck: Record<string, unknown> = {
                      title: String(fd.get("title") || "").trim() || null,
                      email: String(fd.get("email") || "").trim(),
                      password: String(fd.get("password") || "") || null,
                      url: String(fd.get("url") || "").trim() || null,
                      description: String(fd.get("description") || "").trim() || null,
                      category: String(fd.get("category") || fd.get("customCategory") || "").trim() || null,
                      icon: String(fd.get("icon") || "").trim() || null,
                      color: String(fd.get("color") || "").trim() || null,
                      logoUrl: String(fd.get("logoUrl") || "").trim() || null,
                      entryId: editing.id,
                      spaceId: space.id,
                    };
                    const parsed = updateEntrySchema.safeParse(toCheck);
                    if (!parsed.success) {
                      const map: Record<string, string> = {};
                      for (const iss of (parsed.error as any).issues as Array<{ path: string; message: string }>) {
                        if (!map[iss.path]) map[iss.path] = iss.message;
                      }
                      setFieldErrors(map);
                      return;
                    }
                    await updateEntry(fd);
                  } else {
                    if (createCatKey === "none") {
                      fd.set("categoryId", "none");
                    } else if (createCatKey === "custom") {
                      fd.set("categoryId", "custom");
                      fd.set("customCategory", createCustomName);
                      fd.set("icon", createCatIcon);
                      fd.set("color", createCatColor);
                      fd.set("logoUrl", createCatLogoUrl || "");
                    } else if (ACCOUNT_CATEGORY_PRESETS.some((p) => p.id === createCatKey)) {
                      const preset = ACCOUNT_CATEGORY_PRESETS.find((p) => p.id === createCatKey)!;
                      fd.set("category", preset.label);
                      fd.set("icon", createCatIcon || preset.icon);
                      fd.set("color", createCatColor || preset.color);
                      fd.set("logoUrl", createCatLogoUrl || preset.logoUrl);
                    } else {
                      fd.set("categoryId", createCatKey);
                      fd.set("icon", createCatIcon);
                      fd.set("color", createCatColor);
                      fd.set("logoUrl", createCatLogoUrl || "");
                    }
                    const toCheck: Record<string, unknown> = {
                      title: String(fd.get("title") || "").trim() || null,
                      email: String(fd.get("email") || "").trim(),
                      password: String(fd.get("password") || "").trim(),
                      url: String(fd.get("url") || "").trim() || null,
                      description: String(fd.get("description") || "").trim() || null,
                      category: String(fd.get("category") || fd.get("customCategory") || "").trim() || null,
                      icon: String(fd.get("icon") || "").trim() || null,
                      color: String(fd.get("color") || "").trim() || null,
                      logoUrl: String(fd.get("logoUrl") || "").trim() || null,
                    };
                    const parsed = entrySchema.safeParse(toCheck);
                    if (!parsed.success) {
                      const map: Record<string, string> = {};
                      for (const iss of (parsed.error as any).issues as Array<{ path: string; message: string }>) {
                        if (!map[iss.path]) map[iss.path] = iss.message;
                      }
                      setFieldErrors(map);
                      return;
                    }
                    await createEntry(fd);
                  }
                  setIsAddOpen(false); setEditing(null);
                  setFieldErrors({});
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Validation failed";
                  const lower = msg.toLowerCase();
                  const map: Record<string, string> = {};
                  if (lower.includes("title")) map.title = msg;
                  else if (lower.includes("login") || lower.includes("username") || lower.includes("email")) map.email = msg;
                  else if (lower.includes("password")) map.password = msg;
                  else if (lower.includes("url")) map.url = msg;
                  else if (lower.includes("description") || lower.includes("note")) map.description = msg;
                  else if (lower.includes("category")) map.category = msg;
                  else map.email = msg;
                  setFieldErrors(map);
                  return;
                }
              }} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4 overscroll-contain">
                <input type="hidden" name="spaceId" value={space.id} />
                <TextField name="title" defaultValue={editing?.title ?? ""} isInvalid={!!fieldErrors.title} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Title <span className="text-muted-foreground font-normal">(unique)</span></Label>
                  <Input placeholder="e.g. Gmail, AWS root" className="h-10" />
                  {fieldErrors.title && <FieldError>{fieldErrors.title}</FieldError>}
                </TextField>

                {/* Category — like Spaces icon/color picker */}
                <Select
                  selectedKey={editing ? editCatKey : createCatKey}
                  onSelectionChange={(k) => (editing ? setEditCatKey(String(k)) : setCreateCatKey(String(k)))}
                  className="w-full"
                >
                  <Label className="text-sm font-medium text-foreground mb-2">Category</Label>
                  <Select.Trigger className="bg-card border border-border text-foreground h-10">
                    <Select.Value className="text-foreground" />
                  </Select.Trigger>
                  <Select.Popover className="bg-popover border border-border shadow-sm">
                    <ListBox className="p-1">
                      <ListBox.Item id="none" className="text-popover-foreground data-[focused]:bg-muted">No category</ListBox.Item>
                      <ListBox.Item id="custom" className="text-popover-foreground data-[focused]:bg-muted">Custom…</ListBox.Item>
                      {ACCOUNT_CATEGORY_PRESETS.map((p) => (
                        <ListBox.Item key={p.id} id={p.id} textValue={p.label} className="text-popover-foreground data-[focused]:bg-muted">
                          <div className="flex items-center gap-2">
                            <img src={p.logoUrl} alt={p.label} className="w-4 h-4 object-contain rounded-sm bg-white/10" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                            <span>{p.label}</span>
                          </div>
                        </ListBox.Item>
                      ))}
                      {allCategories.length > 0 && (
                        <>
                          <ListBox.Item id="__sep" isDisabled className="opacity-0 h-px bg-border my-1 p-0" textValue="separator">---</ListBox.Item>
                          {allCategories.map((c) => (
                            <ListBox.Item key={c.id} id={c.id} textValue={c.name} className="text-popover-foreground data-[focused]:bg-muted">
                              <div className="flex items-center gap-2">
                                {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-4 h-4 object-contain" /> : c.icon ? <CategoryIcon icon={c.icon} className="w-4 h-4" /> : null}
                                <span>{c.name}</span>
                              </div>
                            </ListBox.Item>
                          ))}
                        </>
                      )}
                    </ListBox>
                  </Select.Popover>
                </Select>

                {(editing ? editCatKey : createCatKey) === "custom" && (
                  <TextField className="w-full" value={editing ? editCustomName : createCustomName} onChange={(v) => (editing ? setEditCustomName(v as string) : setCreateCustomName(v as string))}>
                    <Label className="text-sm font-medium text-foreground mb-2">Custom category name</Label>
                    <Input placeholder="e.g. My Bank, Work SSO" className="h-10" />
                  </TextField>
                )}

                {(editing ? editCatKey : createCatKey) !== "none" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Icon</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORY_ICON_OPTIONS.map(({ id, label, Icon }) => {
                          const active = (editing ? editCatIcon : createCatIcon) === id;
                          return (
                            <button
                              key={id || "none"}
                              type="button"
                              onClick={() => (editing ? setEditCatIcon(id) : setCreateCatIcon(id))}
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"}`}
                              aria-label={label}
                              title={label}
                            >
                              {Icon ? <Icon className="w-5 h-5" /> : <span className="text-xs font-semibold">Aa</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_COLORS.map((c) => {
                          const active = (editing ? editCatColor : createCatColor) === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => (editing ? setEditCatColor(c) : setCreateCatColor(c))}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${active ? "border-foreground scale-110" : "border-card"}`}
                              style={{ backgroundColor: c }}
                              aria-label={`Color ${c}`}
                            >
                              {active && <span className="w-2 h-2 bg-white rounded-full" />}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-white overflow-hidden" style={{ backgroundColor: editing ? editCatColor : createCatColor }}>
                          {(editing ? editCatLogoUrl : createCatLogoUrl) ? (
                            <img src={(editing ? editCatLogoUrl : createCatLogoUrl)!} alt="logo" className="w-5 h-5 object-contain" onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.display = "none")} />
                          ) : (editing ? editCatIcon : createCatIcon) ? (
                            <CategoryIcon icon={editing ? editCatIcon : createCatIcon} className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs font-semibold">{(editing ? editCustomName || ACCOUNT_CATEGORY_PRESETS.find((p) => p.id === editCatKey)?.label || "Aa" : createCustomName || ACCOUNT_CATEGORY_PRESETS.find((p) => p.id === createCatKey)?.label || "Aa").charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">Preview — {(editing ? editCatLogoUrl : createCatLogoUrl) ? "brand logo from public" : "like Spaces"}</span>
                      </div>
                    </div>
                  </>
                )}

                <TextField name="email" isRequired defaultValue={editing?.email ?? ""} isInvalid={!!fieldErrors.email} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Account / Username</Label>
                  <Input placeholder="username, email or account name" className="h-10" />
                  {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                </TextField>
                <TextField name="password" isRequired={!editing} type="password" isInvalid={!!fieldErrors.password} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Password {editing && <span className="text-muted-foreground font-normal">(leave blank to keep)</span>}</Label>
                  <Input placeholder={editing ? "•••••••• (unchanged)" : "••••••••"} type="password" className="h-10" />
                  {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
                </TextField>
                <TextField name="url" type="url" defaultValue={editing?.url ?? ""} isInvalid={!!fieldErrors.url} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">URL (optional)</Label>
                  <Input placeholder="https://..." type="url" className="h-10" />
                  {fieldErrors.url && <FieldError>{fieldErrors.url}</FieldError>}
                </TextField>
                <TextField name="description" defaultValue={editing?.description ?? ""} isInvalid={!!fieldErrors.description} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Description</Label>
                  <TextArea placeholder="Notes, recovery codes, 2FA hints…" rows={3} />
                  {fieldErrors.description && <FieldError>{fieldErrors.description}</FieldError>}
                </TextField>
              </div>
              <div className="flex gap-3 p-4 sm:p-6 pt-4 border-t border-border shrink-0 bg-card">
                <Button variant="tertiary" type="button" onPress={() => { setIsAddOpen(false); setEditing(null); }} className="flex-1 h-10">Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1 h-10 font-medium">{editing ? "Save changes" : "Save account"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]" onClick={() => setTransferOpen(null)} role="dialog" aria-modal="true">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md p-4 sm:p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowsRightLeftIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Transfer {transferOpen.ids.length} account(s)</h3>
                <p className="text-sm text-muted-foreground">Choose a target space</p>
              </div>
            </div>
            <Select selectedKey={transferTarget} onSelectionChange={(k) => setTransferTarget(String(k))} className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Target space</Label>
              <Select.Trigger className="bg-card border border-border text-foreground h-10">
                <Select.Value className="text-foreground" />
              </Select.Trigger>
              <Select.Popover className="bg-popover border border-border shadow-sm">
                <ListBox className="p-1">
                  {allSpaces.filter((s) => s.id !== space.id).map((s) => (
                    <ListBox.Item key={s.id} id={s.id} className="text-popover-foreground data-[focused]:bg-muted">{s.name} — {s.type}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <div className="flex gap-3 pt-2">
              <Button variant="tertiary" className="flex-1" onPress={() => setTransferOpen(null)} isDisabled={isTransferring}>Cancel</Button>
              <Button variant="primary" className="flex-1" isDisabled={!transferTarget || isTransferring} onPress={handleTransfer}>{isTransferring ? "Transferring…" : "Transfer"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Single delete confirm — alert modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]" onClick={() => !isDeleting && setDeleteTarget(null)} role="alertdialog" aria-modal="true" aria-label="Confirm delete">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 p-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground">Delete account?</h3>
                <p className="text-sm text-muted-foreground mt-1">This will permanently delete <span className="font-medium text-foreground">{deleteTarget.title ?? deleteTarget.email}</span>. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0 sm:pt-2">
              <Button variant="tertiary" className="flex-1 h-10" onPress={() => setDeleteTarget(null)} isDisabled={isDeleting}>Cancel</Button>
              <Button variant="primary" className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium" onPress={confirmSingleDelete} isDisabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]" onClick={() => !isDeleting && setBulkDeleteOpen(false)} role="alertdialog" aria-modal="true" aria-label="Confirm bulk delete">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 p-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground">Delete {selected.size} account(s)?</h3>
                <p className="text-sm text-muted-foreground mt-1">This will permanently delete the selected accounts. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0 sm:pt-2">
              <Button variant="tertiary" className="flex-1 h-10" onPress={() => setBulkDeleteOpen(false)} isDisabled={isDeleting}>Cancel</Button>
              <Button variant="primary" className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium" onPress={confirmBulkDelete} isDisabled={isDeleting}>{isDeleting ? "Deleting…" : `Delete (${selected.size})`}</Button>
            </div>
          </div>
        </div>
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={() => setImportOpen(false)} role="dialog" aria-modal="true">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-5xl max-h-[90dvh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Import accounts</h3>
                <p className="text-xs text-muted-foreground">Upload txt (CSV or JSON), review, edit or remove rows, then import.</p>
              </div>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => setImportOpen(false)} aria-label="Close">✕</Button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input ref={fileRef} type="file" accept=".txt,.csv,.json" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                <Button variant="tertiary" onPress={() => fileRef.current?.click()} className="shrink-0">Choose txt file</Button>
                <span className="text-sm text-muted-foreground truncate">{importFileName || "No file chosen"}</span>
                <span className="ml-auto text-xs text-muted-foreground hidden sm:block">Supports: account;password & title,email,password,url,description,category or JSON</span>
              </div>
              {importError && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{importError}</p>}

              {importRows.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                      <thead className="bg-muted/40 border-b border-border">
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left font-medium px-3 py-2 w-[140px]">Title</th>
                          <th className="text-left font-medium px-3 py-2">Login</th>
                          <th className="text-left font-medium px-3 py-2">Password</th>
                          <th className="text-left font-medium px-3 py-2">URL</th>
                          <th className="text-left font-medium px-3 py-2">Note</th>
                          <th className="text-left font-medium px-3 py-2 w-[120px]">Category</th>
                          <th className="px-3 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {importRows.map((r) => (
                          <tr key={r.uid} className="hover:bg-muted/20">
                            <td className="px-2 py-1.5"><Input value={r.title} onChange={(e) => updateImportRow(r.uid, { title: (e.target as HTMLInputElement).value })} placeholder="Title" className="h-8 text-sm" /></td>
                            <td className="px-2 py-1.5"><Input value={r.email} onChange={(e) => updateImportRow(r.uid, { email: (e.target as HTMLInputElement).value })} placeholder="username" className="h-8 text-sm" /></td>
                            <td className="px-2 py-1.5"><Input value={r.password} onChange={(e) => updateImportRow(r.uid, { password: (e.target as HTMLInputElement).value })} placeholder="••••" className="h-8 text-sm" /></td>
                            <td className="px-2 py-1.5"><Input value={r.url} onChange={(e) => updateImportRow(r.uid, { url: (e.target as HTMLInputElement).value })} placeholder="https://" className="h-8 text-sm" /></td>
                            <td className="px-2 py-1.5"><Input value={r.description} onChange={(e) => updateImportRow(r.uid, { description: (e.target as HTMLInputElement).value })} placeholder="note" className="h-8 text-sm" /></td>
                            <td className="px-2 py-1.5"><Input value={r.category} onChange={(e) => updateImportRow(r.uid, { category: (e.target as HTMLInputElement).value })} placeholder="gmail" className="h-8 text-sm" /></td>
                            <td className="px-2 py-1.5"><Button size="sm" variant="tertiary" onPress={() => setImportRows((p) => p.filter((x) => x.uid !== r.uid))} className="h-8">Remove</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t border-border">
                    <span className="text-xs text-muted-foreground">{importRows.length} rows to import</span>
                    <Button size="sm" variant="tertiary" onPress={() => setImportRows([])}>Clear all</Button>
                  </div>
                </div>
              )}
              {importRows.length === 0 && !importError && <p className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-8 text-center">Choose a txt file to preview. You can edit any cell or remove rows before importing.</p>}
            </div>

            <div className="flex gap-3 p-4 sm:p-6 border-t border-border shrink-0 bg-card">
              <Button variant="tertiary" className="flex-1" onPress={() => setImportOpen(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" isDisabled={importRows.length === 0} onPress={confirmImport}>Import {importRows.length ? `(${importRows.length})` : ""}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
