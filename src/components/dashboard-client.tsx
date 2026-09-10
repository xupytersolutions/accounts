"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ArchiveBoxIcon, PencilSquareIcon, TrashIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { StickyHeader } from "@/components/ui/sticky-header";
import { SpacesToolbar } from "@/components/spaces/spaces-toolbar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SpaceCard } from "@/components/spaces/space-card";
import { SpaceFormDialog } from "@/components/spaces/space-form-dialog";
import { useViewMode } from "@/lib/hooks/use-view-mode";
import { useSpaceFilters } from "@/lib/hooks/use-space-filters";
import { useOutsideClick } from "@/lib/hooks/use-outside-click";
import type { DashboardClientProps, Space } from "@/lib/types";

export function DashboardClient({ spaces, createSpace, deleteSpace, updateSpace }: DashboardClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useViewMode("one-account:spacesView");
  const [ctx, setCtx] = useState<{ id: string; x: number; y: number } | null>(null);

  const { filteredSpaces, activeFilterCount } = useSpaceFilters(spaces, search, typeFilter, sortBy);

  useOutsideClick(filterOpen, () => setFilterOpen(false), "[data-filter-pane],[data-filter-trigger]");
  useOutsideClick(!!ctx, () => setCtx(null), "[data-ctx-menu]");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <StickyHeader
        title="Spaces"
        description="Organize your credentials by personal, company or clients."
        action={
          <Button onPress={() => setIsCreateOpen(true)} className="text-primary-foreground font-medium bg-primary hover:bg-primary-hover flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /><span>Space</span>
          </Button>
        }
        toolbar={
          <SpacesToolbar
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            filterOpen={filterOpen}
            onFilterOpenChange={setFilterOpen}
            activeFilterCount={activeFilterCount}
            onClearFilters={() => { setTypeFilter("all"); setSortBy("updated"); setSearch(""); }}
          />
        }
      />

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4"><ArchiveBoxIcon className="w-8 h-8 text-muted-foreground" /></div>
          <p className="text-base font-medium text-foreground mb-2">No spaces yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first space to get started</p>
          <Button onPress={() => setIsCreateOpen(true)} className="text-primary-foreground font-medium bg-primary hover:bg-primary-hover flex items-center gap-2"><PlusIcon className="w-4 h-4" /><span>Space</span></Button>
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl bg-muted/20">
          <p className="text-sm font-medium text-foreground mb-1">No matches</p><p className="text-sm text-muted-foreground mb-4">Try adjusting search or filters.</p>
          <Button variant="tertiary" onPress={() => { setSearch(""); setTypeFilter("all"); setSortBy("updated"); }}>Clear filters</Button>
        </div>
      ) : (
        <>
          <div className={`grid mb-8 ${viewMode === "compact" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"}`}>
            {filteredSpaces.map((s) => (
              <SpaceCard key={s.id} space={s} viewMode={viewMode} onOpen={() => router.push(`/spaces/${s.id}`)} onEdit={() => setEditingSpace(s)} onDelete={() => setDeleteTarget(s)} onContextMenu={(x, y) => setCtx({ id: s.id, x, y })} />
            ))}
            <Card className={`border-2 border-dashed border-border bg-muted/20 hover:border-border-strong hover:bg-muted/30 transition-colors cursor-pointer shadow-none rounded-2xl flex flex-col justify-center h-full ${viewMode === "compact" ? "min-h-[48px]" : "min-h-[158px]"}`} onClick={() => setIsCreateOpen(true)}>
              <Card.Content className={`flex flex-col items-center justify-center text-center ${viewMode === "compact" ? "px-2.5 py-1.5" : "p-6 py-8"}`}>
                <div className={`${viewMode === "compact" ? "w-6 h-6 mb-1" : "w-12 h-12 mb-3"} rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center`}><PlusIcon className={`${viewMode === "compact" ? "w-3.5 h-3.5" : "w-6 h-6"} text-neutral-500`} /></div>
                <p className={`${viewMode === "compact" ? "text-xs" : "text-sm"} font-semibold text-neutral-900 dark:text-primary-foreground ${viewMode === "compact" ? "" : "mb-1"}`}>Create a new space</p>
                {viewMode !== "compact" && <p className="text-sm text-neutral-500 dark:text-neutral-400">Keep your credentials organized and secure.</p>}
              </Card.Content>
            </Card>
          </div>
          {ctx && (
            <div data-ctx-menu className="fixed z-40 min-w-[160px] bg-popover border border-border shadow-sm rounded-xl p-1 flex flex-col" style={{ left: Math.min(ctx.x, typeof window !== "undefined" ? window.innerWidth - 170 : ctx.x), top: ctx.y }} onClick={(e) => e.stopPropagation()}>
              <button className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2" onClick={() => { setCtx(null); router.push(`/spaces/${ctx.id}`); }}><ArrowTopRightOnSquareIcon className="w-4 h-4" />Open</button>
              <button className="text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground flex items-center gap-2" onClick={() => { const sp = spaces.find((s) => s.id === ctx.id); if (sp) setEditingSpace(sp); setCtx(null); }}><PencilSquareIcon className="w-4 h-4" />Edit</button>
              <button className="text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2" onClick={() => { const sp = spaces.find((s) => s.id === ctx.id); if (sp) setDeleteTarget(sp); setCtx(null); }}><TrashIcon className="w-4 h-4" />Delete</button>
            </div>
          )}
        </>
      )}

      <SpaceFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={createSpace} title="Create space" submitLabel="Create space" />
      <SpaceFormDialog isOpen={!!editingSpace} onClose={() => setEditingSpace(null)} onSubmit={updateSpace} initialData={editingSpace} title="Edit space" submitLabel="Save changes" />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)} onConfirm={async () => { if (!deleteTarget) return; setIsDeleting(true); try { await deleteSpace(deleteTarget.id); setDeleteTarget(null); } finally { setIsDeleting(false); } }} title="Delete space?" description={`This will permanently delete ${deleteTarget?.name ?? ""} and all its accounts. This action cannot be undone.`} confirmText={isDeleting ? "Deleting…" : "Delete"} isLoading={isDeleting} variant="danger" />
    </div>
  );
}
