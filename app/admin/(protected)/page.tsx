import { headers } from "next/headers";
import RunSnapshotButton from "./_components/RunSnapshotButton";
import GlobalChart from "./_components/GlobalChart";

type GlobalStats = {
  totalAccounts: number;
  totalReels: number;
  latestViews: number;
  prevViews: number;
  viewsDelta: number;
  latestLikes: number;
  latestComments: number;
  last24hPosted: number;
  last24hViews: number;
  timeSeries: { date: string; views: number }[];
};

type AccountRow = {
  id: string;
  username: string | null;
  last24hPosted: number;
  last24hViews: number;
  mvReelId: string | null;
  mvPermalink: string | null;
  mvThumbnail: string | null;
  mvViews: number;
  mvLikes: number;
  totalReels: number;
  totalViews: number;
};

async function fetchAdmin<T>(path: string, cookieHeader: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${path}`);
  return res.json();
}

function StatCard({
  label, value, sub, accent, delta,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
  delta?: number;
}) {
  const hasDelta = delta !== undefined && delta !== 0;
  const pos = (delta ?? 0) >= 0;

  return (
    <div className="card" style={{
      padding: "18px 20px",
      borderTop: `3px solid ${accent ?? "var(--blue-500)"}`,
    }}>
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--slate-400)",
        marginBottom: 8,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: 26,
        fontWeight: 500,
        color: "var(--slate-900)",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 18 }}>
        {hasDelta && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--font-dm-mono)",
            padding: "2px 7px",
            borderRadius: 999,
            background: pos ? "var(--green-50)" : "var(--red-50)",
            color: pos ? "#16a34a" : "#dc2626",
          }}>
            {pos ? "+" : ""}{delta!.toLocaleString()}
          </span>
        )}
        {sub && <span style={{ fontSize: 11, color: "var(--slate-400)" }}>{sub}</span>}
      </div>
    </div>
  );
}

const thBase: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--slate-400)",
  whiteSpace: "nowrap",
  background: "var(--slate-50)",
  borderBottom: "1px solid var(--slate-200)",
};

const tdBase: React.CSSProperties = {
  padding: "13px 14px",
  fontSize: 13,
  color: "var(--slate-700)",
  fontFamily: "var(--font-dm-mono)",
  borderBottom: "1px solid var(--slate-100)",
  verticalAlign: "middle",
};

export default async function AdminPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  let stats: GlobalStats | null = null;
  let accounts: AccountRow[] = [];
  let error: string | null = null;

  try {
    [stats, accounts] = await Promise.all([
      fetchAdmin<GlobalStats>("/api/admin/global-stats", cookieHeader),
      fetchAdmin<AccountRow[]>("/api/admin/accounts", cookieHeader),
    ]);
  } catch {
    error = "Could not load data. Check DATABASE_URL and run migrations.";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Page header */}
      <div className="animate-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 3,
          }}>
            Overview
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate-500)" }}>
            All tracked Instagram accounts · live snapshot data
          </p>
        </div>
        <RunSnapshotButton />
      </div>

      {error ? (
        <div style={{ padding: 16, background: "var(--red-50)", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      ) : (
        <>
          {/* Global stat cards */}
          <div className="animate-up animate-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <StatCard label="Accounts"           value={stats?.totalAccounts ?? 0}  sub="connected"               accent="#6366f1" />
            <StatCard label="Total Reels"        value={stats?.totalReels ?? 0}     sub="tracked"                 accent="#0891b2" />
            <StatCard label="Total Views"        value={stats?.latestViews ?? 0}    sub="latest snapshot"         accent="#2563eb" />
            <StatCard label="24h New Views"      value={stats?.viewsDelta ?? 0}     sub="since last snapshot"     accent="#7c3aed" delta={stats?.viewsDelta} />
            <StatCard label="Total Likes"        value={stats?.latestLikes ?? 0}    sub="latest snapshot"         accent="#e11d48" />
            <StatCard label="Last 24h Posted"    value={stats?.last24hPosted ?? 0}  sub="reels published"         accent="#f59e0b" />
            <StatCard label="Last 24h Reel Views" value={stats?.last24hViews ?? 0}  sub="views on new reels"      accent="#10b981" />
          </div>

          {/* Chart */}
          <div className="card animate-up animate-up-2" style={{ padding: "22px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "var(--slate-900)", marginBottom: 2 }}>
                  Performance trend
                </h2>
                <p style={{ fontSize: 12, color: "var(--slate-400)" }}>
                  Cumulative views · likes · comments per snapshot date
                </p>
              </div>
            </div>
            <GlobalChart series={stats?.timeSeries ?? []} />
          </div>

          {/* Accounts table */}
          <div className="animate-up animate-up-3">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "var(--slate-900)", marginBottom: 2 }}>
                  Accounts
                </h2>
                <p style={{ fontSize: 12, color: "var(--slate-400)" }}>Click an account to view full analytics</p>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: "var(--blue-50)", color: "var(--blue-600)",
                border: "1px solid var(--blue-100)",
                borderRadius: 999, padding: "3px 10px",
              }}>
                {accounts.length} connected
              </span>
            </div>

            {accounts.length === 0 ? (
              <div className="card" style={{ padding: 56, textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--slate-100)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ color: "var(--slate-500)", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No accounts connected</p>
                <p style={{ color: "var(--slate-400)", fontSize: 13 }}>Connect an Instagram account to start tracking.</p>
              </div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "var(--slate-50)" }}>
                        <th style={{ ...thBase, textAlign: "left", minWidth: 200, paddingLeft: 20, borderRight: "1px solid var(--slate-200)" }}>
                          Account
                        </th>
                        <th style={{ ...thBase, textAlign: "right", color: "#b45309", background: "#fefce8", borderTop: "2px solid #fde68a" }}>
                          24h Posts
                        </th>
                        <th style={{ ...thBase, textAlign: "right", color: "#b45309", background: "#fefce8", borderTop: "2px solid #fde68a", borderRight: "1px solid var(--slate-200)" }}>
                          24h Views
                        </th>
                        <th style={{ ...thBase, textAlign: "left", minWidth: 200, borderRight: "1px solid var(--slate-200)" }}>
                          Top Reel
                        </th>
                        <th style={{ ...thBase, textAlign: "right" }}>
                          Reels
                        </th>
                        <th style={{ ...thBase, textAlign: "right", paddingRight: 20 }}>
                          Total Views
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.id} className="tr-hover" style={{ borderBottom: "1px solid var(--slate-100)" }}>
                          {/* Account */}
                          <td style={{ ...tdBase, paddingLeft: 20, fontFamily: "var(--font-dm-sans)", borderRight: "1px solid var(--slate-100)", borderBottom: "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {/* Avatar placeholder */}
                              <div style={{
                                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                background: "linear-gradient(135deg, #ddd6fe, #c7d2fe)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 700, color: "#6366f1",
                              }}>
                                {(a.username ?? "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <a href={`/admin/accounts/${a.id}`} className="link-blue" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 2 }}>
                                  {a.username ? `@${a.username}` : "Unknown"}
                                </a>
                                <span style={{ fontSize: 11, color: "var(--slate-400)", fontFamily: "var(--font-dm-mono)" }}>
                                  {a.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          {/* 24h */}
                          <td style={{ ...tdBase, textAlign: "right", borderBottom: "none", background: a.last24hPosted > 0 ? "#fefce8" : undefined }}>
                            {a.last24hPosted > 0 ? (
                              <span style={{ fontWeight: 700, color: "#b45309" }}>{a.last24hPosted}</span>
                            ) : (
                              <span style={{ color: "var(--slate-300)" }}>—</span>
                            )}
                          </td>
                          <td style={{ ...tdBase, textAlign: "right", borderRight: "1px solid var(--slate-100)", borderBottom: "none", background: a.last24hViews > 0 ? "#fefce8" : undefined }}>
                            {a.last24hViews > 0 ? (
                              <span style={{ fontWeight: 600, color: "#92400e" }}>{a.last24hViews.toLocaleString()}</span>
                            ) : (
                              <span style={{ color: "var(--slate-300)" }}>—</span>
                            )}
                          </td>
                          {/* Top reel */}
                          <td style={{ ...tdBase, padding: "10px 14px", borderRight: "1px solid var(--slate-100)", borderBottom: "none" }}>
                            {a.mvReelId ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {a.mvThumbnail ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={a.mvThumbnail}
                                    alt=""
                                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid var(--slate-200)" }}
                                  />
                                ) : (
                                  <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--slate-100)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                  </div>
                                )}
                                <div>
                                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, fontWeight: 700, color: "var(--slate-900)", marginBottom: 3 }}>
                                    {a.mvViews.toLocaleString()}
                                    <span style={{ fontWeight: 400, color: "var(--slate-400)", fontSize: 11 }}> views</span>
                                  </p>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 11, color: "var(--slate-400)" }}>
                                      ♥ {a.mvLikes.toLocaleString()}
                                    </span>
                                    {a.mvPermalink && (
                                      <a href={a.mvPermalink} target="_blank" rel="noopener noreferrer" style={{
                                        fontSize: 10, fontWeight: 600, color: "var(--blue-500)",
                                        textDecoration: "none", padding: "1px 6px",
                                        background: "var(--blue-50)", borderRadius: 4,
                                      }}>
                                        ↗ View
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "var(--slate-300)", fontSize: 12 }}>No data yet</span>
                            )}
                          </td>
                          {/* Totals */}
                          <td style={{ ...tdBase, textAlign: "right", fontWeight: 600, color: "var(--slate-700)", borderBottom: "none" }}>
                            {a.totalReels.toLocaleString()}
                          </td>
                          <td style={{ ...tdBase, textAlign: "right", paddingRight: 20, borderBottom: "none" }}>
                            <span style={{ fontFamily: "var(--font-dm-mono)", fontWeight: 700, fontSize: 13, color: "var(--slate-900)" }}>
                              {a.totalViews.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals footer */}
                    <tfoot>
                      <tr style={{ background: "var(--slate-50)", borderTop: "2px solid var(--slate-200)" }}>
                        <td style={{ ...tdBase, paddingLeft: 20, fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--slate-400)", borderBottom: "none", borderRight: "1px solid var(--slate-100)" }}>
                          {accounts.length} account{accounts.length !== 1 ? "s" : ""} total
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", fontWeight: 600, color: "var(--slate-600)", borderBottom: "none" }}>
                          {accounts.reduce((s, a) => s + a.last24hPosted, 0) || "—"}
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: "var(--slate-700)", borderRight: "1px solid var(--slate-100)", borderBottom: "none" }}>
                          {accounts.reduce((s, a) => s + a.last24hViews, 0).toLocaleString()}
                        </td>
                        <td style={{ ...tdBase, borderRight: "1px solid var(--slate-100)", borderBottom: "none" }} />
                        <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: "var(--slate-700)", borderBottom: "none" }}>
                          {accounts.reduce((s, a) => s + a.totalReels, 0).toLocaleString()}
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", paddingRight: 20, borderBottom: "none" }}>
                          <span style={{ fontFamily: "var(--font-dm-mono)", fontWeight: 700, fontSize: 13, color: "var(--slate-900)" }}>
                            {accounts.reduce((s, a) => s + a.totalViews, 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="animate-up animate-up-4" style={{ fontSize: 11, color: "var(--slate-400)", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Views include organic and boosted impressions. Instagram does not expose the split via API.
          </p>
        </>
      )}
    </div>
  );
}
