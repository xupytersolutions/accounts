"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "./keys";
import * as api from "@/lib/api/entries";

export function useCreateEntry(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.createEntry(spaceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
      qc.invalidateQueries({ queryKey: qk.spaces() });
    },
  });
}

export function useUpdateEntry(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, ...payload }: { entryId: string } & Record<string, unknown>) => api.updateEntry(entryId, { ...payload, spaceId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
    },
  });
}

export function useDeleteEntry(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => api.deleteEntry(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
      qc.invalidateQueries({ queryKey: qk.spaces() });
    },
  });
}

export function useTransferEntry(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, targetSpaceId }: { entryId: string; targetSpaceId: string }) => api.transferEntry(entryId, targetSpaceId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
      qc.invalidateQueries({ queryKey: qk.space(vars.targetSpaceId) });
      qc.invalidateQueries({ queryKey: qk.spaces() });
    },
  });
}

export function useBulkCreateEntries(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries: Array<Record<string, unknown>>) => api.bulkCreateEntries(spaceId, entries),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
      qc.invalidateQueries({ queryKey: qk.spaces() });
    },
  });
}

export function useBulkDeleteEntries(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryIds: string[]) => api.bulkDeleteEntries(entryIds, spaceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
      qc.invalidateQueries({ queryKey: qk.spaces() });
    },
  });
}

export function useBulkTransferEntries(spaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryIds, targetSpaceId }: { entryIds: string[]; targetSpaceId: string }) => api.bulkTransferEntries(entryIds, targetSpaceId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: qk.space(spaceId) });
      qc.invalidateQueries({ queryKey: qk.space(vars.targetSpaceId) });
      qc.invalidateQueries({ queryKey: qk.spaces() });
    },
  });
}
