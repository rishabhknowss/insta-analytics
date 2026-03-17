"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 text-xs font-semibold bg-transparent text-slate-500 border border-slate-200 rounded-[7px] cursor-pointer transition-colors hover:border-red-300 hover:text-red-600"
    >
      Sign out
    </button>
  );
}
