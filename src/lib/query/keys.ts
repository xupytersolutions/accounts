export const qk = {
  spaces: () => ["spaces"] as const,
  space: (id: string) => ["spaces", id] as const,
  categories: () => ["categories"] as const,
  entries: (spaceId: string) => ["entries", spaceId] as const,
};
