"use client";

import { Button, Card, Input } from "@nexora/ui";
import { useState } from "react";
import type { CSSProperties } from "react";

interface NewsletterBlockProps {
  buttonText: string;
  successMessage: string;
  accentColor: string;
}

export function NewsletterBlock({ buttonText, successMessage, accentColor }: NewsletterBlockProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <Card variant="outlined" className="border-zinc-200 bg-white/80">
        <p className="text-lg text-zinc-700">{successMessage}</p>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className="border-zinc-200 bg-white/80">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1"
        />
        <Button
          type="submit"
          style={{ backgroundColor: accentColor, borderColor: accentColor } as CSSProperties}
        >
          {buttonText}
        </Button>
      </form>
      <p className="mt-2 text-xs text-zinc-500">
        Newsletter signup is a placeholder. Connect to your email provider (e.g. Resend, Mailchimp) to enable.
      </p>
    </Card>
  );
}
