"use client";

import { Button, Card, Input } from "@nexora/ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SkeletonListItem } from "@/components/Skeleton";

interface Project {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  tags: string[] | null;
}

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) setItems(await res.json());
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        linkUrl: form.linkUrl || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (editing) {
        const res = await fetch(`/api/admin/projects/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editing ? updated : i)));
          setEditing(null);
          resetForm();
          toast.success("Updated");
        } else toast.error("Failed to update");
      } else {
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [...prev, created]);
          resetForm();
          toast.success("Added");
        } else toast.error("Failed to add");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ title: "", description: "", imageUrl: "", linkUrl: "", tags: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (editing === id) setEditing(null);
        toast.success("Deleted");
      } else toast.error("Failed to delete");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function startEdit(item: Project) {
    setEditing(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      linkUrl: item.linkUrl ?? "",
      tags: (item.tags ?? []).join(", "),
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Projects"
        description="Projects shown in the Projects block on your portfolio"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects" }]}
      />

      <Card variant="outlined" className="mb-6 border-zinc-200 p-4">
        <h3 className="mb-3 font-medium">{editing ? "Edit project" : "Add project"}</h3>
        <div className="space-y-3">
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Project title"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description"
            rows={2}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <Input
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="Image URL"
          />
          <Input
            value={form.linkUrl}
            onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
            placeholder="Project URL"
          />
          <Input
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
            placeholder="Tags (comma-separated)"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Add project"}
            </Button>
            {editing && (
              <Button variant="secondary" onClick={() => { setEditing(null); resetForm(); }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Add projects to showcase your work. They appear in the Projects block on your portfolio."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} variant="outlined" className="border-zinc-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && <p className="mt-1 text-sm text-zinc-600">{item.description}</p>}
                  {(item.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(item.tags ?? []).map((t, i) => (
                        <span key={i} className="rounded bg-zinc-100 px-2 py-0.5 text-xs">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => startEdit(item)}>Edit</Button>
                  <Button variant="secondary" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
