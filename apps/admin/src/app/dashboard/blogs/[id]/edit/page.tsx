"use client";

import { Button, Card, Input } from "@nexora/ui";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/Skeleton";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/blogs/${id}`);
        if (!res.ok) {
          setError("Post not found");
          return;
        }
        const data = (await res.json()) as {
          title: string;
          content: string;
          excerpt: string | null;
          published: boolean;
        };
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt ?? "");
        setPublished(data.published);
      } catch {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || undefined,
          published,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: string }).error ?? "Failed to save");
        toast.error("Failed to save");
        return;
      }
      toast.success("Changes saved");
      router.push("/dashboard/blogs");
      router.refresh();
    } catch {
      setError("Failed to save");
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/blogs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to blog
        </Link>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Edit post"
        description="Update your blog post"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Blog", href: "/dashboard/blogs" },
          { label: title || "Edit" },
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
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-zinc-700">Published</span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
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
