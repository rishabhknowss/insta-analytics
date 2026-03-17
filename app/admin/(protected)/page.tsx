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
    <div
      className="bg-white border border-slate-200 rounded-xl px-5 py-[18px]"
      style={{ borderTopColor: accent ?? "#3b82f6", borderTopWidth: 3 }}
    >
      <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-2">
        {label}
      </p>
      <p className="font-data text-[26px] font-medium text-slate-900 leading-none mb-1.5">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center gap-1.5 min-h-[18px]">
        {hasDelta && (
          <span
            className={`text-[11px] font-semibold font-data px-[7px] py-0.5 rounded-full ${
              pos ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {pos ? "+" : ""}{delta!.toLocaleString()}
          </span>
        )}
        {sub && <span className="text-[11px] text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}

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

  const totals24hPosts = accounts.reduce((s, a) => s + a.last24hPosted, 0);
  const totals24hViews = accounts.reduce((s, a) => s + a.last24hViews, 0);
  const totalsReels = accounts.reduce((s, a) => s + a.totalReels, 0);
  const totalsViews = accounts.reduce((s, a) => s + a.totalViews, 0);

  return (
    <div className="flex flex-col gap-7">

      {/* Page header */}
      <div className="animate-fade-up flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 mb-0.5">
            Overview
          </h1>
          <p className="text-[13px] text-slate-500">
            All tracked Instagram accounts · live snapshot data
          </p>
        </div>
        <RunSnapshotButton />
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Global stat cards */}
          <div className="animate-fade-up [animation-delay:0.05s] grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            <StatCard label="Accounts"            value={stats?.totalAccounts ?? 0}  sub="connected"           accent="#6366f1" />
            <StatCard label="Total Reels"         value={stats?.totalReels ?? 0}     sub="tracked"             accent="#0891b2" />
            <StatCard label="Total Views"         value={stats?.latestViews ?? 0}    sub="latest snapshot"     accent="#2563eb" />
            <StatCard label="24h New Views"       value={stats?.viewsDelta ?? 0}     sub="since last snapshot" accent="#7c3aed" delta={stats?.viewsDelta} />
            <StatCard label="Total Likes"         value={stats?.latestLikes ?? 0}    sub="latest snapshot"     accent="#e11d48" />
            <StatCard label="Last 24h Posted"     value={stats?.last24hPosted ?? 0}  sub="reels published"     accent="#f59e0b" />
            <StatCard label="Last 24h Reel Views" value={stats?.last24hViews ?? 0}   sub="views on new reels"  accent="#10b981" />
          </div>

          {/* Chart */}
          <div className="animate-fade-up [animation-delay:0.1s] bg-white border border-slate-200 rounded-xl px-6 pt-[22px] pb-4">
            <div className="flex items-baseline justify-between mb-[18px]">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 mb-0.5">
                  Performance trend
                </h2>
                <p className="text-xs text-slate-400">
                  Cumulative views · likes · comments per snapshot date
                </p>
              </div>
            </div>
            <GlobalChart series={stats?.timeSeries ?? []} />
          </div>

          {/* Accounts table */}
          <div className="animate-fade-up [animation-delay:0.15s]">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 mb-0.5">
                  Accounts
                </h2>
                <p className="text-xs text-slate-400">Click an account to view full analytics</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2.5 py-0.5">
                {accounts.length} connected
              </span>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl py-14 text-center">
                <div className="w-10 h-10 rounded-[10px] bg-slate-100 inline-flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">No accounts connected</p>
                <p className="text-slate-400 text-[13px]">Connect an Instagram account to start tracking.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        <th className="px-5 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 min-w-[200px]">
                          Account
                        </th>
                        <th className="px-3.5 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-amber-700 bg-amber-50/60 border-b-2 border-amber-200 whitespace-nowrap">
                          24h Posts
                        </th>
                        <th className="px-3.5 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-amber-700 bg-amber-50/60 border-b-2 border-amber-200 whitespace-nowrap">
                          24h Views
                        </th>
                        <th className="px-3.5 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 min-w-[200px]">
                          Top Reel
                        </th>
                        <th className="px-3.5 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Reels
                        </th>
                        <th className="px-5 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Total Views
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Account */}
                          <td className="px-5 py-3.5 border-r border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full shrink-0 bg-linear-to-br from-violet-200 to-indigo-200 flex items-center justify-center text-[13px] font-bold text-indigo-500">
                                {(a.username ?? "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <a
                                  href={`/admin/accounts/${a.id}`}
                                  className="text-[13px] font-semibold text-blue-600 hover:underline block mb-0.5"
                                >
                                  {a.username ? `@${a.username}` : "Unknown"}
                                </a>
                                <span className="text-[11px] text-slate-400 font-data">
                                  {a.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          {/* 24h Posts */}
                          <td className={`px-3.5 py-3.5 text-right font-data align-middle ${a.last24hPosted > 0 ? "bg-amber-50/40" : ""}`}>
                            {a.last24hPosted > 0 ? (
                              <span className="font-bold text-amber-700">{a.last24hPosted}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          {/* 24h Views */}
                          <td className={`px-3.5 py-3.5 text-right font-data align-middle border-r border-slate-100 ${a.last24hViews > 0 ? "bg-amber-50/40" : ""}`}>
                            {a.last24hViews > 0 ? (
                              <span className="font-semibold text-amber-800">{a.last24hViews.toLocaleString()}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          {/* Top reel */}
                          <td className="px-3.5 py-3 border-r border-slate-100 align-middle">
                            {a.mvReelId ? (
                              <div className="flex items-center gap-2.5">
                                {a.mvThumbnail ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={a.mvThumbnail}
                                    alt=""
                                    className="w-10 h-10 rounded-md object-cover shrink-0 border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-slate-100 shrink-0 flex items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                  </div>
                                )}
                                <div>
                                  <p className="font-data text-xs font-bold text-slate-900 mb-0.5">
                                    {a.mvViews.toLocaleString()}
                                    <span className="font-normal text-slate-400 text-[11px]"> views</span>
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-slate-400">
                                      ♥ {a.mvLikes.toLocaleString()}
                                    </span>
                                    {a.mvPermalink && (
                                      <a
                                        href={a.mvPermalink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-semibold text-blue-500 no-underline px-1.5 py-px bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                      >
                                        ↗ View
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">No data yet</span>
                            )}
                          </td>
                          {/* Reels count */}
                          <td className="px-3.5 py-3.5 text-right font-data font-semibold text-slate-700 align-middle">
                            {a.totalReels.toLocaleString()}
                          </td>
                          {/* Total views */}
                          <td className="px-5 py-3.5 text-right align-middle">
                            <span className="font-data font-bold text-[13px] text-slate-900">
                              {a.totalViews.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals footer */}
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td className="px-5 py-3 font-bold text-[11px] tracking-[0.06em] uppercase text-slate-400 border-r border-slate-100">
                          {accounts.length} account{accounts.length !== 1 ? "s" : ""} total
                        </td>
                        <td className="px-3.5 py-3 text-right font-data font-semibold text-slate-600">
                          {totals24hPosts || "—"}
                        </td>
                        <td className="px-3.5 py-3 text-right font-data font-bold text-slate-700 border-r border-slate-100">
                          {totals24hViews.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-3 border-r border-slate-100" />
                        <td className="px-3.5 py-3 text-right font-data font-bold text-slate-700">
                          {totalsReels.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-data font-bold text-[13px] text-slate-900">
                            {totalsViews.toLocaleString()}
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
          <p className="animate-fade-up [animation-delay:0.2s] text-[11px] text-slate-400 flex items-center gap-1.5">
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
