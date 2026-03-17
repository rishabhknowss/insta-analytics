"use client";

import { useEffect, useState } from "react";

export default function ScrollNavbar({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      background: scrolled ? "rgba(255,255,255,0.92)" : "#ffffff",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: "1px solid var(--slate-200)",
      boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.07)" : "none",
      position: "sticky",
      top: 0,
      zIndex: 10,
      transition: "background 0.2s, box-shadow 0.2s, backdrop-filter 0.2s",
    }}>
      {children}
    </header>
  );
}
