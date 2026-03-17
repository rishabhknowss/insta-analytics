"use client";

import { useEffect, useState } from "react";

export default function ScrollNavbar({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-10 border-b border-slate-200 transition-all duration-200 ${
        scrolled
          ? "bg-white/92 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.07)]"
          : "bg-white"
      }`}
    >
      {children}
    </header>
  );
}
