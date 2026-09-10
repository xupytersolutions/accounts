"use client";
import { useQuery } from "@tanstack/react-query";
import { qk } from "./keys";
import * as api from "@/lib/api/spaces";

export function useSpace(id: string) {
  return useQuery({
    queryKey: qk.space(id),
    queryFn: () => api.getSpace(id),
    enabled: !!id,
  });
}
