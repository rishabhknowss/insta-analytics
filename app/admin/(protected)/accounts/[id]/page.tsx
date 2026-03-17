import { headers } from "next/headers";
import AccountAnalyticsChart from "./_components/AccountAnalyticsChart";

type DailyStat = {
  date: string;
  views: number;
  likes: number;
  comments: number;
  reels: number;
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
        {error ?? "Account not found."}
      </div>
    );
  }

  const latest = analytics?.series[analytics.series.length - 1];
  const totalViews    = latest?.views    ?? 0;
  const totalLikes    = latest?.likes    ?? 0;
  const totalComments = latest?.comments ?? 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Breadcrumb + Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-1.5 text-[13px] text-slate-400 mb-3">
          <a href="/admin" className="text-slate-400 hover:text-blue-500 no-underline transition-colors">Overview</a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 truncate">{account.username ? `@${account.username}` : account.id}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-[22px] font-bold text-slate-900 mb-1">
              {account.username ? `@${account.username}` : account.id}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500">
              {account.reels.length} reel{account.reels.length !== 1 ? "s" : ""} tracked · Last{" "}
              {new Date(account.lastSeenAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2.5">
            {[
              { label: "Views",    value: totalViews,    color: "#2563eb" },
              { label: "Likes",    value: totalLikes,    color: "#e11d48" },
              { label: "Comments", value: totalComments, color: "#0891b2" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-[10px] px-3.5 py-2.5 sm:px-4 sm:py-2.5 text-center sm:min-w-[88px]" style={{ borderTopColor: color, borderTopWidth: 3 }}>
                <p className="font-data text-base sm:text-[17px] font-medium text-slate-900 leading-none mb-1">
                  {value.toLocaleString()}
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="animate-fade-up [animation-delay:0.05s]">
        <AccountAnalyticsChart series={analytics?.series ?? []} comparison={analytics?.comparison ?? null} />
      </div>

      {/* Reels */}
      <div className="animate-fade-up [animation-delay:0.1s]">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm sm:text-[15px] font-bold text-slate-900">All Reels</h2>
          <span className="text-xs text-slate-400">{account.reels.length} total</span>
        </div>

        {account.reels.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl py-10 sm:py-12 text-center px-4">
            <p className="text-slate-400 text-sm">No reels found for this account yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {account.reels.map((reel) => {
                const latest = reel.dailyStats[reel.dailyStats.length - 1] ?? null;
                return (
                  <div key={reel.id} className="bg-white border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center gap-3 mb-2.5">
                      {reel.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={reel.thumbnailUrl} alt="" className="w-10 h-10 rounded-md object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-100 shrink-0 border border-slate-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-800 truncate">{reel.caption?.slice(0, 70) ?? "Untitled"}</p>
                        <p className="text-[11px] text-slate-400">
                          {reel.publishedAt ? new Date(reel.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                        </p>
                      </div>
                      {reel.permalink && (
                        <a href={reel.permalink} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] font-semibold text-blue-500 px-2 py-1 bg-blue-50 rounded-md">↗</a>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-slate-50 rounded-lg py-1.5">
                        <p className="font-data text-xs font-bold text-slate-900">{(latest?.views ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Views</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-1.5">
                        <p className="font-data text-xs font-bold text-slate-900">{(latest?.likes ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Likes</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-1.5">
                        <p className="font-data text-xs font-bold text-slate-900">{(latest?.comments ?? 0).toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Comments</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b border-slate-200">Reel</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b border-slate-200 whitespace-nowrap">Views</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b border-slate-200 whitespace-nowrap">Likes</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b border-slate-200 whitespace-nowrap">Comments</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b border-slate-200 whitespace-nowrap">Published</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {account.reels.map((reel) => {
                      const latest = reel.dailyStats[reel.dailyStats.length - 1] ?? null;
                      return (
                        <tr key={reel.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {reel.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={reel.thumbnailUrl} alt="" className="w-[38px] h-[38px] rounded-md object-cover shrink-0 border border-slate-200" />
                              ) : (
                                <div className="w-[38px] h-[38px] rounded-md bg-slate-100 shrink-0 border border-slate-200" />
                              )}
                              <div className="min-w-0">
                                <p className="text-[13px] font-medium text-slate-800 truncate max-w-[260px] mb-0.5">{reel.caption?.slice(0, 70) ?? "Untitled"}</p>
                                {reel.permalink && (
                                  <a href={reel.permalink} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline">
                                    View on Instagram ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-data font-semibold text-slate-900">{(latest?.views ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-data text-slate-700">{(latest?.likes ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-data text-slate-700">{(latest?.comments ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-data text-xs text-slate-400">
                            {reel.publishedAt ? new Date(reel.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
