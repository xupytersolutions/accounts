"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("heroui-theme") || "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}