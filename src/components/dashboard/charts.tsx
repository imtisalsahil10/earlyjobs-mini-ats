"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STAGE_META, type Stage } from "@/lib/stages";

const axisStyle = { fontSize: 11, fill: "#94a3b8" } as const;

function TooltipCard({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
  suffix: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">
        {payload[0].value} {suffix}
      </p>
    </div>
  );
}

export function ApplicationsTrendChart({
  data,
}: {
  data: { label: string; applications: number }[];
}) {
  return (
    <div className="h-56 w-full px-2 pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="applications" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisStyle} />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={axisStyle}
            width={36}
          />
          <Tooltip
            content={<TooltipCard suffix="applications" />}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="applications"
            stroke="#0f172a"
            strokeWidth={2}
            fill="url(#applications)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StageDistributionChart({
  data,
}: {
  data: { stage: Stage; count: number }[];
}) {
  const chartData = data.map((row) => ({
    ...row,
    label: STAGE_META[row.stage].label,
    fill: STAGE_META[row.stage].hex,
  }));

  return (
    <div className="h-56 w-full px-2 pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisStyle} />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={axisStyle}
            width={36}
          />
          <Tooltip
            content={<TooltipCard suffix="candidates" />}
            cursor={{ fill: "#f1f5f9" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((row) => (
              <Cell key={row.stage} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
