"use client";

import { Button, Card, Input } from "@nexora/ui";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/Skeleton";

export default function ProfilePage() {
  const [bio, setBio] = useState("");
  const [tagline, setTagline] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/portfolio");
        if (!res.ok) {
          setError("Failed to load profile");
          return;
        }
        const data = (await res.json()) as {
          portfolio?: { bio?: string | null; tagline?: string | null; avatarUrl?: string | null };
        };
        if (data.portfolio) {
          setBio(data.portfolio.bio ?? "");
          setTagline(data.portfolio.tagline ?? "");
          setAvatarUrl(data.portfolio.avatarUrl ?? "");
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload/image", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Upload failed");
      }
      const data = (await res.json()) as { url: string };
      setAvatarUrl(data.url);
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio || null,
          tagline: tagline || null,
          avatarUrl: avatarUrl || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err as { error?: string }).error ?? "Failed to save");
        toast.error("Failed to save");
        return;
      }
      toast.success("Profile saved");
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
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <Skeleton className="h-[180px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Profile"
        description="Your portfolio bio and tagline appear on your public page"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
      />

      <Card variant="outlined" className="border-zinc-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Avatar</label>
            <p className="text-xs text-zinc-500 mb-2">
              Your profile photo appears in the Hero section of your portfolio.
            </p>
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-zinc-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-zinc-200 flex items-center justify-center">
                    <span className="text-2xl text-zinc-400">?</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... or upload"
                  className="w-full"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload image"}
                </Button>
              </div>
            </div>
          </div>
          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Full-stack developer & designer"
          />
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Bio
            </label>
            <textarea
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[180px] resize-y"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell visitors about yourself, your experience, and what you offer..."
              rows={6}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
