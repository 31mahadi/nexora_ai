"use client";

import { useEffect } from "react";

interface AnalyticsScriptProps {
  script: string;
}

export function AnalyticsScript({ script }: AnalyticsScriptProps) {
  useEffect(() => {
    if (!script?.trim()) return;
    const div = document.createElement("div");
    div.innerHTML = script.trim();
    const scripts = div.querySelectorAll("script");
    scripts.forEach((el) => {
      const newScript = document.createElement("script");
      if (el.src) newScript.src = el.src;
      if (el.async) newScript.async = true;
      if (el.defer) newScript.defer = true;
      if (el.textContent) newScript.textContent = el.textContent;
      document.head.appendChild(newScript);
    });
  }, [script]);
  return null;
}
