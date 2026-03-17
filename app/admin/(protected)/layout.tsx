import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import LogoutButton from "./_components/LogoutButton";
import ScrollNavbar from "./_components/ScrollNavbar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <ScrollNavbar>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/admin" className="flex items-center gap-2 no-underline shrink-0">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-700 to-blue-500 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-semibold text-[15px] text-slate-900 hidden sm:inline">
                Reel Analytics
              </span>
            </a>
            <nav className="flex gap-0.5">
              <a href="/admin" className="text-[13px] font-medium text-slate-500 no-underline px-2.5 sm:px-3 py-1.5 rounded-[7px] hover:bg-slate-100 hover:text-slate-900 transition-colors">Overview</a>
              <a href="/admin/manage" className="text-[13px] font-medium text-slate-500 no-underline px-2.5 sm:px-3 py-1.5 rounded-[7px] hover:bg-slate-100 hover:text-slate-900 transition-colors">Manage</a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
              <div className="w-[7px] h-[7px] rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-blue-600 tracking-[0.04em]">ADMIN</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </ScrollNavbar>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}
