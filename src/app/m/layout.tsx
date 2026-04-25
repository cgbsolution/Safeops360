"use client";

import { useEffect } from "react";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <div className="min-h-screen bg-background">{children}</div>;
}
