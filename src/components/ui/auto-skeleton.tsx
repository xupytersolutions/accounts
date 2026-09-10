"use client";
import { AutoSkeleton } from "auto-skeleton-react";

export function SkeletonWrap({ loading, children, className }: { loading: boolean; children: React.ReactNode; className?: string }) {
  return (
    <AutoSkeleton loading={loading} config={{ animation: "pulse", baseColor: undefined }}>
      <div className={className}>{children}</div>
    </AutoSkeleton>
  );
}
