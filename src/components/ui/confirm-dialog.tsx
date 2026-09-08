import { Button } from "@heroui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useModalLock } from "@/lib/hooks/use-modal-lock";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  isLoading?: boolean;
  variant?: "danger" | "primary";
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  useModalLock(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]"
      onClick={() => !isLoading && onClose()}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              variant === "danger" ? "bg-destructive/10" : "bg-primary/10"
            }`}
          >
            <ExclamationTriangleIcon
              className={`w-5 h-5 ${
                variant === "danger" ? "text-destructive" : "text-primary"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="dialog-title"
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0 sm:pt-2">
          <Button
            variant="tertiary"
            className="flex-1 h-10"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className={`flex-1 h-10 font-medium ${
              variant === "danger"
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : ""
            }`}
            isDisabled={isLoading}
            onPress={onConfirm}
          >
            {isLoading ? "Loading…" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
