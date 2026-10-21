"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendChartPoint = {
  date: string;
  label: string;
  fullLabel: string;
  count: number;
};

type InsightTrendChartProps = {
  points: TrendChartPoint[];
  reducedMotion: boolean;
};

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload as TrendChartPoint | undefined;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-ink-900">{item.fullLabel}</p>
      <p className="text-ink-500">{item.count} lamaran</p>
    </div>
  );
}

export default function InsightTrendChart({
  points,
  reducedMotion,
}: InsightTrendChartProps) {
  const hasData = points.some((point) => point.count > 0);

  if (!hasData) {
    return null;
  }

  return (
    <div className="h-72 w-full" role="img" aria-label="Grafik tren jumlah lamaran">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            minTickGap={20}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            isAnimationActive={!reducedMotion}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#1d4ed8", strokeWidth: 0 }}
            isAnimationActive={!reducedMotion}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
