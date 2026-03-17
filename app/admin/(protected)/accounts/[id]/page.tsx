import { headers } from "next/headers";
import AccountAnalyticsChart from "./_components/AccountAnalyticsChart";

type DailyStat = {
  date: string;
  views: number;
  likes: number;
  comments: number;
};

type ReelDetail = {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  permalink: string | null;
  publishedAt: string | null;
  dailyStats: DailyStat[];
};

type AccountDetail = {
  id: string;
  username: string | null;
  createdAt: string;
  lastSeenAt: string;
  reels: ReelDetail[];
};

type Analytics = {
  series: DailyStat[];
  comparison: { views: number; likes: number; comments: number } | null;
};

async function fetchWithAdmin(url: string, auth: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "x-admin-secret": process.env.ADMIN_SECRET ?? "",
      authorization: auth,
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  return res.json();
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "right",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase" as const,
  color: "var(--slate-400)",
  whiteSpace: "nowrap",
  background: "var(--slate-50)",
  borderBottom: "1px solid var(--slate-200)",
};

const tdStyle: React.CSSProperties = {
  padding: "13px 16px",
  textAlign: "right",
  fontSize: 13,
  color: "var(--slate-700)",
  fontFamily: "var(--font-dm-mono)",
  borderBottom: "1px solid var(--slate-100)",
  verticalAlign: "middle",
};

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headerStore = await headers();
  const auth = headerStore.get("authorization") ?? "";
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  let account: AccountDetail | null = null;
  let analytics: Analytics | null = null;
  let error: string | null = null;

  try {
    [account, analytics] = await Promise.all([
      fetchWithAdmin(`${base}/api/admin/account/${id}`, auth),
      fetchWithAdmin(`${base}/api/admin/account/${id}/analytics`, auth),
    ]);
  } catch {
    error = "Could not load account data.";
  }

  if (error || !account) {
    return (
      <div style={{ padding: 16, background: "var(--red-50)", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14 }}>
        {error ?? "Account not found."}
      </div>
    );
  }

  const latest = analytics?.series[analytics.series.length - 1];
  const totalViews    = latest?.views    ?? 0;
  const totalLikes    = latest?.likes    ?? 0;
  const totalComments = latest?.comments ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Breadcrumb + Header */}
      <div className="animate-up">
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--slate-400)", marginBottom: 12 }}>
          <a href="/admin" className="breadcrumb-link">Overview</a>
          <span style={{ color: "var(--slate-300)" }}>/</span>
          <span style={{ color: "var(--slate-600)" }}>
            {account.username ? `@${account.username}` : account.id}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-syne)",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--slate-900)",
              marginBottom: 4,
            }}>
              {account.username ? `@${account.username}` : account.id}
            </h1>
            <p style={{ fontSize: 13, color: "var(--slate-500)" }}>
              {account.reels.length} reel{account.reels.length !== 1 ? "s" : ""} tracked
              {" · "}Last snapshot{" "}
              {new Date(account.lastSeenAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          {/* Quick stat chips */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Views",    value: totalViews,    color: "#2563eb" },
              { label: "Likes",    value: totalLikes,    color: "#e11d48" },
              { label: "Comments", value: totalComments, color: "#0891b2" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: "10px 16px",
                background: "var(--white)",
                border: "1px solid var(--slate-200)",
                borderTop: `3px solid ${color}`,
                borderRadius: 10,
                textAlign: "center",
                minWidth: 88,
              }}>
                <p style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 17,
                  fontWeight: 500,
                  color: "var(--slate-900)",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {value.toLocaleString()}
                </p>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--slate-400)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="animate-up animate-up-1">
        <AccountAnalyticsChart
          series={analytics?.series ?? []}
          comparison={analytics?.comparison ?? null}
        />
      </div>

      {/* Reels table */}
      <div className="animate-up animate-up-2">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "var(--slate-900)" }}>
            All Reels
          </h2>
          <span style={{ fontSize: 12, color: "var(--slate-400)" }}>{account.reels.length} total</span>
        </div>

        {account.reels.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--slate-400)", fontSize: 14 }}>No reels found for this account yet.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: "left" }}>Reel</th>
                  <th style={thStyle}>Views</th>
                  <th style={thStyle}>Likes</th>
                  <th style={thStyle}>Comments</th>
                  <th style={thStyle}>Published</th>
                </tr>
              </thead>
              <tbody>
                {account.reels.map((reel) => {
                  const latest = reel.dailyStats[reel.dailyStats.length - 1] ?? null;
                  return (
                    <tr key={reel.id} className="tr-hover">
                      <td style={{ ...tdStyle, textAlign: "left", fontFamily: "var(--font-dm-sans)", maxWidth: 360 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {reel.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={reel.thumbnailUrl}
                              alt=""
                              style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 6, objectFit: "cover", border: "1px solid var(--slate-200)" }}
                            />
                          ) : (
                            <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 6, background: "var(--slate-100)", border: "1px solid var(--slate-200)" }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 500, color: "var(--slate-800)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260, marginBottom: 2 }}>
                              {reel.caption?.slice(0, 70) ?? "Untitled"}
                            </p>
                            {reel.permalink && (
                              <a href={reel.permalink} target="_blank" rel="noopener noreferrer" className="link-subtle">
                                View on Instagram ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "var(--slate-900)" }}>
                        {(latest?.views ?? 0).toLocaleString()}
                      </td>
                      <td style={tdStyle}>{(latest?.likes ?? 0).toLocaleString()}</td>
                      <td style={tdStyle}>{(latest?.comments ?? 0).toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "var(--slate-400)" }}>
                        {reel.publishedAt
                          ? new Date(reel.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
