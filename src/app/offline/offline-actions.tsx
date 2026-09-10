"use client";

import Link from "next/link";
import { Button } from "@heroui/react";

export function OfflineActions() {
  return (
    <div className="mt-6 flex gap-2">
      <Link href="/">
        <Button variant="primary">Go home</Button>
      </Link>
      <Button variant="tertiary" onPress={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}
