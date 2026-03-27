import { getPosterRows, type PosterRow } from "@/lib/adminQueries";
import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import DeletePosterButton from "./_components/DeletePosterButton";

const MANAGER_COLORS: Record<string, string> = {
  ROHIT: "bg-violet-50 text-violet-700 border-violet-200",
  UJJWAL: "bg-amber-50 text-amber-700 border-amber-200",
  RISHABH: "bg-blue-50 text-blue-700 border-blue-200",
  RONIN: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const FILTERS: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Rohit", value: "ROHIT" },
  { label: "Ujjwal", value: "UJJWAL" },
  { label: "Rishabh", value: "RISHABH" },
  { label: "Ronin", value: "RONIN" },
];

function posterHandle(p: PosterRow) {
  return p.username
    ? `@${p.username}`
    : p.instagramLink.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "");
}

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ manager?: string }>;
}) {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  const sp = await searchParams;
  const managerKey = sp.manager?.toUpperCase() ?? null;
  const activeFilter =
    managerKey && ["ROHIT", "UJJWAL", "RISHABH", "RONIN"].includes(managerKey) ? managerKey : null;

  let posters: PosterRow[] = [];
  let error: string | null = null;

  try {
    posters = await getPosterRows(activeFilter);
  } catch {
    error = "Could not load poster data.";
  }

  const totalPaid = posters.reduce((s, p) => s + p.totalPaid, 0);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Posters</h1>
        <p className="text-sm text-slate-500 mt-1">Payments and Telegram groups</p>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <Stat label="Posters" value={posters.length} />
            <Stat label="Paid (total)" value={`₹${totalPaid.toLocaleString("en-IN")}`} accent="text-green-700" />
          </div>

          {/* Manager filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const href = f.value ? `/admin/manage?manager=${f.value}` : "/admin/manage";
              const isActive = activeFilter === f.value || (f.value === null && !activeFilter);
              return (
                <a
                  key={f.label}
                  href={href}
                  className={`inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl text-sm font-semibold no-underline transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </a>
              );
            })}
          </div>

          {posters.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl py-14 px-4 text-center">
              <p className="text-slate-600 font-medium">No posters here</p>
              <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                In a group: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/add</code> Instagram link
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 lg:hidden">
                {posters.map((p) => (
                  <article
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <a
                          href={p.instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 text-[15px] truncate block"
                        >
                          {posterHandle(p)}
                        </a>
                        {p.accountId && (
                          <a
                            href={`/admin/accounts/${p.accountId}`}
                            className="text-xs text-slate-400 mt-0.5 inline-block"
                          >
                            Analytics
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${
                            MANAGER_COLORS[p.managedBy] ?? "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {p.managedBy}
                        </span>
                        <DeletePosterButton posterId={p.id} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 font-medium mb-1">{p.channelName}</p>
                    {p.groupLink ? (
                      <a
                        href={p.groupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 mb-3 inline-block"
                      >
                        Open group
                      </a>
                    ) : null}
                    <div className="mt-2 pt-3 border-t border-slate-100">
                      <div className="text-center py-2 bg-green-50 rounded-xl max-w-[200px]">
                        <p className="font-data text-sm font-bold text-green-800">
                          ₹{p.totalPaid.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase mt-0.5">Paid</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3">Poster</th>
                        <th className="px-4 py-3">Channel</th>
                        <th className="px-4 py-3">Group</th>
                        <th className="px-4 py-3 text-center">Manager</th>
                        <th className="px-4 py-3 text-right">Paid</th>
                        <th className="px-3 py-3 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posters.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3">
                            <a
                              href={p.instagramLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {posterHandle(p)}
                            </a>
                            {p.accountId && (
                              <a
                                href={`/admin/accounts/${p.accountId}`}
                                className="block text-xs text-slate-400 mt-0.5"
                              >
                                Analytics
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{p.channelName}</td>
                          <td className="px-4 py-3">
                            {p.groupLink ? (
                              <a href={p.groupLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">
                                Open
                              </a>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${
                                MANAGER_COLORS[p.managedBy] ?? "bg-slate-50"
                              }`}
                            >
                              {p.managedBy}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-data font-semibold text-green-700">
                            ₹{p.totalPaid.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-3">
                            <DeletePosterButton posterId={p.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-slate-400">
            Bot: <code className="bg-slate-100 px-1 rounded">/add</code>,{" "}
            <code className="bg-slate-100 px-1 rounded">/paid</code>,{" "}
            <code className="bg-slate-100 px-1 rounded">/remove</code> (groups only)
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <p className={`font-data text-lg font-semibold text-slate-900 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}
