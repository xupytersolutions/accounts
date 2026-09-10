"use client";
import { Button, Select, ListBox, Label } from "@heroui/react";
import { FunnelIcon } from "@heroicons/react/24/solid";
import { SearchInput } from "@/components/ui/search-input";
import { ViewToggle } from "@/components/ui/view-toggle";
import type { ViewMode } from "@/lib/types";

type SpacesToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  filterOpen: boolean;
  onFilterOpenChange: (v: boolean) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
};

export function SpacesToolbar({ search, onSearchChange, viewMode, onViewModeChange, typeFilter, onTypeFilterChange, sortBy, onSortByChange, filterOpen, onFilterOpenChange, activeFilterCount, onClearFilters }: SpacesToolbarProps) {
  return (
    <div className="flex gap-2 sm:gap-3 items-center">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search spaces..." />
      <ViewToggle value={viewMode} onChange={onViewModeChange} />
      <div className="relative shrink-0" data-filter-trigger>
        <Button variant="tertiary" onPress={() => onFilterOpenChange(!filterOpen)} className="h-10 px-4 gap-2 bg-card border border-border shadow-none rounded-xl text-foreground hover:bg-muted shrink-0" aria-expanded={filterOpen}>
          <FunnelIcon className="w-4 h-4" /><span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{activeFilterCount}</span>}
        </Button>
        {filterOpen && (
          <div data-filter-pane className="absolute right-0 top-full mt-2 w-[320px] max-w-[min(320px,calc(100vw-2rem))] bg-popover border border-border shadow-sm rounded-xl p-4 z-20 flex flex-col gap-4">
            <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-foreground">Filters</h4>{activeFilterCount > 0 && <button onClick={onClearFilters} className="text-xs text-primary hover:underline">Clear all</button>}</div>
            <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Type</Label><Select selectedKey={typeFilter} onSelectionChange={(k) => onTypeFilterChange(String(k))} className="w-full"><Select.Trigger><Select.Value /></Select.Trigger><Select.Popover className="bg-popover border border-border shadow-sm"><ListBox className="p-1"><ListBox.Item id="all">All types</ListBox.Item><ListBox.Item id="personal">Personal</ListBox.Item><ListBox.Item id="company">Company</ListBox.Item><ListBox.Item id="client">Client</ListBox.Item></ListBox></Select.Popover></Select></div>
            <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Sort by</Label><Select selectedKey={sortBy} onSelectionChange={(k) => onSortByChange(String(k))} className="w-full"><Select.Trigger><Select.Value /></Select.Trigger><Select.Popover className="bg-popover border border-border shadow-sm"><ListBox className="p-1"><ListBox.Item id="updated">Last updated</ListBox.Item><ListBox.Item id="name">Name</ListBox.Item><ListBox.Item id="entries">Entries</ListBox.Item></ListBox></Select.Popover></Select></div>
          </div>
        )}
      </div>
    </div>
  );
}
