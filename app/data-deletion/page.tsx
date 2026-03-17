export const metadata = {
  title: "Data Deletion — Reel Analytics",
};

const CONTACT_EMAIL = "rishabhrai1515@gmail.com";
const APP_NAME = "Reel Analytics";

export default function DataDeletionPage() {
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
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 15, color: "var(--slate-900)" }}>
            {APP_NAME}
          </span>
        </a>
        <a href="/" style={{ fontSize: 13, color: "var(--slate-500)", textDecoration: "none" }}>← Back to home</a>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 8,
          }}>
            Data Deletion Instructions
          </h1>
          <p style={{ fontSize: 14, color: "var(--slate-500)", lineHeight: 1.6 }}>
            You can request the removal of all your data from {APP_NAME} at any time.
          </p>
        </div>

        {/* What gets deleted */}
        <div className="card" style={{ padding: "28px 32px", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "var(--slate-900)", marginBottom: 14 }}>
            What data will be deleted
          </h2>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Your Instagram User ID and username",
              "Your Instagram access token",
              "All Reel records synced from your account",
              "All daily metrics snapshots (views, likes, comments)",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--slate-600)" }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", background: "var(--red-50)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="card" style={{ padding: "28px 32px", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "var(--slate-900)", marginBottom: 18 }}>
            How to request deletion
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              {
                step: "1",
                title: "Revoke app access on Instagram",
                desc: "Go to Instagram \u2192 Settings \u2192 Security \u2192 Apps and Websites \u2192 find \u201cReel Analytics\u201d \u2192 Remove. This immediately revokes your access token.",
              },
              {
                step: "2",
                title: "Send a deletion request",
                desc: `Email us at ${CONTACT_EMAIL} with the subject "Data Deletion Request" and include your Instagram username (@handle). This is so we can locate and permanently delete your records.`,
              },
              {
                step: "3",
                title: "Confirmation",
                desc: "We will confirm deletion by email within 30 days. All your data will be permanently removed from our database.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: "flex", gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-dm-mono)", fontSize: 12, fontWeight: 700, color: "#fff",
                }}>
                  {step}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--slate-900)", marginBottom: 3 }}>{title}</p>
                  <p style={{ fontSize: 13, color: "var(--slate-500)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: "20px 24px",
          background: "var(--blue-50)",
          border: "1px solid var(--blue-100)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <p style={{ fontSize: 13, color: "var(--slate-600)", margin: 0 }}>
            Ready to delete your data? Send us an email.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Data%20Deletion%20Request`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 18px",
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Email deletion request
          </a>
        </div>

        <p style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 20, textAlign: "center" }}>
          For more information see our{" "}
          <a href="/privacy" style={{ color: "var(--blue-500)" }}>Privacy Policy</a>.
        </p>
      </main>
    </div>
  );
}
