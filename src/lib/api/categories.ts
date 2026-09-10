import { apiFetch } from "./client";
import type { Category } from "@/lib/types";

export function listCategories() {
  return apiFetch<{ categories: Category[] }>("/api/categories");
}
