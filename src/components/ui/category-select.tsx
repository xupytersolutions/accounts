import { Select, ListBox, Label, Input, TextField } from "@heroui/react";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";
import { Icon } from "./icon";
import type { Category } from "@/lib/types";

type CategorySelectProps = {
  value: string;
  onChange: (categoryKey: string) => void;
  categories: Category[];
  customName: string;
  onCustomNameChange: (name: string) => void;
  icon: string;
  onIconChange: (icon: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  logoUrl: string | null;
};

export function CategorySelect({
  value,
  onChange,
  categories,
  customName,
  onCustomNameChange,
  icon,
  onIconChange,
  color,
  onColorChange,
  logoUrl,
}: CategorySelectProps) {
  const showCustomFields = value === "custom";
  const selectedCat = categories.find((c) => c.id === value);
  const previewIcon = showCustomFields ? icon : selectedCat?.icon || null;
  const previewColor = showCustomFields ? color : selectedCat?.color || color;
  const previewLogo = showCustomFields ? logoUrl : selectedCat?.logoUrl || null;

  return (
    <div className="space-y-4">
      <Select
        selectedKey={value}
        onSelectionChange={(k) => onChange(String(k))}
        className="w-full"
      >
        <Label className="text-sm font-medium text-foreground mb-2">
          Category
        </Label>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Popover className="bg-popover border border-border shadow-sm">
          <ListBox className="p-1">
            <ListBox.Item
              id="none"
              className="text-popover-foreground data-[focused]:bg-muted"
            >
              None
            </ListBox.Item>
            {categories.map((cat) => (
              <ListBox.Item
                key={cat.id}
                id={cat.id}
                className="text-popover-foreground data-[focused]:bg-muted"
              >
                <div className="flex items-center gap-2">
                  {cat.logoUrl ? (
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: cat.color || "#006FEE" }}
                    >
                      <img
                        src={cat.logoUrl}
                        alt=""
                        className="w-3 h-3 object-contain"
                      />
                    </div>
                  ) : cat.icon ? (
                    <Icon icon={cat.icon} className="w-4 h-4" />
                  ) : null}
                  {cat.name}
                </div>
              </ListBox.Item>
            ))}
            <ListBox.Item
              id="custom"
              className="text-popover-foreground data-[focused]:bg-muted border-t border-border mt-1 pt-1"
            >
              + Custom
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      {showCustomFields && (
        <>
          <TextField name="customCategoryName" isRequired className="w-full">
            <Label className="text-sm font-medium text-foreground mb-2">
              Category Name
            </Label>
            <Input
              value={customName}
              onChange={(e) => onCustomNameChange((e.target as HTMLInputElement).value)}
              placeholder="e.g. Banking"
            />
          </TextField>

          <IconPicker value={icon} onChange={onIconChange} label="Icon" />
          <ColorPicker value={color} onChange={onColorChange} label="Color" />
        </>
      )}

      {/* Preview */}
      <div className="flex items-center gap-2 pt-1">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-white overflow-hidden"
          style={{ backgroundColor: previewColor }}
        >
          {previewLogo ? (
            <img
              src={previewLogo}
              alt=""
              className="w-4 h-4 object-contain"
            />
          ) : previewIcon ? (
            <Icon icon={previewIcon} className="w-4 h-4 text-white" />
          ) : (
            <span className="text-xs font-semibold">Aa</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">Preview</span>
      </div>
    </div>
  );
}
