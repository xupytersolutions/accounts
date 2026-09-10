"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "./keys";
import * as api from "@/lib/api/spaces";

export function useSpaces() {
  return useQuery({ queryKey: qk.spaces(), queryFn: () => api.listSpaces().then((r) => r.spaces) });
}

export function useCreateSpace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.createSpace>[0]) => api.createSpace(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.spaces() }),
  });
}

export function useUpdateSpace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof api.createSpace>[0]) => api.updateSpace(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.spaces() });
      qc.invalidateQueries({ queryKey: qk.space(vars.id) });
    },
  });
}

export function useDeleteSpace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSpace(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.spaces() }),
  });
}
