"use client";

import { Button, Card, Input } from "@nexora/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const TYPES = [
  "achievement",
  "education",
  "role",
  "promotion",
  "award",
  "project",
  "blog",
] as const;

export default function NewTimelinePage() {
  const router = useRouter();
  const [type, setType] = useState<(typeof TYPES)[number]>("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description: description || null,
          date,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: string }).error ?? "Failed to create");
        toast.error("Failed to add event");
        return;
      }
      toast.success("Timeline event added");
      router.push("/dashboard/timeline");
      router.refresh();
    } catch {
      setError("Failed to create");
      toast.error("Failed to add event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Add timeline event"
        description="Add a milestone, role, or achievement to your timeline"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Timeline", href: "/dashboard/timeline" },
          { label: "New" },
        ]}
      >
        <Link
          href="/dashboard/timeline"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
      </PageHeader>

      <Card variant="outlined" className="border-zinc-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Type
            </label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              value={type}
              onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Engineer at Acme"
            required
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[120px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about this event..."
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add event"}
            </Button>
            <Link href="/dashboard/timeline">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
