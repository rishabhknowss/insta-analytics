export const metadata = {
  title: "Privacy Policy — Reel Analytics",
};

const CONTACT_EMAIL = "rishabhrai1515@gmail.com";
const APP_NAME = "Reel Analytics";
const LAST_UPDATED = "March 17, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "var(--font-syne)",
        fontSize: 17,
        fontWeight: 700,
        color: "var(--slate-900)",
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: "1px solid var(--slate-200)",
      }}>
        {title}
      </h2>
      <div style={{ color: "var(--slate-600)", fontSize: 14, lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
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

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 8,
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate-400)" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="card" style={{ padding: "36px 40px" }}>

          <Section title="1. About This App">
            <p>
              {APP_NAME} (&ldquo;the App&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an Instagram analytics tool that allows Instagram Business account holders to view performance metrics for their Reels. This Privacy Policy explains what data we collect, how we use it, and your rights.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p style={{ marginBottom: 10 }}>When you connect your Instagram account, we collect and store:</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}><strong>Instagram User ID</strong> — your numeric Instagram user identifier</li>
              <li style={{ marginBottom: 6 }}><strong>Instagram Username</strong> — your @handle, used only for display</li>
              <li style={{ marginBottom: 6 }}><strong>Access Token</strong> — a short-lived token issued by Instagram, used to fetch your data; stored encrypted and never shared</li>
              <li style={{ marginBottom: 6 }}><strong>Reel Metadata</strong> — reel IDs, captions, thumbnail URLs, permalink URLs, and publish timestamps from your account</li>
              <li style={{ marginBottom: 6 }}><strong>Reel Metrics</strong> — views, likes, and comment counts as reported by the Instagram Graph API</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              We do <strong>not</strong> collect messages, contact lists, payment information, or any personal data beyond what is listed above.
            </p>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>To display your Reel analytics on your personal dashboard</li>
              <li style={{ marginBottom: 6 }}>To record daily performance snapshots so you can track trends over time</li>
              <li style={{ marginBottom: 6 }}>To identify your account when you reconnect</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              We do <strong>not</strong> sell, rent, or share your data with any third parties. We do not use your data for advertising or profiling.
            </p>
          </Section>

          <Section title="4. Instagram Platform Data">
            <p>
              This App uses the Instagram Graph API and complies with{" "}
              <a href="https://developers.facebook.com/policy/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-600)" }}>
                Meta&apos;s Platform Terms
              </a>{" "}
              and{" "}
              <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-600)" }}>
                Developer Policies
              </a>. Data obtained through the Instagram API is used only to provide the analytics features described in this policy and is not transferred to any other service.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Your access token is stored until you disconnect your account or it expires (Instagram short-lived tokens expire after 1 hour). Reel metrics snapshots are retained indefinitely to power historical trend charts. You can request deletion of all your data at any time — see Section 7.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              Access tokens are stored in a secured PostgreSQL database. All data is transmitted over HTTPS. We use industry-standard practices including HTTP-only cookies, signed JWTs, and environment-variable secrets. No credentials are stored in source code.
            </p>
          </Section>

          <Section title="7. Your Rights & Data Deletion">
            <p style={{ marginBottom: 10 }}>
              You have the right to access, correct, or delete your data at any time. To delete your data:
            </p>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>Visit our <a href="/data-deletion" style={{ color: "var(--blue-600)" }}>Data Deletion page</a> for instructions, or</li>
              <li style={{ marginBottom: 6 }}>Email us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--blue-600)" }}>{CONTACT_EMAIL}</a> with your Instagram username and request deletion</li>
            </ol>
            <p style={{ marginTop: 10 }}>
              We will delete all associated data within 30 days of a verified request.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              We use a single HTTP-only session cookie (<code style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, background: "var(--slate-100)", padding: "1px 5px", borderRadius: 4 }}>auth_session</code>) to keep you logged in. This cookie contains no personal information — only a signed token valid for 1 hour. No tracking or analytics cookies are used.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Continued use of the App after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For any privacy-related questions or data requests, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--blue-600)", fontWeight: 600 }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>

        </div>
      </main>
    </div>
  );
}
