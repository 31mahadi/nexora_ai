"use client";

import { Button, Card, Input } from "@nexora/ui";
import { useState } from "react";
import type { CSSProperties } from "react";

interface ContactFormBlockProps {
  title: string;
  subtitle: string;
  submitButtonText: string;
  successMessage: string;
  accentColor: string;
}

export function ContactFormBlock({
  title,
  subtitle,
  submitButtonText,
  successMessage,
  accentColor,
}: ContactFormBlockProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Failed to send");
        return;
      }
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Failed to send");
    } finally {
      setSubmitting(false);
    }
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            required
            rows={4}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-y"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={submitting}
          style={{ backgroundColor: accentColor, borderColor: accentColor } as CSSProperties}
        >
          {submitting ? "Sending…" : submitButtonText}
        </Button>
      </form>
    </Card>
  );
}
