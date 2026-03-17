"use client";

import { useState } from "react";

export default function RunSnapshotButton({ adminSecret }: { adminSecret: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setState("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-snapshot", {
        method: "POST",
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setState("success");
      setResult(`✓ Snapshotted ${data.snapshotted} reels`);
      setTimeout(() => { setState("idle"); setResult(null); }, 4000);
    } catch (err) {
      setState("error");
      setResult(err instanceof Error ? err.message : "Failed");
      setTimeout(() => { setState("idle"); setResult(null); }, 4000);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <button
        onClick={run}
        disabled={state === "loading"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 18px",
          background: state === "loading" ? "var(--slate-100)" : "var(--white)",
          border: "1px solid var(--slate-200)",
          borderRadius: 9,
          fontSize: 13,
          fontWeight: 500,
          color: state === "loading" ? "var(--slate-400)" : "var(--slate-700)",
          cursor: state === "loading" ? "not-allowed" : "pointer",
          fontFamily: "var(--font-dm-sans)",
          transition: "background 0.15s, border-color 0.15s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={e => {
          if (state !== "loading") {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--slate-50)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--slate-300)";
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = state === "loading" ? "var(--slate-100)" : "var(--white)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--slate-200)";
        }}
      >
        {state === "loading" ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
            </svg>
            Running…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Run snapshot
          </>
        )}
      </button>
      {result && (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: state === "success" ? "var(--green-500)" : "var(--red-500)",
        }}>
          {result}
        </span>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
