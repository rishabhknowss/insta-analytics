export const metadata = {
  title: "Terms of Service — Reel Analytics",
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

export default function TermsPage() {
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
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 8,
          }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate-400)" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="card" style={{ padding: "36px 40px" }}>

          <Section title="1. Acceptance of Terms">
            <p>
              By connecting your Instagram account to {APP_NAME} (&ldquo;the App&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to these Terms of Service. If you do not agree, do not use the App.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              {APP_NAME} is an analytics tool that connects to your Instagram Business account via the Instagram Graph API to display performance metrics for your Reels — including views, likes, and comments. The App is provided for personal and business analytics purposes only.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>You must have a valid Instagram Business or Creator account</li>
              <li style={{ marginBottom: 6 }}>You must be authorised to grant the App access to that account</li>
              <li style={{ marginBottom: 6 }}>You must be at least 13 years of age (or the minimum age in your jurisdiction)</li>
            </ul>
          </Section>

          <Section title="4. Instagram Platform Compliance">
            <p>
              Your use of this App is also governed by{" "}
              <a href="https://help.instagram.com/581066165581870" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-600)" }}>
                Instagram&apos;s Terms of Use
              </a>{" "}
              and{" "}
              <a href="https://developers.facebook.com/policy/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-600)" }}>
                Meta&apos;s Platform Terms
              </a>. We access your Instagram data only through official, permission-scoped API calls. You grant us permission to retrieve your Reel metadata and insights on your behalf solely to provide the analytics service.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p style={{ marginBottom: 10 }}>You agree not to:</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>Use the App in any way that violates Instagram&apos;s Platform Terms or Developer Policies</li>
              <li style={{ marginBottom: 6 }}>Attempt to reverse-engineer, scrape, or abuse the App&apos;s API endpoints</li>
              <li style={{ marginBottom: 6 }}>Share your session credentials or use automated scripts to access the service</li>
              <li style={{ marginBottom: 6 }}>Use the App for any unlawful purpose</li>
            </ul>
          </Section>

          <Section title="6. Data & Privacy">
            <p>
              Your privacy is important to us. Please review our{" "}
              <a href="/privacy" style={{ color: "var(--blue-600)" }}>Privacy Policy</a>, which is incorporated into these Terms by reference. By using the App you consent to our data practices as described there.
            </p>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              The App is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties of any kind. We do not warrant that the App will be uninterrupted, error-free, or that the metrics shown will be identical to those displayed in Instagram&apos;s own tools. Metrics are sourced directly from the Instagram Graph API and reflect Instagram&apos;s own reported values.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including but not limited to loss of data, business interruption, or loss of profits.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              You may disconnect your account and stop using the App at any time. We may suspend or terminate access if we reasonably believe you have violated these Terms. Upon termination, you may request deletion of your data per our Privacy Policy.
            </p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>
              We reserve the right to update these Terms at any time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Continued use of the App after changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about these Terms? Contact us at:{" "}
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
