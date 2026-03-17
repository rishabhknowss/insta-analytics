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
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 10px",
      background: "var(--slate-100)",
      borderRadius: 999,
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--slate-700)",
      }}>
        {value.toLocaleString()}
      </span>
      <span style={{ fontSize: 12, color: "var(--slate-500)" }}>{label}</span>
    </div>
  );
}

export default async function DashboardPage() {
  let data: { reels: { id: string; caption: string; thumbnailUrl: string; permalink: string; views: number; likes: number; comments: number }[] } | null = null;
  let error: string | null = null;

  try {
    data = await getReels();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reels";
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--slate-50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div className="card" style={{ maxWidth: 440, width: "100%", padding: "40px", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--red-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Session expired</h2>
          <p style={{ color: "var(--slate-500)", fontSize: 14, marginBottom: 24 }}>
            Please reconnect your Instagram account to view analytics.
          </p>
          <a href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            padding: "10px 24px",
            borderRadius: 8,
            textDecoration: "none",
          }}>
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--slate-50)",
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
    }}>
      {/* Nav */}
      <header style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--slate-200)",
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2.5"/>
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2.5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 15, color: "var(--slate-900)" }}>
            Reel Analytics
          </span>
        </div>
        <a href="/" style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--slate-500)",
          textDecoration: "none",
          padding: "6px 14px",
          borderRadius: 7,
          border: "1px solid var(--slate-200)",
          transition: "background 0.15s",
        }}>
          Disconnect
        </a>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Page heading */}
        <div className="animate-up" style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: 24,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 4,
          }}>
            Reels Performance
          </h1>
          <p style={{ color: "var(--slate-500)", fontSize: 14 }}>
            {reels.length} reels · Latest metrics from your connected account
          </p>
        </div>

        {/* Summary cards */}
        {reels.length > 0 && (
          <div className="animate-up animate-up-1" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}>
            {[
              { label: "Total Views", value: totalViews, color: "#2563eb", bg: "#eff6ff" },
              { label: "Total Likes", value: totalLikes, color: "#e11d48", bg: "#fff1f2" },
              { label: "Total Comments", value: totalComments, color: "#0891b2", bg: "#ecfeff" },
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--slate-500)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                  {item.label}
                </p>
                <p style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 26,
                  fontWeight: 500,
                  color: item.color,
                }}>
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reels list */}
        {reels.length === 0 ? (
          <div className="card animate-up animate-up-2" style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--slate-500)", fontSize: 14 }}>
              No reels found yet. Post a reel and run the snapshot.
            </p>
          </div>
        ) : (
          <div className="card animate-up animate-up-2" style={{ overflow: "hidden" }}>
            {reels.map((reel, i) => (
              <div
                key={reel.id}
                className="reel-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderBottom: i < reels.length - 1 ? "1px solid var(--slate-100)" : "none",
                }}
              >
                {/* Thumbnail */}
                {reel.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reel.thumbnailUrl}
                    alt=""
                    style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                    background: "var(--blue-50)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#3b82f6" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="4" stroke="#3b82f6" strokeWidth="2"/>
                    </svg>
                  </div>
                )}

                {/* Caption */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--slate-800)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 6,
                  }}>
                    {reel.caption || "Untitled reel"}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <StatPill icon="👁" value={reel.views} label="views" />
                    <StatPill icon="♥" value={reel.likes} label="likes" />
                    <StatPill icon="💬" value={reel.comments} label="comments" />
                  </div>
                </div>

                {/* Link */}
                {reel.permalink && (
                  <a
                    href={reel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--blue-500)",
                      textDecoration: "none",
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--blue-100)",
                      background: "var(--blue-50)",
                      transition: "background 0.15s",
                    }}
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
