"use client";

import { Button, Card, Input } from "@nexora/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, excerpt: excerpt || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: string }).error ?? "Failed to create");
        toast.error("Failed to create post");
        return;
      }
      toast.success("Blog post created");
      router.push("/dashboard/blogs");
      router.refresh();
    } catch {
      setError("Failed to create");
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New blog post"
        description="Create a new post for your blog"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Blog", href: "/dashboard/blogs" },
          { label: "New" },
        ]}
      >
        <Link
          href="/dashboard/blogs"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
      </PageHeader>

      <Card variant="outlined" className="border-zinc-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            required
          />
          <Input
            label="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary for listings (optional)"
          />
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Content
            </label>
            <textarea
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[240px] resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post..."
              required
              rows={10}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create post"}
            </Button>
            <Link href="/dashboard/blogs">
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
