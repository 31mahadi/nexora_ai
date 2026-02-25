"use client";

import { Badge, Button, Card } from "@nexora/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonListItem } from "@/components/Skeleton";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/blogs");
        if (res.ok) {
          const data = (await res.json()) as Blog[];
          setBlogs(data);
        }
      } catch {
        toast.error("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setConfirmDelete(null);
        toast.success("Blog post deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Blog posts"
        description="Create and manage your blog content"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Blog" }]}
      >
        <Link href="/dashboard/blogs/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            New post
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No blog posts yet"
          description="Create your first post to share insights and build your audience."
          actionLabel="Create your first post"
          actionHref="/dashboard/blogs/new"
        />
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              variant="outlined"
              className="flex flex-col gap-4 border-zinc-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/dashboard/blogs/${blog.id}/edit`}
                  className="font-semibold text-zinc-900 hover:text-indigo-600 transition"
                >
                  {blog.title}
                </Link>
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                  {blog.excerpt ?? blog.slug}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={blog.published ? "success" : "default"}>
                    {blog.published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  disabled={deleting === blog.id}
                  onClick={() => setConfirmDelete({ id: blog.id, title: blog.title })}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {deleting === blog.id ? "…" : "Delete"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete blog post"
        description={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting !== null}
        onConfirm={() => { if (confirmDelete) void handleDelete(confirmDelete.id); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
