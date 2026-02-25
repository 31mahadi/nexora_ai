"use client";

import { Button, Card, Input } from "@nexora/ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Quote, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SkeletonListItem } from "@/components/Skeleton";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string | null;
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ quote: "", author: "", role: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) setItems(await res.json());
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.quote.trim() || !form.author.trim()) {
      toast.error("Quote and author are required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/testimonials/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote: form.quote,
            author: form.author,
            role: form.role || null,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editing ? updated : i)));
          setEditing(null);
          setForm({ quote: "", author: "", role: "" });
          toast.success("Updated");
        } else toast.error("Failed to update");
      } else {
        const res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote: form.quote,
            author: form.author,
            role: form.role || null,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [...prev, created]);
          setForm({ quote: "", author: "", role: "" });
          toast.success("Added");
        } else toast.error("Failed to add");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (editing === id) setEditing(null);
        toast.success("Deleted");
      } else toast.error("Failed to delete");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function startEdit(item: Testimonial) {
    setEditing(item.id);
    setForm({ quote: item.quote, author: item.author, role: item.role ?? "" });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Testimonials"
        description="Client testimonials shown in the Testimonials block"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Testimonials" }]}
      />

      <Card variant="outlined" className="mb-6 border-zinc-200 p-4">
        <h3 className="mb-3 font-medium">Add or edit testimonial</h3>
        <div className="space-y-3">
          <textarea
            value={form.quote}
            onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
            placeholder="Quote"
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <Input
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
            placeholder="Author name"
          />
          <Input
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            placeholder="Role (optional)"
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editing ? "Update" : "Add testimonial"}
          </Button>
          {editing && (
            <Button variant="secondary" onClick={() => { setEditing(null); setForm({ quote: "", author: "", role: "" }); }}>
              Cancel
            </Button>
          )}
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
          icon={Quote}
          title="No testimonials yet"
          description="Add testimonials from clients. They appear in the Testimonials block on your portfolio."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} variant="outlined" className="border-zinc-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="italic text-zinc-700">"{item.quote}"</p>
                  <p className="mt-2 font-medium">{item.author}</p>
                  {item.role && <p className="text-sm text-zinc-500">{item.role}</p>}
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
