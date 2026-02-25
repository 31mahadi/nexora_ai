"use client";

import { Button } from "@nexora/ui";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <h1 className="text-2xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 text-zinc-600">We couldn&apos;t load this page. Please try again.</p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
