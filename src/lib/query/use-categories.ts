"use client";
import { useQuery } from "@tanstack/react-query";
import { qk } from "./keys";
import { listCategories } from "@/lib/api/categories";

export function useCategories() {
  return useQuery({ queryKey: qk.categories(), queryFn: () => listCategories().then((r) => r.categories) });
}
