export type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  logoUrl: string | null;
};

export type VaultEntry = {
  id: string;
  title: string | null;
  email: string;
  password: string;
  description: string | null;
  url: string | null;
  category: string | null;
  icon: string | null;
  color: string | null;
  logoUrl: string | null;
  categoryId: string | null;
  categoryRef?: Category | null;
  updatedAt?: string | Date;
};

export type Space = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  updatedAt: string | Date;
  _count: { entries: number };
};

export type SpaceWithEntries = Omit<Space, "_count"> & {
  entries: VaultEntry[];
};

export type SpaceOption = {
  id: string;
  name: string;
  type: string;
};

export type ImportRow = {
  uid: string;
  title: string;
  email: string;
  password: string;
  url: string;
  description: string;
  category: string;
};

export type IconOption = {
  id: string;
  label: string;
  Icon: React.ElementType | null;
};

export type DashboardClientProps = {
  spaces: Space[];
  createSpace: (fd: FormData) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  updateSpace: (fd: FormData) => Promise<void>;
};

export type ViewMode = "comfortable" | "compact";

export type SpaceCardProps = {
  space: Space;
  viewMode: ViewMode;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onContextMenu: (x: number, y: number) => void;
};

export type SpaceFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; type: string; description?: string | null; color?: string | null; icon?: string | null }) => Promise<void>;
  initialData?: Space | null;
  title: string;
  submitLabel: string;
  isPending?: boolean;
};

export type PasswordGeneratorProps = { onChoose?: (pwd: string) => void; hideAddToSpace?: boolean };

export type SpaceClientProps = {
  space: SpaceWithEntries;
  allSpaces: SpaceOption[];
  allCategories: Category[];
  createEntry: (fd: FormData) => Promise<void>;
  deleteEntry: (entryId: string, spaceId: string) => Promise<void>;
  transferEntry: (entryId: string, targetSpaceId: string) => Promise<void>;
  bulkCreateEntries: (spaceId: string, entries: Array<{ title?: string | null; email: string; password: string; url?: string | null; description?: string | null; category?: string | null; icon?: string | null; color?: string | null; categoryId?: string | null }>) => Promise<void>;
  bulkDeleteEntries: (entryIds: string[], spaceId: string) => Promise<void>;
  bulkTransferEntries: (entryIds: string[], targetSpaceId: string) => Promise<void>;
};
