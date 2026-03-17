import { cookies } from "next/headers";

async function getReels() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/reels`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load reels");
  }

  return (await res.json()) as {
    reels: {
      id: string;
      caption: string;
      thumbnailUrl: string;
      permalink: string;
      views: number;
      likes: number;
      comments: number;
    }[];
  };
}

function StatPill({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-full">
      <span className="text-[13px]">{icon}</span>
      <span className="font-data text-[13px] font-medium text-slate-700">
        {value.toLocaleString()}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default async function DashboardPage() {
  let data: {
    reels: {
      id: string;
      caption: string;
      thumbnailUrl: string;
      permalink: string;
      views: number;
      likes: number;
      comments: number;
    }[];
  } | null = null;
  let error: string | null = null;

  try {
    data = await getReels();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reels";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-[440px] w-full p-10 text-center bg-white border border-slate-200 rounded-xl">
          <div className="w-11 h-11 rounded-[10px] bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Session expired</h2>
          <p className="text-slate-500 text-sm mb-6">
            Please reconnect your Instagram account to view analytics.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm py-2.5 px-6 rounded-lg no-underline"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  const reels = data?.reels ?? [];
  const totalViews = reels.reduce((s, r) => s + r.views, 0);
  const totalLikes = reels.reduce((s, r) => s + r.likes, 0);
  const totalComments = reels.reduce((s, r) => s + r.comments, 0);

  const summaryCards = [
    { label: "Total Views", value: totalViews, color: "text-blue-600" },
    { label: "Total Likes", value: totalLikes, color: "text-rose-600" },
    { label: "Total Comments", value: totalComments, color: "text-cyan-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 px-8 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2.5" />
              <circle cx="17.5" cy="6.5" r="1" fill="white" />
            </svg>
          </div>
          <span className="font-semibold text-[15px] text-slate-900">
            Reel Analytics
          </span>
        </div>
        <a
          href="/"
          className="text-[13px] font-medium text-slate-500 no-underline py-1.5 px-3.5 rounded-[7px] border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          Disconnect
        </a>
      </header>

      <main className="max-w-[800px] mx-auto py-8 px-6">
        {/* Page heading */}
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
            Reels Performance
          </h1>
          <p className="text-slate-500 text-sm">
            {reels.length} reels · Latest metrics from your connected account
          </p>
        </div>

        {/* Summary cards */}
        {reels.length > 0 && (
          <div className="animate-fade-up [animation-delay:0.05s] grid grid-cols-3 gap-3 mb-6">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className="bg-white border border-slate-200 rounded-xl px-5 py-4"
              >
                <p className="text-[11px] font-semibold text-slate-500 tracking-[0.06em] uppercase mb-1.5">
                  {item.label}
                </p>
                <p className={`font-data text-[26px] font-medium ${item.color}`}>
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reels list */}
        {reels.length === 0 ? (
          <div className="animate-fade-up [animation-delay:0.1s] bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">
              No reels found yet. Post a reel and run the snapshot.
            </p>
          </div>
        ) : (
          <div className="animate-fade-up [animation-delay:0.1s] bg-white border border-slate-200 rounded-xl overflow-hidden">
            {reels.map((reel, i) => (
              <div
                key={reel.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${
                  i < reels.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                {reel.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reel.thumbnailUrl}
                    alt=""
                    className="w-[52px] h-[52px] rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-[52px] h-[52px] rounded-lg shrink-0 bg-blue-50 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#3b82f6" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" stroke="#3b82f6" strokeWidth="2" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate mb-1.5">
                    {reel.caption || "Untitled reel"}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <StatPill icon="👁" value={reel.views} label="views" />
                    <StatPill icon="♥" value={reel.likes} label="likes" />
                    <StatPill icon="💬" value={reel.comments} label="comments" />
                  </div>
                </div>

                {reel.permalink && (
                  <a
                    href={reel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium text-blue-500 no-underline py-1.5 px-3 rounded-md border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    View ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
