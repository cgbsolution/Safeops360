"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

export const SEVERITY_COLORS: Record<string, string> = {
  compliance: "hsl(var(--severity-compliance))",
  observation: "hsl(var(--severity-observation))",
  ofi: "hsl(var(--severity-ofi))",
  nc_minor: "hsl(var(--severity-nc-minor))",
  nc_major: "hsl(var(--severity-nc-major))",
  low: "hsl(var(--severity-compliance))",
  medium: "hsl(var(--severity-ofi))",
  high: "hsl(var(--severity-nc-minor))",
  critical: "hsl(var(--severity-nc-major))",
};

function prettyLabel(v: string) {
  return v.replaceAll("_", " ");
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string; payload?: { label?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      {label && <div className="mb-1 font-semibold">{prettyLabel(String(label))}</div>}
      {payload.map((p, i) => {
        const name = p.payload?.label ?? p.name ?? "";
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{prettyLabel(String(name))}</span>
            <span className="ml-auto font-semibold tabular-nums">{p.value}</span>
          </div>
        );
      })}
    </div>
  );
}

interface Bucket {
  label: string;
  count: number;
}

export function ModernBarChart({
  data,
  color = CHART_COLORS[0],
  height = 280,
}: {
  data: Bucket[];
  color?: string;
  height?: number;
}) {
  const id = React.useId();
  const displayData = data.map((d) => ({ ...d, label: prettyLabel(d.label) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap={24}>
        <defs>
          <linearGradient id={`bar-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.45} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          width={30}
        />
        <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<ChartTooltip />} />
        <Bar
          dataKey="count"
          fill={`url(#bar-${id})`}
          radius={[8, 8, 0, 0]}
          maxBarSize={56}
          animationDuration={650}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ModernPieChart({
  data,
  colorMap,
  height = 280,
  variant = "donut",
}: {
  data: Bucket[];
  colorMap?: Record<string, string>;
  height?: number;
  variant?: "donut" | "pie";
}) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const displayData = data.map((d) => ({ ...d, label: prettyLabel(d.label) }));

  const colorFor = (key: string, idx: number) =>
    colorMap?.[key] ?? colorMap?.[prettyLabel(key)] ?? CHART_COLORS[idx % CHART_COLORS.length];

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={displayData}
            dataKey="count"
            nameKey="label"
            innerRadius={variant === "donut" ? 62 : 0}
            outerRadius={96}
            paddingAngle={variant === "donut" ? 2 : 0}
            stroke="hsl(var(--background))"
            strokeWidth={2}
            animationDuration={650}
          >
            {displayData.map((entry, idx) => (
              <Cell key={entry.label} fill={colorFor(data[idx].label, idx)} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            formatter={(v) => (
              <span className="text-muted-foreground">{String(v)}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {variant === "donut" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ marginTop: -24 }}>
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{total}</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">total</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModernAreaChart({
  data,
  height = 240,
  color = CHART_COLORS[0],
  xKey = "label",
  yKey = "count",
}: {
  data: Array<Record<string, number | string>>;
  height?: number;
  color?: string;
  xKey?: string;
  yKey?: string;
}) {
  const id = React.useId();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={30} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#area-${id})`}
          animationDuration={650}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
