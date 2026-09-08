import { COLORS } from "@/lib/constants/icons";
import { Label } from "@heroui/react";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
};

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              value === color
                ? "border-foreground scale-110"
                : "border-white dark:border-border"
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          >
            {value === color && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
