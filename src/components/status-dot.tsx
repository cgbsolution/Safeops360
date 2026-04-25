import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "critical" | "info" | "neutral";

export function StatusDot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  const color: Record<Tone, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
    info: "bg-sky-500",
    neutral: "bg-muted-foreground",
  };
  return (
    <span className={cn("relative inline-flex h-2 w-2 shrink-0 rounded-full", color[tone], className)}>
      {(tone === "critical" || tone === "warning") && (
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", color[tone])} />
      )}
    </span>
  );
}
