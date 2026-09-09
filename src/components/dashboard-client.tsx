"use client";
import {
  ArchiveBoxIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  FolderIcon,
  BriefcaseIcon,
  UserIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  StarIcon,
  RocketLaunchIcon,
  CreditCardIcon,
  KeyIcon,
  HomeIcon,
  LightBulbIcon,
  CubeIcon,
  HeartIcon,
  BoltIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, ArrowTopRightOnSquareIcon, ExclamationTriangleIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
import { Card, Button, Chip, TextField, Input, TextArea, Select, ListBox, Label, Dropdown, FieldError } from "@heroui/react";
import { spaceSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";

type Space = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  updatedAt: string | Date;
  _count: { entries: number };
};

const SPACE_COLORS = ["#006FEE", "#17C964", "#F5A524", "#F31260", "#7828C8", "#06B7DB", "#FF6900", "#9353D3"];

type SpaceIconOption = { id: string; label: string; Icon: React.ElementType | null };
const SPACE_ICON_OPTIONS: SpaceIconOption[] = [
  { id: "", label: "Initial (Aa)", Icon: null },
  { id: "FolderIcon", label: "Folder", Icon: FolderIcon },
  { id: "BriefcaseIcon", label: "Briefcase", Icon: BriefcaseIcon },
  { id: "UserIcon", label: "User", Icon: UserIcon },
  { id: "BuildingOffice2Icon", label: "Company", Icon: BuildingOffice2Icon },
  { id: "ShieldCheckIcon", label: "Shield", Icon: ShieldCheckIcon },
  { id: "StarIcon", label: "Star", Icon: StarIcon },
  { id: "RocketLaunchIcon", label: "Rocket", Icon: RocketLaunchIcon },
  { id: "CreditCardIcon", label: "Card", Icon: CreditCardIcon },
  { id: "KeyIcon", label: "Key", Icon: KeyIcon },
  { id: "HomeIcon", label: "Home", Icon: HomeIcon },
  { id: "LightBulbIcon", label: "Idea", Icon: LightBulbIcon },
  { id: "CubeIcon", label: "Cube", Icon: CubeIcon },
  { id: "HeartIcon", label: "Heart", Icon: HeartIcon },
  { id: "BoltIcon", label: "Bolt", Icon: BoltIcon },
  { id: "GlobeAltIcon", label: "Globe", Icon: GlobeAltIcon },
  { id: "DevicePhoneMobileIcon", label: "Mobile", Icon: DevicePhoneMobileIcon },
];

const SPACE_ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(
  SPACE_ICON_OPTIONS.filter((o) => o.id && o.Icon).map((o) => [o.id, o.Icon as React.ElementType])
);

function SpaceIcon({ icon, className = "w-5 h-5" }: { icon: string | null; className?: string }) {
  const Comp = icon ? SPACE_ICON_MAP[icon] : null;
  if (Comp) return <Comp className={className} />;
  // fallback for legacy emoji values (e.g. 📁 stored before heroicons migration)
  if (icon && !SPACE_ICON_MAP[icon] && icon.length <= 4) return <span className="text-lg leading-none">{icon}</span>;
  return null;
}

function timeAgo(d: string | Date) {
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

type ViewMode = "comfortable" | "compact";
export function DashboardClient({ spaces, createSpace, deleteSpace, updateSpace }: { spaces: Space[]; createSpace: (fd: FormData) => Promise<void>; deleteSpace: (id: string) => Promise<void>; updateSpace: (fd: FormData) => Promise<void> }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");
  const [ctx, setCtx] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createColor, setCreateColor] = useState<string>(SPACE_COLORS[0]);
  const [createIcon, setCreateIcon] = useState<string>("");
  const [editColor, setEditColor] = useState<string>(SPACE_COLORS[0]);
  const [editIcon, setEditIcon] = useState<string>("");
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  // derived filtered & sorted list — scalable filter pane can add more criteria here
  const filteredSpaces = spaces
    .filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "entries") return b._count.entries - a._count.entries;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (sortBy !== "updated" ? 1 : 0);
  useEffect(() => {
    const v = localStorage.getItem("vaulta:spacesView") as ViewMode | null;
    if (v === "compact" || v === "comfortable") setViewMode(v);
  }, []);
  useEffect(() => {
    localStorage.setItem("vaulta:spacesView", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!isCreateModalOpen && !editingSpace && !deleteTarget) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsCreateModalOpen(false); setEditingSpace(null); setDeleteTarget(null); } };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [isCreateModalOpen, editingSpace, deleteTarget]);

  useEffect(() => {
    if (editingSpace) {
      setEditColor(editingSpace.color || SPACE_COLORS[0]);
      setEditIcon(editingSpace.icon || "");
      setEditFieldErrors({});
    } else {
      setEditFieldErrors({});
    }
  }, [editingSpace]);

  useEffect(() => {
    if (isCreateModalOpen) {
      setCreateColor(SPACE_COLORS[0]);
      setCreateIcon("");
      setCreateFieldErrors({});
    } else {
      setCreateFieldErrors({});
    }
  }, [isCreateModalOpen]);

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
    if (!ctx) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-ctx-menu]")) setCtx(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCtx(null); };
    const onScroll = () => setCtx(null);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [ctx]);

  const getSpaceColor = (space: Space) => {
    if (space.color) return space.color;

    // Use CSS custom properties for theme colors
    const colorMap: Record<string, string> = {
      personal: 'rgb(var(--space-personal))',
      company: 'rgb(var(--space-company))',
      client: 'rgb(var(--space-client))'
    };

    return colorMap[space.type] || colorMap.personal;
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Sticky header + toolbar: keeps Search/Filters/Add accessible while scrolling */}
      <div className="sticky top-[65px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-4 mb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <PageHeader
          title="Spaces"
          description="Organize your credentials by personal, company or clients."
          action={
            <Button
              onPress={() => setIsCreateModalOpen(true)}
              className="text-primary-foreground font-medium bg-primary hover:bg-primary-hover flex items-center gap-2"
            >
              <PlusIcon />
              <span>Space</span>
            </Button>
          }
        />

        {/* Search + Filter + View toggle — sticky */}
        <div className="flex gap-2 sm:gap-3 items-center">
          <div className="flex-1 relative min-w-0">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search spaces..."
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
              className="pl-10 w-full"
              aria-label="Search spaces"
            />
          </div>
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shrink-0">
            <button
              aria-label="Comfortable view"
              aria-pressed={viewMode === "comfortable"}
              onClick={() => setViewMode("comfortable")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "comfortable" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              title="Comfortable"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              aria-label="Compact view"
              aria-pressed={viewMode === "compact"}
              onClick={() => setViewMode("compact")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "compact" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              title="Compact"
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="relative shrink-0" data-filter-trigger>
            <Button
              variant="tertiary"
              onPress={() => setFilterOpen((v) => !v)}
              className="h-10 px-4 gap-2 bg-card border border-border shadow-none rounded-xl text-foreground hover:bg-muted shrink-0"
              aria-expanded={filterOpen}
              aria-controls="filter-pane"
            >
              <FunnelIcon />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{activeFilterCount}</span>}
            </Button>
          {filterOpen && (
            <div
              id="filter-pane"
              data-filter-pane
              className="absolute right-0 top-full mt-2 w-[320px] max-w-[min(320px,calc(100vw-2rem))] bg-popover border border-border shadow-sm rounded-xl p-4 z-20 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Filters</h4>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setTypeFilter("all"); setSortBy("updated"); setSearch(""); }} className="text-xs text-primary hover:underline">Clear all</button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                <Select selectedKey={typeFilter} onSelectionChange={(k) => setTypeFilter(String(k))} className="w-full">
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover className="bg-popover border border-border shadow-sm">
                    <ListBox className="p-1">
                      <ListBox.Item id="all" className="text-popover-foreground data-[focused]:bg-muted">All types</ListBox.Item>
                      <ListBox.Item id="personal" className="text-popover-foreground data-[focused]:bg-muted">Personal</ListBox.Item>
                      <ListBox.Item id="company" className="text-popover-foreground data-[focused]:bg-muted">Company</ListBox.Item>
                      <ListBox.Item id="client" className="text-popover-foreground data-[focused]:bg-muted">Client</ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Sort by</Label>
                <Select selectedKey={sortBy} onSelectionChange={(k) => setSortBy(String(k))} className="w-full">
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover className="bg-popover border border-border shadow-sm">
                    <ListBox className="p-1">
                      <ListBox.Item id="updated" className="text-popover-foreground data-[focused]:bg-muted">Last updated</ListBox.Item>
                      <ListBox.Item id="name" className="text-popover-foreground data-[focused]:bg-muted">Name</ListBox.Item>
                      <ListBox.Item id="entries" className="text-popover-foreground data-[focused]:bg-muted">Entries</ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Spaces Grid */}
      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <ArchiveBoxIcon />
          </div>
          <p className="text-base font-medium text-foreground mb-2">No spaces yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first space to get started</p>
          <Button
            onPress={() => setIsCreateModalOpen(true)}
            className="text-primary-foreground font-medium bg-primary hover:bg-primary-hover flex items-center gap-2"
          >
            <PlusIcon />
            <span>Space</span>
          </Button>
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl bg-muted/20">
          <p className="text-sm font-medium text-foreground mb-1">No matches</p>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting search or filters.</p>
          <Button variant="tertiary" onPress={() => { setSearch(""); setTypeFilter("all"); setSortBy("updated"); }}>Clear filters</Button>
        </div>
      ) : (
        <>
          <div className={`grid mb-8 ${viewMode === "compact" ? "grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"}`}>
            {filteredSpaces.map((s) => {
              const color = getSpaceColor(s);
              const isCompact = viewMode === "compact";
              return (
                <Card
                  key={s.id}
                  className={`w-full shadow-none hover:scale-[1.02] duration-300 transition-transform rounded-2xl group cursor-pointer ${isCompact ? "min-h-[48px]" : ""}`}
                  onContextMenu={(e) => { e.preventDefault(); setCtx({ id: s.id, x: e.clientX, y: e.clientY }); }}
                  onClick={() => router.push(`/spaces/${s.id}`)}
                >
                  <Card.Content className={isCompact ? "px-2.5 py-1.5 flex flex-row items-center gap-2" : "p-2 flex flex-col gap-3"}>
                    {isCompact ? (
                      <>
                        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: color }}>
                          {s.icon ? <SpaceIcon icon={s.icon} className="w-3.5 h-3.5 text-white" /> : <span className="font-bold text-[11px]">{s.name.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{s.name}</h3>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="capitalize text-primary">{s.type}</span>
                            <span>•</span>
                            <span>{s._count.entries} · {timeAgo(s.updatedAt)}</span>
                          </div>
                        </div>
                        <Dropdown>
                          <Button isIconOnly variant="tertiary" size="sm" aria-label="Space menu" className="h-7 w-7 min-w-7 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl min-w-[180px]">
                            <Dropdown.Menu aria-label="Space actions" className="p-1" onAction={(key) => { if (key === "open") router.push(`/spaces/${s.id}`); if (key === "edit") setEditingSpace(s); if (key === "delete") setDeleteTarget(s); }}>
                              <Dropdown.Item id="open" textValue="Open" className="rounded-lg text-foreground data-[focused]:bg-muted"><div className="flex items-center gap-2"><ArrowTopRightOnSquareIcon className="w-4 h-4" /><span>Open</span></div></Dropdown.Item>
                              <Dropdown.Item id="edit" textValue="Edit" className="rounded-lg text-foreground data-[focused]:bg-muted"><div className="flex items-center gap-2"><PencilSquareIcon className="w-4 h-4" /><span>Edit</span></div></Dropdown.Item>
                              <Dropdown.Item id="delete" textValue="Delete" className="rounded-lg text-destructive data-[focused]:bg-destructive/10 data-[focused]:text-destructive"><div className="flex items-center gap-2"><TrashIcon className="w-4 h-4" /><span>Delete</span></div></Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: color }}>
                            {s.icon ? <SpaceIcon icon={s.icon} className="w-5 h-5 text-white" /> : <span className="font-bold text-sm">{s.name.charAt(0).toUpperCase()}</span>}
                          </div>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Dropdown>
                              <Button isIconOnly variant="tertiary" size="sm" aria-label="Space menu" className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 min-w-7">
                                <EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl min-w-[180px]">
                                <Dropdown.Menu aria-label="Space actions" className="p-1" onAction={(key) => { if (key === "open") router.push(`/spaces/${s.id}`); if (key === "edit") setEditingSpace(s); if (key === "delete") setDeleteTarget(s); }}>
                                  <Dropdown.Item id="open" textValue="Open" className="rounded-lg text-foreground data-[focused]:bg-muted"><div className="flex items-center gap-2"><ArrowTopRightOnSquareIcon className="w-4 h-4" /><span>Open</span></div></Dropdown.Item>
                                  <Dropdown.Item id="edit" textValue="Edit" className="rounded-lg text-foreground data-[focused]:bg-muted"><div className="flex items-center gap-2"><PencilSquareIcon className="w-4 h-4" /><span>Edit</span></div></Dropdown.Item>
                                  <Dropdown.Item id="delete" textValue="Delete" className="rounded-lg text-destructive data-[focused]:bg-destructive/10 data-[focused]:text-destructive"><div className="flex items-center gap-2"><TrashIcon className="w-4 h-4" /><span>Delete</span></div></Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown.Popover>
                            </Dropdown>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground truncate leading-5">{s.name}</h3>
                          <span className="text-xs text-primary">{s.type}</span>
                        </div>
                        <div className="flex gap-6 flex-wrap items-center justify-between">
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-[60%]">{s.description?.trim() ? s.description : "no description"}</p>
                          <div className="flex items-end justify-end flex-col text-[11px] text-muted-foreground">
                            <span>{s._count.entries} accounts</span>
                            <span>updated {timeAgo(s.updatedAt)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
            {/* Create New Space Card */}
            <Card
              className={`border-2 border-dashed border-border bg-muted/20 hover:border-border-strong hover:bg-muted/30 transition-colors cursor-pointer shadow-none rounded-2xl flex flex-col justify-center h-full ${viewMode === "compact" ? "min-h-[48px]" : "min-h-[158px]"}`}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Card.Content className={`flex flex-col items-center justify-center text-center ${viewMode === "compact" ? "px-2.5 py-1.5" : "p-6 py-8"}`}>
                <div className={`${viewMode === "compact" ? "w-6 h-6 mb-1" : "w-12 h-12 mb-3"} rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center`}>
                  <svg className={`${viewMode === "compact" ? "w-3.5 h-3.5" : "w-6 h-6"} text-neutral-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className={`${viewMode === "compact" ? "text-xs" : "text-sm"} font-semibold text-neutral-900 dark:text-primary-foreground ${viewMode === "compact" ? "" : "mb-1"}`}>Create a new space</p>
                {viewMode !== "compact" && <p className="text-sm text-neutral-500 dark:text-neutral-400">Keep your credentials organized and secure.</p>}
              </Card.Content>
            </Card>
          </div>
          {ctx && (
            <div
              data-ctx-menu
              className="fixed z-40 min-w-[160px] bg-popover border border-border shadow-sm rounded-xl p-1 flex flex-col"
              style={{ left: Math.min(ctx.x, typeof window !== "undefined" ? window.innerWidth - 170 : ctx.x), top: ctx.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2"
                onClick={() => { setCtx(null); router.push(`/spaces/${ctx.id}`); }}
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                Open
              </button>
              <button
                className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2"
                onClick={() => {
                  const sp = spaces.find((s) => s.id === ctx.id) ?? filteredSpaces.find((s) => s.id === ctx.id);
                  if (sp) setEditingSpace(sp);
                  setCtx(null);
                }}
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                className="text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2"
                onClick={() => {
                  const sp = spaces.find((s) => s.id === ctx.id) ?? filteredSpaces.find((s) => s.id === ctx.id);
                  if (sp) setDeleteTarget(sp);
                  setCtx(null);
                }}
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]" onClick={() => !isDeleting && setDeleteTarget(null)} role="alertdialog" aria-modal="true" aria-label="Confirm delete space">
              <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground">Delete space?</h3>
                    <p className="text-sm text-muted-foreground mt-1">This will permanently delete <span className="font-medium text-foreground">{deleteTarget.name}</span> and all its accounts. This action cannot be undone.</p>
                  </div>
                </div>
                <div className="flex gap-3 p-6 pt-0 sm:pt-2">
                  <Button variant="tertiary" className="flex-1 h-10" onPress={() => setDeleteTarget(null)} isDisabled={isDeleting}>Cancel</Button>
                  <Button
                    variant="primary"
                    className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
                    isDisabled={isDeleting}
                    onPress={async () => {
                      setIsDeleting(true);
                      try {
                        await deleteSpace(deleteTarget.id);
                        setDeleteTarget(null);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                  >
                    {isDeleting ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Space Modal - responsive */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={() => setIsCreateModalOpen(false)} role="dialog" aria-modal="true">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-border p-6 shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">Create space</h3>
              </div>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => setIsCreateModalOpen(false)} aria-label="Close" className="shrink-0 -mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>

            <form noValidate action={async (fd) => {
              setCreateFieldErrors({});
              const toCheck = {
                name: String(fd.get("name") || "").trim(),
                type: String(fd.get("type") || "personal"),
                description: String(fd.get("description") || "").trim() || null,
                color: String(fd.get("color") || "").trim() || null,
                icon: String(fd.get("icon") || "").trim() || null,
              };
              const parsed = spaceSchema.safeParse(toCheck);
              if (!parsed.success) {
                const map: Record<string, string> = {};
                for (const iss of (parsed.error as any).issues as Array<{ path: string; message: string }>) {
                  if (!map[iss.path]) map[iss.path] = iss.message;
                }
                setCreateFieldErrors(map);
                return;
              }
              try {
                await createSpace(fd);
                setIsCreateModalOpen(false);
                setCreateFieldErrors({});
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Failed to create space";
                const lower = msg.toLowerCase();
                if (lower.includes("name")) setCreateFieldErrors({ name: msg });
                else if (lower.includes("description")) setCreateFieldErrors({ description: msg });
                else setCreateFieldErrors({ name: msg });
              }
            }} className="flex flex-col flex-1 min-h-0">
              <input type="hidden" name="color" value={createColor} />
              <input type="hidden" name="icon" value={createIcon} />
              <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
                <TextField name="name" isRequired isInvalid={!!createFieldErrors.name} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Space name</Label>
                  <Input placeholder="e.g. Client XYZ" />
                  {createFieldErrors.name && <FieldError>{createFieldErrors.name}</FieldError>}
                </TextField>

                <Select name="type" defaultSelectedKey="personal" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Type</Label>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
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
                    {SPACE_ICON_OPTIONS.map(({ id, label, Icon }) => (
                      <button
                        key={id || "none"}
                        type="button"
                        onClick={() => setCreateIcon(id)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center ${createIcon === id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"}`}
                        aria-label={label}
                        title={label}
                      >
                        {Icon ? <Icon className="w-5 h-5" /> : <span className="text-xs font-semibold">Aa</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPACE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCreateColor(c)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${createColor === c ? "border-foreground scale-110" : "border-white dark:border-border"}`}
                        style={{ backgroundColor: c }}
                        aria-label={`Color ${c}`}
                      >
                        {createColor === c && <span className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: createColor }}>
                      {createIcon ? <SpaceIcon icon={createIcon} className="w-4 h-4 text-white" /> : <span className="text-xs font-semibold">Aa</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                </div>

                <TextField name="description" isInvalid={!!createFieldErrors.description} validationBehavior="aria" className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Description</Label>
                  <TextArea
                    placeholder="Optional note about this space..."
                    rows={3}
                  />
                  {createFieldErrors.description && <FieldError>{createFieldErrors.description}</FieldError>}
                </TextField>
              </div>

              <div className="flex gap-3 p-6 pt-4 border-t border-border shrink-0 bg-card">
                <Button
                  variant="tertiary"
                  type="button"
                  onPress={() => setIsCreateModalOpen(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 text-primary-foreground font-medium bg-primary hover:bg-primary-hover"
                >
                  Create space
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Space Modal */}
      {editingSpace && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px] overflow-y-auto" onClick={() => setEditingSpace(null)} role="dialog" aria-modal="true">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 sm:slide-in-from-bottom-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-border p-6 shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">Edit space</h3>
                <p className="text-sm text-muted-foreground">Update space details.</p>
              </div>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => setEditingSpace(null)} aria-label="Close" className="shrink-0 -mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>

            <form noValidate key={editingSpace.id} action={async (fd) => {
              setEditFieldErrors({});
              const toCheck = {
                name: String(fd.get("name") || "").trim(),
                type: String(fd.get("type") || "personal"),
                description: String(fd.get("description") || "").trim() || null,
                color: String(fd.get("color") || "").trim() || null,
                icon: String(fd.get("icon") || "").trim() || null,
              };
              const parsed = spaceSchema.safeParse(toCheck);
              if (!parsed.success) {
                const map: Record<string, string> = {};
                for (const iss of (parsed.error as any).issues as Array<{ path: string; message: string }>) {
                  if (!map[iss.path]) map[iss.path] = iss.message;
                }
                setEditFieldErrors(map);
                return;
              }
              try {
                await updateSpace(fd);
                setEditingSpace(null);
                setEditFieldErrors({});
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Failed to update space";
                const lower = msg.toLowerCase();
                if (lower.includes("name")) setEditFieldErrors({ name: msg });
                else if (lower.includes("description")) setEditFieldErrors({ description: msg });
                else setEditFieldErrors({ name: msg });
              }
            }} className="flex flex-col flex-1 min-h-0">
              <input type="hidden" name="spaceId" value={editingSpace.id} />
              <input type="hidden" name="color" value={editColor} />
              <input type="hidden" name="icon" value={editIcon} />
              <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
                <TextField name="name" isRequired isInvalid={!!editFieldErrors.name} validationBehavior="aria" className="w-full" defaultValue={editingSpace.name}>
                  <Label className="text-sm font-medium text-foreground mb-2">Space name</Label>
                  <Input placeholder="e.g. Client XYZ" />
                  {editFieldErrors.name && <FieldError>{editFieldErrors.name}</FieldError>}
                </TextField>

                <Select name="type" defaultSelectedKey={editingSpace.type} className="w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Type</Label>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
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
                    {SPACE_ICON_OPTIONS.map(({ id, label, Icon }) => (
                      <button
                        key={id || "none-edit"}
                        type="button"
                        onClick={() => setEditIcon(id)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center ${editIcon === id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted text-muted-foreground"}`}
                        aria-label={label}
                        title={label}
                      >
                        {Icon ? <Icon className="w-5 h-5" /> : <span className="text-xs font-semibold">Aa</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPACE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${editColor === c ? "border-foreground scale-110" : "border-white dark:border-border"}`}
                        style={{ backgroundColor: c }}
                        aria-label={`Color ${c}`}
                      >
                        {editColor === c && <span className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: editColor }}>
                      {editIcon ? <SpaceIcon icon={editIcon} className="w-4 h-4 text-white" /> : <span className="text-xs font-semibold">{editingSpace.name?.charAt(0).toUpperCase() ?? "Aa"}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                </div>

                <TextField name="description" isInvalid={!!editFieldErrors.description} validationBehavior="aria" className="w-full" defaultValue={editingSpace.description ?? ""}>
                  <Label className="text-sm font-medium text-foreground mb-2">Description</Label>
                  <TextArea
                    placeholder="Optional note about this space..."
                    rows={3}
                  />
                  {editFieldErrors.description && <FieldError>{editFieldErrors.description}</FieldError>}
                </TextField>
              </div>

              <div className="flex gap-3 p-6 pt-4 border-t border-border shrink-0 bg-card">
                <Button
                  variant="tertiary"
                  type="button"
                  onPress={() => setEditingSpace(null)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 text-primary-foreground font-medium bg-primary hover:bg-primary-hover"
                >
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
