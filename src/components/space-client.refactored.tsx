"use client";
import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { useState, useRef } from "react";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowsRightLeftIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

// Types
import type { VaultEntry, Category, SpaceWithEntries, SpaceOption } from "@/lib/types";

// Hooks
import { useSelection, useModalLock, useOutsideClick } from "@/lib/hooks";

// Utils
import { parseImportText, exportEntriesToFile } from "@/lib/utils";

// Components
import { AccountCard } from "@/components/account/account-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContextMenu } from "@/components/ui/context-menu";

type SpaceClientProps = {
  space: SpaceWithEntries;
  allSpaces: SpaceOption[];
  allCategories: Category[];
  createEntry: (fd: FormData) => Promise<void>;
  deleteEntry: (entryId: string, spaceId: string) => Promise<void>;
  transferEntry: (entryId: string, targetSpaceId: string) => Promise<void>;
  bulkCreateEntries: (
    spaceId: string,
    entries: Array<{
      title?: string | null;
      email: string;
      password: string;
      url?: string | null;
      description?: string | null;
      category?: string | null;
    }>
  ) => Promise<void>;
  bulkDeleteEntries: (entryIds: string[], spaceId: string) => Promise<void>;
  bulkTransferEntries: (entryIds: string[], targetSpaceId: string) => Promise<void>;
};

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
}: SpaceClientProps) {
  // Selection state
  const { selected, toggle, toggleAll, clear, remove } = useSelection(
    space.entries.length,
    space.entries.map((e) => e.id)
  );

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<VaultEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaultEntry | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Context menu state
  const [entryCtx, setEntryCtx] = useState<{ id: string; x: number; y: number } | null>(
    null
  );

  // Import/Export states
  const [importOpen, setImportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Transfer state
  const [transferOpen, setTransferOpen] = useState<{ ids: string[] } | null>(null);
  const [transferTarget, setTransferTarget] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Handle context menu close
  useOutsideClick(!!entryCtx, () => setEntryCtx(null), "[data-context-menu]");

  // Handlers
  const handleExport = () => {
    exportEntriesToFile(space.entries, space.name);
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEntry(deleteTarget.id, space.id);
      remove(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteEntries(Array.from(selected), space.id);
      clear();
      setBulkDeleteOpen(false);
    } finally {
      setIsDeleting(false);
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
      clear();
      setTransferOpen(null);
      setTransferTarget("");
    } finally {
      setIsTransferring(false);
    }
  };

  const entryCtxEntry = entryCtx
    ? space.entries.find((e) => e.id === entryCtx.id) ?? null
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm mb-6 sm:mb-8 min-w-0">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Spaces</span>
        </Link>
        <span className="text-border-strong shrink-0">/</span>
        <span className="font-semibold text-foreground truncate min-w-0 max-w-[50vw] sm:max-w-none">
          {space.name}
        </span>
        <Chip
          size="sm"
          variant="soft"
          className="capitalize bg-muted text-muted-foreground border border-border shrink-0"
        >
          {space.type}
        </Chip>
      </div>

      {/* Main Card */}
      <Card className="border border-border bg-card shadow-sm w-full min-w-0 p-0">
        <Card.Header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-7 py-4 sm:py-5 border-b border-border">
          <div className="flex gap-1 flex-col">
            <Card.Title className="text-base sm:text-xl font-semibold text-foreground truncate min-w-0">
              Accounts in {space.name}
            </Card.Title>
            <span className="text-sm text-muted-foreground">
              {space.entries.length} total
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onPress={() => {
                setEditing(null);
                setIsAddOpen(true);
              }}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium h-9"
            >
              + Account
            </Button>
            {/* TODO: Add Dropdown menu for bulk actions */}
          </div>
        </Card.Header>

        <Card.Content className="p-0">
          {space.entries.length === 0 ? (
            <div className="px-4 sm:px-7 py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
                <LockClosedIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No accounts yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first account.
              </p>
            </div>
          ) : (
            <div>
              {/* Select All Bar */}
              <div className="flex items-center justify-between px-4 bg-muted/20 border border-border">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.size === space.entries.length && space.entries.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border h-4 w-4"
                  />
                  Select all
                </label>
                <span className="text-xs text-muted-foreground">
                  {selected.size} selected
                </span>
              </div>

              {/* Accounts List */}
              <div className="space-y-2">
                {space.entries.map((entry) => (
                  <AccountCard
                    key={entry.id}
                    entry={entry}
                    isSelected={selected.has(entry.id)}
                    onToggleSelect={() => toggle(entry.id)}
                    onMenuClick={(x, y) => setEntryCtx({ id: entry.id, x, y })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setEntryCtx({ id: entry.id, x: e.clientX, y: e.clientY });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Context Menu */}
      {entryCtx && entryCtxEntry && (
        <ContextMenu
          isOpen={!!entryCtx}
          onClose={() => setEntryCtx(null)}
          x={entryCtx.x}
          y={entryCtx.y}
          items={[
            {
              id: "edit",
              label: "Edit",
              icon: <PencilSquareIcon className="w-4 h-4" />,
              onClick: () => {
                setEditing(entryCtxEntry);
                setIsAddOpen(true);
              },
            },
            {
              id: "transfer",
              label: "Transfer",
              icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
              onClick: () => {
                setTransferOpen({ ids: [entryCtxEntry.id] });
              },
            },
            {
              id: "delete",
              label: "Delete",
              icon: <TrashIcon className="w-4 h-4" />,
              variant: "danger",
              onClick: () => {
                setDeleteTarget(entryCtxEntry);
              },
            },
          ]}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSingle}
        title="Delete account?"
        description={`This will permanently delete ${deleteTarget?.title || deleteTarget?.email}. This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete accounts?"
        description={`This will permanently delete ${selected.size} account${selected.size > 1 ? "s" : ""}. This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* TODO: Add modals for Create/Edit, Import, Transfer */}
    </div>
  );
}
