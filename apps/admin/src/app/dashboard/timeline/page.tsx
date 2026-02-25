"use client";

import { Badge, Button, Card } from "@nexora/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SkeletonListItem } from "@/components/Skeleton";

const TYPES = ["achievement", "education", "role", "promotion", "award", "project", "blog"];

interface TimelineItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  tags: string[];
  visibility: string;
}

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/timeline");
        if (res.ok) {
          const data = (await res.json()) as TimelineItem[];
          setItems(data);
        }
      } catch {
        toast.error("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/timeline/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setConfirmDelete(null);
        toast.success("Timeline event deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  const sortedItems = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Timeline"
        description="Manage your career milestones and events"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timeline" }]}
      >
        <Link href="/dashboard/timeline/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Add event
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No timeline events yet"
          description="Add achievements, roles, projects, and more to build your professional timeline."
          actionLabel="Add your first event"
          actionHref="/dashboard/timeline/new"
        >
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {TYPES.slice(0, 5).map((t) => (
              <Badge key={t} variant="default">
                {t}
              </Badge>
            ))}
            <span className="text-xs text-zinc-500">+ more</span>
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <Card
              key={item.id}
              variant="outlined"
              className="flex flex-col gap-4 border-zinc-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <Badge variant="default" className="mb-2">
                  {item.type}
                </Badge>
                <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{item.description}</p>
                )}
                <span className="mt-2 inline-block text-xs text-zinc-500">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
              <div className="shrink-0">
                <Button
                  variant="secondary"
                  disabled={deleting === item.id}
                  onClick={() => setConfirmDelete({ id: item.id, title: item.title })}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {deleting === item.id ? "…" : "Delete"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete timeline event"
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
