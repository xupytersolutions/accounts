import { useEffect, useState } from "react";
import { COLORS } from "@/lib/constants/icons";
import type { Category, VaultEntry } from "@/lib/types";

export function useCategoryForm(allCategories: Category[], editing: VaultEntry | null, isOpen: boolean, mode: "create" | "edit") {
  const [catKey, setCatKey] = useState("none");
  const [customName, setCustomName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "create" && !editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCatKey("none");
      setCustomName("");
      setIcon("");
      setLogoUrl(null);
      setColor(COLORS[0]);
    }
  }, [isOpen, editing, mode]);

  useEffect(() => {
    if (!editing || mode !== "edit") return;
    if (editing.categoryId) {
      const c = allCategories.find((x) => x.id === editing.categoryId);
      if (c) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCatKey(c.id); setIcon(c.icon || ""); setColor(c.color || COLORS[0]); setLogoUrl(c.logoUrl || null); setCustomName(""); return;
      }
    }
    if (editing.category) {
      const existing = allCategories.find((c) => c.name.toLowerCase() === editing.category!.toLowerCase());
      if (existing) { setCatKey(existing.id); setIcon(existing.icon || ""); setColor(existing.color || COLORS[0]); setLogoUrl(existing.logoUrl || null); setCustomName(""); return; }
      setCatKey("custom"); setCustomName(editing.category || ""); setIcon(editing.icon || ""); setColor(editing.color || COLORS[0]); setLogoUrl((editing as unknown as { logoUrl?: string | null }).logoUrl || null); return;
    }
    setCatKey("none"); setCustomName(""); setIcon(""); setLogoUrl(null); setColor(COLORS[0]);
  }, [editing, allCategories, mode]);

  useEffect(() => {
    if (catKey === "none" || catKey === "custom") { if (catKey === "none") setLogoUrl(null); return; }
    const cat = allCategories.find((c) => c.id === catKey);
    if (cat) { setIcon(cat.icon || ""); setColor(cat.color || COLORS[0]); setLogoUrl(cat.logoUrl || null); }
  }, [catKey, allCategories]);

  return { catKey, setCatKey, customName, setCustomName, icon, setIcon, color, setColor, logoUrl, setLogoUrl } as const;
}
