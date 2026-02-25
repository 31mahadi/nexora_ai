"use client";

import { Button, Card } from "@nexora/ui";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/Skeleton";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function ContactPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/admin/contact-submissions");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSubmissions(data);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission?")) return;
    try {
      const res = await fetch(`/api/admin/contact-submissions?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Contact submissions"
        description="Messages from your portfolio contact form"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contact" },
        ]}
      />

      {submissions.length === 0 ? (
        <Card variant="outlined" className="border-zinc-200">
          <p className="text-zinc-600">No submissions yet.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Add a Contact Form block to your portfolio to receive messages here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id} variant="outlined" className="border-zinc-200">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-zinc-500">•</span>
                    <a href={`mailto:${s.email}`} className="text-sm text-indigo-600 hover:underline">
                      {s.email}
                    </a>
                  </div>
                  <p className="mt-2 text-zinc-700 whitespace-pre-wrap">{s.message}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDelete(s.id)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
