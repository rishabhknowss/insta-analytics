"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; views: number; reels: number };
type ChartMode = "daily" | "cumulative";

const PERIODS = [
  { label: "7D",  days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: 0 },
] as const;

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatViews(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export default function GlobalChart({ series }: { series: DataPoint[] }) {
  const [period, setPeriod] = useState<number>(30);
  const [mode, setMode] = useState<ChartMode>("daily");

  const filtered = useMemo(() => {
    if (period === 0 || series.length === 0) return series;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return series.filter((d) => new Date(d.date) >= cutoff);
  }, [series, period]);

  const chartData = useMemo(() => {
    if (mode === "daily") return filtered;
    let running = 0;
    return filtered.map((d) => {
      running += d.views;
      return { ...d, cumulativeViews: running };
    });
  }, [filtered, mode]);

  if (series.length === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] sm:h-[200px] bg-slate-50 rounded-[10px] border-2 border-dashed border-slate-200 px-4">
        <p className="text-xs sm:text-[13px] text-slate-400 text-center">
          No data yet — click &ldquo;Run snapshot&rdquo; to collect metrics
        </p>
      </div>
    );
  }

  const dataKey = mode === "daily" ? "views" : "cumulativeViews";
  const tooltipLabel = mode === "daily" ? "Views" : "Total Views";
  const chartColor = mode === "daily" ? "#8b5cf6" : "#3b82f6";

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-1">
          {PERIODS.map(({ label, days }) => {
            const active = period === days;
            return (
              <button
                key={label}
                onClick={() => setPeriod(days)}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md border transition-all ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setMode("daily")}
            className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold transition-colors border-r border-slate-200 ${
              mode === "daily" ? "bg-violet-50 text-violet-600" : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode("cumulative")}
            className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold transition-colors ${
              mode === "cumulative" ? "bg-blue-50 text-blue-600" : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Cumulative
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "daily" ? (
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.85} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={formatViews} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(l: unknown) => formatDate(String(l))}
                formatter={(value: unknown) => [typeof value === "number" ? value.toLocaleString() : String(value), tooltipLabel]}
                labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
                cursor={{ fill: "rgba(139,92,246,0.06)" }}
              />
              <Bar dataKey={dataKey} fill="url(#gViews)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gViewsCum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={formatViews} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(l: unknown) => formatDate(String(l))}
                formatter={(value: unknown) => [typeof value === "number" ? value.toLocaleString() : String(value), tooltipLabel]}
                labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
              />
              <Area type="monotone" dataKey={dataKey} stroke={chartColor} strokeWidth={2.5} fill="url(#gViewsCum)" dot={false} activeDot={{ r: 4, fill: chartColor }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
