import { apiFetch } from "./client";
import type { VaultEntry } from "@/lib/types";

export type EntriesResponse = { entries: VaultEntry[] };
export type EntryResponse = { entry: VaultEntry };

export function listEntries(spaceId: string) {
  return apiFetch<EntriesResponse>(`/api/spaces/${spaceId}/entries`);
}
export function createEntry(spaceId: string, payload: Record<string, unknown>) {
  return apiFetch<EntryResponse>(`/api/spaces/${spaceId}/entries`, { method: "POST", body: JSON.stringify(payload) });
}
export function updateEntry(entryId: string, payload: Record<string, unknown>) {
  return apiFetch<EntryResponse>(`/api/entries/${entryId}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteEntry(entryId: string) {
  return apiFetch<{ ok: true }>(`/api/entries/${entryId}`, { method: "DELETE" });
}
export function transferEntry(entryId: string, targetSpaceId: string) {
  return apiFetch<EntryResponse>(`/api/entries/${entryId}/transfer`, { method: "POST", body: JSON.stringify({ targetSpaceId }) });
}
export function bulkCreateEntries(spaceId: string, entries: Array<Record<string, unknown>>) {
  return apiFetch<EntriesResponse>(`/api/spaces/${spaceId}/entries/bulk`, { method: "POST", body: JSON.stringify({ entries }) });
}
export function bulkDeleteEntries(entryIds: string[], spaceId: string) {
  return apiFetch<{ ok: true }>("/api/entries/bulk-delete", { method: "POST", body: JSON.stringify({ entryIds, spaceId }) });
}
export function bulkTransferEntries(entryIds: string[], targetSpaceId: string) {
  return apiFetch<{ ok: true }>("/api/entries/bulk-transfer", { method: "POST", body: JSON.stringify({ entryIds, targetSpaceId }) });
}
