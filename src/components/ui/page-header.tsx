import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Chip } from "@heroui/react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  description?: string;
  badge?: {
    label: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
  };
  action?: React.ReactNode;
};

export function PageHeader({
  breadcrumbs,
  title,
  description,
  badge,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Breadcrumbs — desktop only */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="hidden sm:flex flex-wrap items-center gap-2 text-sm mb-4 min-w-0">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={index} className="flex items-center gap-2 min-w-0">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {index === 0 && <ArrowLeftIcon className="w-4 h-4" />}
                    <span>{crumb.label}</span>
                  </Link>
                ) : (
                  <span
                    className={`${
                      isLast
                        ? "font-semibold text-foreground truncate min-w-0 max-w-[50vw] sm:max-w-none"
                        : "text-muted-foreground shrink-0"
                    }`}
                  >
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <span className="text-border-strong shrink-0">/</span>
                )}
              </div>
            );
          })}
          {badge && (
            <Chip
              size="sm"
              variant="soft"
              className={`capitalize shrink-0 ${
                badge.variant === "primary"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : badge.variant === "success"
                  ? "bg-success/10 text-success border-success/20"
                  : badge.variant === "warning"
                  ? "bg-warning/10 text-warning border-warning/20"
                  : badge.variant === "danger"
                  ? "bg-danger/10 text-danger border-danger/20"
                  : "bg-muted text-muted-foreground border-border"
              } border`}
            >
              {badge.label}
            </Chip>
          )}
        </div>
      )}

      {/* Title, Description, and Action — stack on mobile for long titles, row on desktop; action right-aligned on both */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1 sm:mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {title}
              </h1>
              {!breadcrumbs && badge && (
                <Chip
                  size="sm"
                  variant="soft"
                  className={`capitalize shrink-0 ${
                    badge.variant === "primary"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : badge.variant === "success"
                      ? "bg-success/10 text-success border-success/20"
                      : badge.variant === "warning"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : badge.variant === "danger"
                      ? "bg-danger/10 text-danger border-danger/20"
                      : "bg-muted text-muted-foreground border-border"
                  } border`}
                >
                  {badge.label}
                </Chip>
              )}
            </div>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0 self-end sm:self-auto">{action}</div>}
        </div>
      )}
    </div>
  );
}
