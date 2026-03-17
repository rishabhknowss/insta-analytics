import { getPosterRows, type PosterRow } from "@/lib/adminQueries";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

const MANAGER_COLORS: Record<string, string> = {
  ROHIT: "bg-violet-50 text-violet-700 border-violet-200",
  UJJWAL: "bg-amber-50 text-amber-700 border-amber-200",
  RISHABH: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
  UNPAID: "bg-red-50 text-red-600 border-red-200",
};

export default async function ManagePage() {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  let posters: PosterRow[] = [];
  let error: string | null = null;

  try {
    posters = await getPosterRows();
  } catch {
    error = "Could not load poster data.";
  }

  const totalPosters = posters.length;
  const totalPaidOut = posters.reduce((s, p) => s + p.totalPaid, 0);
  const totalRemaining = posters.reduce((s, p) => s + Math.max(p.remaining, 0), 0);
  const totalViews = posters.reduce((s, p) => s + p.totalViews, 0);
  const paidCount = posters.filter((p) => p.paidStatus === "PAID").length;
  const partialCount = posters.filter((p) => p.paidStatus === "PARTIAL").length;
  const unpaidCount = posters.filter((p) => p.paidStatus === "UNPAID").length;

  return (
    <div className="flex flex-col gap-7">
      {/* Page header */}
      <div className="animate-fade-up flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 mb-0.5">
            Manage Posters
          </h1>
          <p className="text-[13px] text-slate-500">
            Track payments, managers, and Telegram groups for all posters
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="animate-fade-up [animation-delay:0.05s] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard label="Total Posters" value={totalPosters} accent="border-t-slate-400" />
            <SummaryCard label="Total Paid" value={`₹${totalPaidOut.toLocaleString()}`} accent="border-t-green-500" />
            <SummaryCard label="Remaining" value={`₹${totalRemaining.toLocaleString()}`} accent="border-t-amber-500" />
            <SummaryCard label="Total Views" value={totalViews.toLocaleString()} accent="border-t-blue-500" />
            <SummaryCard label="Fully Paid" value={paidCount} sub={`/ ${totalPosters}`} accent="border-t-green-500" />
            <SummaryCard label="Unpaid" value={unpaidCount} sub={partialCount > 0 ? `+ ${partialCount} partial` : undefined} accent="border-t-red-500" />
          </div>

          {/* Table */}
          <div className="animate-fade-up [animation-delay:0.1s]">
            {posters.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl py-14 text-center">
                <p className="text-slate-500 text-sm font-medium mb-1">No posters yet</p>
                <p className="text-slate-400 text-[13px]">
                  Add the bot to a Telegram group and use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/add</code> to register posters.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          #
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 min-w-[160px]">
                          Poster
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 min-w-[120px]">
                          Channel
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Group
                        </th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Manager
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Rate
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Paid
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Remaining
                        </th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold tracking-[0.07em] uppercase text-slate-400 bg-slate-50 border-b-2 border-slate-200 whitespace-nowrap">
                          Views
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posters.map((p, i) => {
                        const remaining = Math.max(p.remaining, 0);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-data text-xs">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <a
                                  href={p.instagramLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[13px] font-semibold text-blue-600 hover:underline block mb-0.5"
                                >
                                  {p.username ? `@${p.username}` : p.instagramLink.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
                                </a>
                                {p.accountId && (
                                  <a
                                    href={`/admin/accounts/${p.accountId}`}
                                    className="text-[10px] text-slate-400 hover:text-blue-500"
                                  >
                                    View analytics →
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[13px] text-slate-700 font-medium">
                              {p.channelName}
                            </td>
                            <td className="px-4 py-3">
                              {p.groupLink ? (
                                <a
                                  href={p.groupLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  Open ↗
                                </a>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${MANAGER_COLORS[p.managedBy] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                {p.managedBy}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-data text-[13px] text-slate-600">
                              ₹{p.monthlyRate.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-data text-[13px] font-semibold text-green-700">
                              ₹{p.totalPaid.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-right font-data text-[13px] font-semibold ${remaining > 0 ? "text-amber-600" : "text-slate-400"}`}>
                              {remaining > 0 ? `₹${remaining.toLocaleString()}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.paidStatus] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                {p.paidStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-data text-[13px] font-bold text-slate-900">
                              {p.totalViews.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td className="px-4 py-3 font-bold text-[11px] tracking-[0.06em] uppercase text-slate-400" colSpan={5}>
                          {totalPosters} poster{totalPosters !== 1 ? "s" : ""} total
                        </td>
                        <td className="px-4 py-3 text-right font-data font-bold text-slate-700 text-[13px]">
                          ₹{posters.reduce((s, p) => s + p.monthlyRate, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-data font-bold text-green-700 text-[13px]">
                          ₹{totalPaidOut.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-data font-bold text-amber-600 text-[13px]">
                          ₹{totalRemaining.toLocaleString()}
                        </td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-right font-data font-bold text-slate-900 text-[13px]">
                          {totalViews.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          <p className="animate-fade-up [animation-delay:0.15s] text-[11px] text-slate-400 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Posters are added via the Telegram bot using /add command in the poster&apos;s group.
          </p>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl px-4 py-3.5 border-t-[3px] ${accent}`}>
      <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
        {label}
      </p>
      <p className="font-data text-xl font-medium text-slate-900 leading-none">
        {value}
        {sub && <span className="text-sm text-slate-400 font-normal ml-0.5">{sub}</span>}
      </p>
    </div>
  );
}
