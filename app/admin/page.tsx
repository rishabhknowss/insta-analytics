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

async function fetchAdmin<T>(path: string, auth: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      "x-admin-secret": process.env.ADMIN_SECRET ?? "",
      authorization: auth,
    },
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
  const auth = headerStore.get("authorization") ?? "";

  let stats: GlobalStats | null = null;
  let accounts: AccountRow[] = [];
  let error: string | null = null;

  try {
    [stats, accounts] = await Promise.all([
      fetchAdmin<GlobalStats>("/api/admin/global-stats", auth),
      fetchAdmin<AccountRow[]>("/api/admin/accounts", auth),
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
        <RunSnapshotButton adminSecret={process.env.ADMIN_SECRET ?? ""} />
      </div>

      {error ? (
        <div style={{ padding: 16, background: "var(--red-50)", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      ) : (
        <>
          {/* Global stat cards */}
          <div className="animate-up animate-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <StatCard label="Accounts"        value={stats?.totalAccounts ?? 0}  sub="connected"          accent="#6366f1" />
            <StatCard label="Total Reels"     value={stats?.totalReels ?? 0}     sub="tracked"            accent="#0891b2" />
            <StatCard label="Total Views"     value={stats?.latestViews ?? 0}    delta={stats?.viewsDelta} sub="vs prev snapshot" accent="#2563eb" />
            <StatCard label="Total Likes"     value={stats?.latestLikes ?? 0}    sub="latest snapshot"    accent="#e11d48" />
            <StatCard label="Last 24h Posted" value={stats?.last24hPosted ?? 0}  sub="reels published"    accent="#f59e0b" />
            <StatCard label="Last 24h Views"  value={stats?.last24hViews ?? 0}   sub="from recent reels"  accent="#10b981" />
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
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "var(--slate-900)" }}>
                Accounts
              </h2>
              <span style={{ fontSize: 12, color: "var(--slate-400)" }}>{accounts.length} connected</span>
            </div>

            {accounts.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: "center" }}>
                <p style={{ color: "var(--slate-400)", fontSize: 14 }}>
                  No accounts yet. Connect an Instagram account to get started.
                </p>
              </div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      {/* Group headers */}
                      <tr style={{ background: "var(--slate-50)", borderBottom: "1px solid var(--slate-200)" }}>
                        <th style={{ ...thBase, textAlign: "left", minWidth: 180, borderRight: "1px solid var(--slate-200)" }}>
                          Account
                        </th>
                        <th style={{ ...thBase, textAlign: "right", color: "#92400e", background: "#fffbeb" }}>
                          Last 24h Posts
                        </th>
                        <th style={{ ...thBase, textAlign: "right", color: "#92400e", background: "#fffbeb", borderRight: "1px solid var(--slate-200)" }}>
                          Last 24h Views
                        </th>
                        <th style={{ ...thBase, textAlign: "center", minWidth: 160, borderRight: "1px solid var(--slate-200)" }}>
                          Top Reel
                        </th>
                        <th style={{ ...thBase, textAlign: "right" }}>
                          Total Reels
                        </th>
                        <th style={{ ...thBase, textAlign: "right" }}>
                          Total Views
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.id} className="tr-hover">
                          {/* Account */}
                          <td style={{ ...tdBase, textAlign: "left", fontFamily: "var(--font-dm-sans)", borderRight: "1px solid var(--slate-100)" }}>
                            <a href={`/admin/accounts/${a.id}`} className="link-blue" style={{ display: "block", marginBottom: 2 }}>
                              {a.username ? `@${a.username}` : "—"}
                            </a>
                            <span style={{ fontSize: 11, color: "var(--slate-400)", fontFamily: "var(--font-dm-mono)" }}>
                              {a.id}
                            </span>
                          </td>
                          {/* Last 24h */}
                          <td style={{ ...tdBase, textAlign: "right", color: a.last24hPosted > 0 ? "#92400e" : "var(--slate-300)" }}>
                            {a.last24hPosted || "—"}
                          </td>
                          <td style={{ ...tdBase, textAlign: "right", borderRight: "1px solid var(--slate-100)" }}>
                            {a.last24hViews.toLocaleString()}
                          </td>
                          {/* Top reel */}
                          <td style={{ ...tdBase, textAlign: "left", padding: "10px 14px", borderRight: "1px solid var(--slate-100)" }}>
                            {a.mvReelId ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {a.mvThumbnail ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={a.mvThumbnail}
                                    alt=""
                                    style={{ width: 34, height: 34, borderRadius: 5, objectFit: "cover", flexShrink: 0, border: "1px solid var(--slate-200)" }}
                                  />
                                ) : (
                                  <div style={{ width: 34, height: 34, borderRadius: 5, background: "var(--slate-100)", flexShrink: 0 }} />
                                )}
                                <div>
                                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, fontWeight: 600, color: "var(--slate-900)", marginBottom: 2 }}>
                                    {a.mvViews.toLocaleString()} views
                                  </p>
                                  <p style={{ fontSize: 11, color: "var(--slate-400)" }}>
                                    {a.mvLikes.toLocaleString()} likes
                                    {a.mvPermalink && (
                                      <>
                                        {" · "}
                                        <a href={a.mvPermalink} target="_blank" rel="noopener noreferrer" className="link-subtle">
                                          ↗ Instagram
                                        </a>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "var(--slate-300)", fontSize: 12 }}>—</span>
                            )}
                          </td>
                          {/* Totals */}
                          <td style={{ ...tdBase, textAlign: "right", fontWeight: 600, color: "var(--slate-900)" }}>
                            {a.totalReels.toLocaleString()}
                          </td>
                          <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: "var(--slate-900)" }}>
                            {a.totalViews.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals footer */}
                    <tfoot>
                      <tr style={{ background: "var(--slate-50)", borderTop: "2px solid var(--slate-200)" }}>
                        <td style={{ ...tdBase, textAlign: "left", fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--slate-500)", borderBottom: "none", borderRight: "1px solid var(--slate-100)" }}>
                          Total ({accounts.length})
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", borderBottom: "none" }}>
                          {accounts.reduce((s, a) => s + a.last24hPosted, 0).toLocaleString()}
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, borderBottom: "none", borderRight: "1px solid var(--slate-100)" }}>
                          {accounts.reduce((s, a) => s + a.last24hViews, 0).toLocaleString()}
                        </td>
                        <td style={{ ...tdBase, borderBottom: "none", borderRight: "1px solid var(--slate-100)" }} />
                        <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: "var(--slate-900)", borderBottom: "none" }}>
                          {accounts.reduce((s, a) => s + a.totalReels, 0).toLocaleString()}
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: "var(--slate-900)", borderBottom: "none" }}>
                          {accounts.reduce((s, a) => s + a.totalViews, 0).toLocaleString()}
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
