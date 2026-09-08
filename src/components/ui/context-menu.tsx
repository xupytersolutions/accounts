import { useOutsideClick } from "@/lib/hooks/use-outside-click";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "danger";
  onClick: () => void;
};

type ContextMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  items: MenuItem[];
};

export function ContextMenu({ isOpen, onClose, x, y, items }: ContextMenuProps) {
  useOutsideClick(isOpen, onClose, "[data-context-menu]");

  if (!isOpen) return null;

  const safeX = Math.min(x, typeof window !== "undefined" ? window.innerWidth - 190 : x);

  return (
    <div
      data-context-menu
      className="fixed z-40 min-w-[180px] bg-popover border border-border shadow-sm rounded-xl p-1 flex flex-col"
      style={{ left: safeX, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
            item.variant === "danger"
              ? "hover:bg-destructive/10 text-destructive"
              : "hover:bg-muted text-foreground"
          }`}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
