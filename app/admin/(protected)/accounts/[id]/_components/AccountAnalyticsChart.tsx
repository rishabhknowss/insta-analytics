"use client";

import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; views: number; likes: number; comments: number };
type Comparison = { views: number; likes: number; comments: number } | null;

function DeltaCard({ label, value, color }: { label: string; value: number; color: string }) {
  const pos = value >= 0;
  return (
    <div className="card" style={{ padding: "16px 20px", borderTop: `3px solid ${color}` }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate-500)", marginBottom: 8 }}>
        {label}
      </p>
      <p style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: 22,
        fontWeight: 500,
        color: pos ? "#16a34a" : "#dc2626",
        marginBottom: 4,
      }}>
        {pos ? "+" : ""}{value.toLocaleString()}
      </p>
      <p style={{ fontSize: 11, color: "var(--slate-400)" }}>vs previous snapshot</p>
    </div>
  );
}

export default function AccountAnalyticsChart({
  series,
  comparison,
}: {
  series: DataPoint[];
  comparison: Comparison;
}) {
  if (series.length === 0) {
    return (
      <div style={{
        padding: 48,
        textAlign: "center",
        background: "var(--slate-50)",
        borderRadius: 10,
        border: "2px dashed var(--slate-200)",
      }}>
        <p style={{ fontSize: 14, color: "var(--slate-400)" }}>
          No snapshot data yet — run the cron job to collect metrics.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Delta cards */}
      {comparison && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 12, maxWidth: 260 }}>
          <DeltaCard label="Views change" value={comparison.views} color="#3b82f6" />
        </div>
      )}

      {/* Chart */}
      <div className="card" style={{ padding: "24px 24px 16px" }}>
        <p style={{
          fontFamily: "var(--font-syne)",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--slate-900)",
          marginBottom: 4,
        }}>
          Performance over time
        </p>
        <p style={{ fontSize: 12, color: "var(--slate-400)", marginBottom: 20 }}>
          Cumulative totals across all reels, per snapshot date
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-dm-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-dm-mono)" }}
              tickLine={false}
              axisLine={false}
              width={48}
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
              labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
            />
<Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
