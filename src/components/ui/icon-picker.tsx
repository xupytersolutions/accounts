import { ICON_OPTIONS } from "@/lib/constants/icons";
import { Label } from "@heroui/react";

type IconPickerProps = {
  value: string;
  onChange: (iconId: string) => void;
  label?: string;
};

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      <div className="flex flex-wrap gap-1.5">
        {ICON_OPTIONS.map(({ id, label: iconLabel, Icon }) => (
          <button
            key={id || "none"}
            type="button"
            onClick={() => onChange(id)}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
              value === id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted text-muted-foreground"
            }`}
            aria-label={iconLabel}
            title={iconLabel}
          >
            {Icon ? (
              <Icon className="w-5 h-5" />
            ) : (
              <span className="text-xs font-semibold">Aa</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
