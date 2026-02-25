"use client";

import { Button } from "@nexora/ui";
import {
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  Icon?: LucideIcon;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
  Icon = AlertTriangle,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger:
      "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning:
      "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    default:
      "bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-500",
  };

  const iconStyles = {
    danger: "text-red-600 bg-red-50",
    warning: "text-amber-600 bg-amber-50",
    default: "text-zinc-600 bg-zinc-100",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyles[variant]}`}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="text-lg font-semibold text-zinc-900">
              {title}
            </h2>
            <p id="confirm-desc" className="mt-1 text-sm text-zinc-600">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={loading}
            className={`rounded-lg px-4 py-2 font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
