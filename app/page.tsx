export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/40 to-slate-50 flex flex-col items-center">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="w-full flex flex-col items-center px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="animate-fade-up w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[14px] bg-linear-to-br from-blue-600 to-blue-500 flex items-center justify-center mb-6 sm:mb-7 shadow-[0_8px_24px_rgba(37,99,235,0.22)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="sm:w-[26px] sm:h-[26px]">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
            <circle cx="17.5" cy="6.5" r="1" fill="white"/>
          </svg>
        </div>

        <div className="animate-fade-up [animation-delay:0.05s] w-full max-w-[440px] px-6 sm:px-10 pt-8 sm:pt-10 pb-7 sm:pb-9 text-center bg-white border border-slate-200 rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4 sm:mb-5">
            <div className="w-[7px] h-[7px] rounded-full bg-blue-500"/>
            <span className="text-[11px] sm:text-xs font-semibold text-blue-600 tracking-[0.05em]">
              INSTAGRAM ANALYTICS
            </span>
          </div>

          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mb-2.5 sm:mb-3 leading-tight tracking-tight">
            Reel Analytics
          </h1>
          <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed mb-6 sm:mb-8">
            Connect your Instagram account and track views, likes, and comments
            for all your Reels — updated daily.
          </p>

          <a
            href="/api/auth/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-linear-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm py-3 sm:py-3.5 px-7 rounded-[10px] no-underline shadow-[0_4px_14px_rgba(37,99,235,0.28)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,0.38)] active:translate-y-0 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1" fill="white"/>
            </svg>
            Connect Instagram
          </a>

          <p className="mt-3.5 sm:mt-4 text-[11px] sm:text-xs text-slate-400">
            Requires a Business or Creator Instagram account
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-blue-500 mb-2">Process</p>
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight">How it works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {[
            {
              n: "01",
              title: "Connect",
              body: "Authorize via Instagram OAuth. We request read-only access — nothing is ever posted.",
            },
            {
              n: "02",
              title: "Track",
              body: "We fetch your Reels and record daily snapshots of views, likes, and comments automatically.",
            },
            {
              n: "03",
              title: "Analyze",
              body: "See trends over time, spot your best-performing content, and compare across accounts.",
            },
          ].map((step) => (
            <div key={step.n} className="bg-white px-6 sm:px-7 py-7 sm:py-8">
              <span className="text-[11px] font-bold tracking-widest text-blue-400 mb-3 block">{step.n}</span>
              <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT YOU GET ─────────────────────────────────────────── */}
      <section className="w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-blue-500 mb-2">Features</p>
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight">What you get</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              title: "View tracking",
              body: "Daily view counts per Reel, with cumulative and delta trends over time.",
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: "Likes & comments",
              body: "Full engagement breakdown — not just views — for every piece of content.",
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: "Daily snapshots",
              body: "Data is collected every day automatically. No manual refreshes needed.",
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: "Multi-account",
              body: "Connect multiple Instagram accounts and switch between them on one dashboard.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-slate-200 rounded-xl px-5 sm:px-6 py-5 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div>
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAFE & TRUSTED ───────────────────────────────────────── */}
      <section className="w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-green-500 mb-1">Security</p>
            <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">Safe &amp; trusted</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              {
                icon: (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Read-only access",
                body: "We only request permission to read your insights. We cannot post, comment, or modify anything on your account.",
              },
              {
                icon: (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Official Meta API",
                body: "Built on the Instagram Graph API — the same infrastructure Meta provides to all verified business tools.",
              },
              {
                icon: (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Delete anytime",
                body: "Revoke access from Instagram settings at any time. We delete your stored data on request, no questions asked.",
              },
            ].map((t) => (
              <div key={t.title} className="px-6 sm:px-7 py-5 sm:py-6 flex gap-3.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                  {t.icon}
                </div>
                <div>
                  <h3 className="text-[12px] sm:text-[13px] font-semibold text-slate-900 mb-1">{t.title}</h3>
                  <p className="text-[11px] sm:text-[12px] text-slate-500 leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-blue-500 mb-2">Questions</p>
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight">Frequently asked</h2>
        </div>

        <div className="flex flex-col gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {[
            {
              q: "Do I need a Business or Creator account?",
              a: "Yes. The Instagram Graph API only works with Business and Creator accounts. Personal accounts do not have access to Insights data.",
            },
            {
              q: "How often is data updated?",
              a: "Snapshots are taken once per day automatically. Views, likes, and comments are recorded as daily totals for each of your Reels.",
            },
            {
              q: "Can this tool post or change anything on my account?",
              a: "No. We only request read permissions (instagram_business_basic and instagram_business_manage_insights). Posting, editing, or deleting content is not possible with these permissions.",
            },
            {
              q: "How do I remove my data?",
              a: "You can revoke access from your Instagram app under Settings → Apps and Websites. To request deletion of your stored data, visit the Data Deletion page linked in the footer.",
            },
          ].map((item, i) => (
            <details key={i} className="group bg-white">
              <summary className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 cursor-pointer select-none list-none">
                <span className="text-[13px] sm:text-[14px] font-semibold text-slate-800 pr-4">{item.q}</span>
                <svg
                  className="shrink-0 text-slate-400 group-open:rotate-45 transition-transform duration-200"
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </summary>
              <div className="px-5 sm:px-6 pb-4 sm:pb-5 -mt-1">
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="w-full max-w-3xl px-4 sm:px-6 pt-4 pb-12 sm:pb-14 mt-4">
        <div className="border-t border-slate-200 pt-7 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-linear-to-br from-blue-600 to-blue-500 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2.5"/>
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2.5"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-slate-700">Reel Analytics</span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Data Deletion", href: "/data-deletion" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] sm:text-[12px] text-slate-400 hover:text-slate-700 transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} Reel Analytics
          </p>
        </div>
      </footer>

    </div>
  );
}
