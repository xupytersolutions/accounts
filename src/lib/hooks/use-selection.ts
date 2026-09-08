import { useState, useCallback } from "react";

/**
 * Manages multi-select state
 */
export function useSelection(totalCount: number, ids: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === totalCount) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ids));
    }
  }, [selected.size, totalCount, ids]);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return {
    selected,
    toggle,
    toggleAll,
    clear,
    remove,
  };
}
