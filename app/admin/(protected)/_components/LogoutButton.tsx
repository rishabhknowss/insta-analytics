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
      style={{
        padding: "5px 14px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        background: "transparent",
        color: "var(--slate-500)",
        border: "1px solid var(--slate-200)",
        borderRadius: 7,
        cursor: "pointer",
        transition: "all 0.12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#fca5a5";
        (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--slate-200)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--slate-500)";
      }}
    >
      Sign out
    </button>
  );
}
