export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 flex flex-col items-center justify-center p-6">
      {/* Logo mark */}
      <div className="animate-fade-up w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mb-7 shadow-[0_8px_24px_rgba(37,99,235,0.25)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="animate-fade-up [animation-delay:0.05s] w-full max-w-[440px] px-10 pt-10 pb-9 text-center bg-white border border-slate-200 rounded-xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-5">
          <div className="w-[7px] h-[7px] rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-600 tracking-[0.05em]">
            INSTAGRAM ANALYTICS
          </span>
        </div>

        <h1 className="text-[28px] font-bold text-slate-900 mb-3 leading-tight tracking-tight">
          Reel Analytics
        </h1>
        <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
          Connect your Instagram account and track views, likes, and comments
          for all your Reels — updated daily.
        </p>

        <a
          href="/api/auth/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-semibold text-sm py-3.5 px-7 rounded-[10px] no-underline shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1" fill="white" />
          </svg>
          Connect Instagram
        </a>

        <p className="mt-4 text-xs text-slate-400">
          Requires a Business or Creator Instagram account
        </p>
      </div>

      <p className="animate-fade-up [animation-delay:0.1s] mt-6 text-xs text-slate-400">
        Internal analytics tool · Not a public service
      </p>
    </div>
  );
}
