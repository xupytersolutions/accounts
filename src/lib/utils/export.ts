import { csvEscape } from "./csv";
import type { VaultEntry } from "@/lib/types";

/**
 * Exports entries to CSV file
 */
export function exportEntriesToFile(
  entries: VaultEntry[],
  spaceName: string
) {
  const header = ["title", "email", "password", "url", "description", "category"]
    .map(csvEscape)
    .join(",");

  const lines = entries.map((e) => {
    const cat = (e as any).categoryRef?.name ?? e.category ?? "";
    return [
      e.title ?? "",
      e.email,
      e.password,
      e.url ?? "",
      e.description ?? "",
      cat,
    ]
      .map(csvEscape)
      .join(",");
  });

  const content = [header, ...lines].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${spaceName.replace(/\s+/g, "_")}_export.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
