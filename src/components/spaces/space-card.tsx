"use client";

import { Card, Button, Dropdown } from "@heroui/react";
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Icon } from "@/components/ui/icon";
import { timeAgo } from "@/lib/utils/time";
import type { Space, SpaceCardProps } from "@/lib/types";

function getSpaceColor(space: Space) {
  if (space.color) return space.color;
  const map: Record<string, string> = {
    personal: "rgb(var(--space-personal))",
    company: "rgb(var(--space-company))",
    client: "rgb(var(--space-client))",
  };
  return map[space.type] ?? map.personal;
}

export function SpaceCard({ space, viewMode, onOpen, onEdit, onDelete, onContextMenu }: SpaceCardProps) {
  const color = getSpaceColor(space);
  const isCompact = viewMode === "compact";

  return (
    <Card
      className={`w-full shadow-none hover:scale-[1.02] duration-300 transition-transform rounded-2xl group cursor-pointer ${isCompact ? "min-h-[48px]" : ""}`}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY); }}
      onClick={onOpen}
    >
      <Card.Content className={isCompact ? "px-2.5 py-1.5 flex flex-row items-center gap-2" : "p-2 flex flex-col gap-3"}>
        {isCompact ? (
          <>
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: color }}>
              {space.icon ? <Icon icon={space.icon} className="w-3.5 h-3.5 text-white" /> : <span className="font-bold text-[11px]">{space.name.charAt(0).toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{space.name}</h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="capitalize text-primary">{space.type}</span>
                <span>•</span>
                <span>{space._count.entries} · {timeAgo(space.updatedAt)}</span>
              </div>
            </div>
            <Dropdown>
              <Button isIconOnly variant="tertiary" size="sm" aria-label="Space menu" className="h-7 w-7 min-w-7 shrink-0" onClick={(e) => e.stopPropagation()}>
                <EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl min-w-[180px]">
                <Dropdown.Menu aria-label="Space actions" className="p-1" onAction={(k) => { if (k === "open") onOpen(); if (k === "edit") onEdit(); if (k === "delete") onDelete(); }}>
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
                {space.icon ? <Icon icon={space.icon} className="w-5 h-5 text-white" /> : <span className="font-bold text-sm">{space.name.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Dropdown>
                  <Button isIconOnly variant="tertiary" size="sm" aria-label="Space menu" className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 min-w-7">
                    <EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Dropdown.Popover className="bg-popover border border-border shadow-sm rounded-xl min-w-[180px]">
                    <Dropdown.Menu aria-label="Space actions" className="p-1" onAction={(k) => { if (k === "open") onOpen(); if (k === "edit") onEdit(); if (k === "delete") onDelete(); }}>
                      <Dropdown.Item id="open" textValue="Open" className="rounded-lg text-foreground data-[focused]:bg-muted"><div className="flex items-center gap-2"><ArrowTopRightOnSquareIcon className="w-4 h-4" /><span>Open</span></div></Dropdown.Item>
                      <Dropdown.Item id="edit" textValue="Edit" className="rounded-lg text-foreground data-[focused]:bg-muted"><div className="flex items-center gap-2"><PencilSquareIcon className="w-4 h-4" /><span>Edit</span></div></Dropdown.Item>
                      <Dropdown.Item id="delete" textValue="Delete" className="rounded-lg text-destructive data-[focused]:bg-destructive/10 data-[focused]:text-destructive"><div className="flex items-center gap-2"><TrashIcon className="w-4 h-4" /><span>Delete</span></div></Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground truncate leading-5">{space.name}</h3>
              <span className="text-xs text-primary">{space.type}</span>
            </div>
            <div className="flex gap-6 flex-wrap items-center justify-between">
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-[60%]">{space.description?.trim() ? space.description : "no description"}</p>
              <div className="flex items-end justify-end flex-col text-[11px] text-muted-foreground">
                <span>{space._count.entries} accounts</span>
                <span>updated {timeAgo(space.updatedAt)}</span>
              </div>
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  );
}
