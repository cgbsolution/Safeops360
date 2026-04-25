"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface MobileTopbarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  backHref?: string;
}

export function MobileTopbar({ title, subtitle, right, backHref }: MobileTopbarProps) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="grid h-9 w-9 place-items-center rounded-lg border bg-card transition-colors hover:bg-accent"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-tight">{title}</div>
          {subtitle && <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}
