import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import LogoutButton from "./_components/LogoutButton";
import ScrollNavbar from "./_components/ScrollNavbar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--slate-50)",
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
    }}>
      {/* Top nav */}
      <ScrollNavbar>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Brand + nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--slate-900)",
              }}>
                Reel Analytics
              </span>
            </a>
            <nav className="flex gap-0.5">
              <a href="/admin" className="text-[13px] font-medium text-slate-500 no-underline px-3 py-1.5 rounded-[7px] hover:bg-slate-100 hover:text-slate-900 transition-colors">Overview</a>
              <a href="/admin/manage" className="text-[13px] font-medium text-slate-500 no-underline px-3 py-1.5 rounded-[7px] hover:bg-slate-100 hover:text-slate-900 transition-colors">Manage</a>
            </nav>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "var(--blue-50)",
              border: "1px solid var(--blue-100)",
              borderRadius: 999,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue-500)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-600)", letterSpacing: "0.04em" }}>
                ADMIN
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </ScrollNavbar>

      {/* Page content */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px" }}>
        {children}
      </main>
    </div>
  );
}
