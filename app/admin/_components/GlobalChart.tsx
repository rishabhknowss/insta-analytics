"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; views: number };

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

export default function GlobalChart({ series }: { series: DataPoint[] }) {
  const [period, setPeriod] = useState<number>(30);

  const filtered = useMemo(() => {
    if (period === 0 || series.length === 0) return series;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return series.filter((d) => new Date(d.date) >= cutoff);
  }, [series, period]);

  if (series.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        background: "var(--slate-50)",
        borderRadius: 10,
        border: "2px dashed var(--slate-200)",
      }}>
        <p style={{ fontSize: 13, color: "var(--slate-400)" }}>
          No snapshot data yet — click &ldquo;Run snapshot&rdquo; to collect metrics
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {PERIODS.map(({ label, days }) => {
          const active = period === days;
          return (
            <button
              key={label}
              onClick={() => setPeriod(days)}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans)",
                borderRadius: 6,
                border: active ? "1px solid var(--blue-500)" : "1px solid var(--slate-200)",
                background: active ? "var(--blue-50)" : "transparent",
                color: active ? "var(--blue-600)" : "var(--slate-500)",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={filtered} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-dm-mono)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatViews}
            tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-dm-mono)" }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 12,
              fontFamily: "var(--font-dm-sans)",
            }}
            labelFormatter={formatDate}
            formatter={(v: number) => [v.toLocaleString(), "Views"]}
            labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#gViews)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
