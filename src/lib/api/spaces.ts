import { apiFetch } from "./client";
import type { Space } from "@/lib/types";

export type SpacesResponse = { spaces: Space[] };
export type SpaceResponse = { space: Space };
export type SpaceDetailResponse = { space: Space; entries: import("@/lib/types").VaultEntry[]; allSpaces: import("@/lib/types").SpaceOption[]; allCategories: import("@/lib/types").Category[] };

export function listSpaces() {
  return apiFetch<SpacesResponse>("/api/spaces");
}
export function getSpace(id: string) {
  return apiFetch<SpaceDetailResponse>(`/api/spaces/${id}`);
}
export function createSpace(payload: { name: string; type: string; description?: string | null; color?: string | null; icon?: string | null }) {
  return apiFetch<SpaceResponse>("/api/spaces", { method: "POST", body: JSON.stringify(payload) });
}
export function updateSpace(id: string, payload: { name: string; type: string; description?: string | null; color?: string | null; icon?: string | null }) {
  return apiFetch<SpaceResponse>(`/api/spaces/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteSpace(id: string) {
  return apiFetch<{ ok: true }>(`/api/spaces/${id}`, { method: "DELETE" });
}
