import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "critical" | "success" | "violet";
  trend?: { value: number; direction: "up" | "down"; good?: "up" | "down" };
}

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "from-primary/15 to-primary/5 text-primary",
  warning: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
  critical: "from-red-500/15 to-red-500/5 text-red-600 dark:text-red-400",
  success: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  violet: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
};

const accentClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-primary",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  success: "bg-emerald-500",
  violet: "bg-violet-500",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  trend,
}: KpiCardProps) {
  const isPositive =
    trend?.direction === (trend?.good ?? "up") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
  const TrendIcon = trend?.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-glow">
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100",
          accentClasses[tone],
        )}
      />
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                  isPositive,
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {trend.value}%
              </span>
            )}
          </div>
          {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
        </div>

        {Icon && (
          <div
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-black/[0.03]",
              toneClasses[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
