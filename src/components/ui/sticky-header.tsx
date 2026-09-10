import { PageHeader } from "./page-header";

type StickyHeaderProps = {
  title?: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  badge?: { label: string };
  action?: React.ReactNode;
  toolbar?: React.ReactNode;
};

export function StickyHeader({ title, description, breadcrumbs, badge, action, toolbar }: StickyHeaderProps) {
  return (
    <div className="sticky top-[80px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-2 mb-2 bg-background/95 backdrop-blur">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} badge={badge} action={action} />
      {toolbar}
    </div>
  );
}
