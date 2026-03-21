import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import LogoutButton from "./_components/LogoutButton";
import ScrollNavbar from "./_components/ScrollNavbar";

const NAV = [
  { href: "/admin", label: "Overview", short: "Home" },
  { href: "/admin/manage", label: "Posters", short: "Posters" },
] as const;

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <ScrollNavbar>
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-[56px] sm:h-[60px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <a href="/admin" className="flex items-center gap-2 no-underline shrink-0">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-700 to-blue-500 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900 text-[15px] hidden sm:inline truncate max-w-[140px]">
                  Reel Analytics
                </span>
              </a>

              <nav
                className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl overflow-x-auto flex-1 sm:flex-initial max-w-[min(100%,280px)] sm:max-w-none"
                aria-label="Admin sections"
              >
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="shrink-0 min-h-[40px] min-w-[44px] px-3 sm:px-4 rounded-lg text-[13px] font-semibold text-slate-600 no-underline hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all flex items-center justify-center"
                  >
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                ADMIN
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </ScrollNavbar>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
}
