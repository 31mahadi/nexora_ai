"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function DarkModePreview() {
  const searchParams = useSearchParams();
  const isDark = searchParams.get("preview") === "1" && searchParams.get("dark") === "1";

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    return () => html.classList.remove("dark");
  }, [isDark]);

  return null;
}
