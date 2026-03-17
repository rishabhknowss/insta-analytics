"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--slate-50)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: 20,
            fontWeight: 800,
            color: "var(--slate-900)",
            marginBottom: 4,
          }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate-500)" }}>
            Sign in to the analytics dashboard
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "28px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--slate-600)", letterSpacing: "0.03em" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                style={{
                  padding: "9px 12px",
                  fontSize: 14,
                  fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  border: "1px solid var(--slate-200)",
                  borderRadius: 8,
                  outline: "none",
                  background: "var(--white)",
                  color: "var(--slate-900)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--blue-500)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--slate-200)")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--slate-600)", letterSpacing: "0.03em" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  padding: "9px 12px",
                  fontSize: 14,
                  fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                  border: "1px solid var(--slate-200)",
                  borderRadius: 8,
                  outline: "none",
                  background: "var(--white)",
                  color: "var(--slate-900)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--blue-500)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--slate-200)")}
              />
            </div>

            {error && (
              <div style={{
                padding: "9px 12px",
                background: "var(--red-50)",
                border: "1px solid #fecaca",
                borderRadius: 8,
                fontSize: 13,
                color: "#dc2626",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "10px 0",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                background: loading ? "var(--slate-200)" : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                color: loading ? "var(--slate-400)" : "#ffffff",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--slate-400)" }}>
          Credentials set via <code style={{ fontFamily: "var(--font-dm-mono)" }}>ADMIN_EMAIL</code> &amp; <code style={{ fontFamily: "var(--font-dm-mono)" }}>ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
