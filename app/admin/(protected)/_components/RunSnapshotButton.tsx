"use client";

import { useState } from "react";

export default function RunSnapshotButton() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setState("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-snapshot", { method: "POST" });
      const data = await res.json() as { snapshotted?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setState("success");
      setResult(`Snapshotted ${data.snapshotted} reels`);
      setTimeout(() => { setState("idle"); setResult(null); }, 4000);
    } catch (err) {
      setState("error");
      setResult(err instanceof Error ? err.message : "Failed");
      setTimeout(() => { setState("idle"); setResult(null); }, 4000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={run}
        disabled={state === "loading"}
        className={`inline-flex items-center gap-1.5 sm:gap-[7px] px-3 sm:px-[18px] py-2 sm:py-[9px] rounded-lg sm:rounded-[9px] text-xs sm:text-[13px] font-medium border shadow-sm transition-colors ${
          state === "loading"
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-white border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
        }`}
      >
        {state === "loading" ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">Running…</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Run snapshot</span>
          </>
        )}
      </button>
      {result && (
        <span className={`text-[11px] sm:text-xs font-medium ${state === "success" ? "text-green-500" : "text-red-500"}`}>
          {result}
        </span>
      )}
    </div>
  );
}
