"use client";

import { Button, Input } from "@nexora/ui";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Upload } from "lucide-react";

type ImageInputMode = "url" | "upload";

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  onAdd?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ImageField({
  value,
  onChange,
  onAdd,
  placeholder = "https://example.com/image.jpg or upload",
  disabled = false,
}: ImageFieldProps) {
  const [mode, setMode] = useState<ImageInputMode>("url");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function optimizeImage(file: File): Promise<File> {
    const MAX_DIM = 1920;
    const MAX_QUALITY = 0.85;
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width <= MAX_DIM && height <= MAX_DIM && file.size < 500 * 1024) {
          resolve(file);
          return;
        }
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type === "image/png" ? "image/png" : "image/jpeg",
          MAX_QUALITY,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Please select an image file (PNG, JPG, GIF, WebP)");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const optimized = await optimizeImage(file);
      const formData = new FormData();
      formData.append("file", optimized);
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Upload failed");
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
      onAdd?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      const isStorageError =
        typeof msg === "string" &&
        (msg.includes("503") || msg.includes("bucket") || msg.includes("storage"));
      setUploadError(
        isStorageError
          ? `${msg} — Ensure the Supabase Storage bucket "portfolio-images" exists and has public access.`
          : msg,
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleAddUrl() {
    if (value.trim()) onAdd?.();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "url"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Link2 className="h-4 w-4" />
          Paste URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "upload"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          {onAdd && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddUrl}
              disabled={!value.trim() || disabled}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 py-6 transition hover:border-zinc-400 hover:bg-zinc-100 ${
              disabled || uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            ) : (
              <Upload className="h-8 w-8 text-zinc-400" />
            )}
            <p className="text-sm text-zinc-600">
              {uploading ? "Uploading..." : "Click to select image"}
            </p>
            <p className="text-xs text-zinc-500">PNG, JPG, GIF, WebP (max 5MB)</p>
          </div>
          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
}
