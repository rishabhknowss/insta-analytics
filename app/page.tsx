export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f0f9ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      {/* Logo mark */}
      <div
        className="animate-up"
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div
        className="card animate-up animate-up-1"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "40px 40px 36px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--blue-50)",
            border: "1px solid var(--blue-100)",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 20,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue-500)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-600)", letterSpacing: "0.05em" }}>
            INSTAGRAM ANALYTICS
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Reel Analytics
        </h1>
        <p
          style={{
            color: "var(--slate-500)",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Connect your Instagram account and track views, likes, and comments
          for all your Reels — updated daily.
        </p>

        <a href="/api/auth/login" className="btn-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1" fill="white"/>
          </svg>
          Connect Instagram
        </a>

        <p style={{ marginTop: 16, fontSize: 12, color: "var(--slate-400)" }}>
          Requires a Business or Creator Instagram account
        </p>
      </div>

      <p className="animate-up animate-up-2" style={{ marginTop: 24, fontSize: 12, color: "var(--slate-400)" }}>
        Internal analytics tool · Not a public service
      </p>
    </div>
  );
}
