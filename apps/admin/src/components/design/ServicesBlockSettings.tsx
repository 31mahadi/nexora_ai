"use client";

import { Card, Input } from "@nexora/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Copy, GripVertical, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { BuilderBlock } from "@nexora/portfolio-builder";
import { SEGMENT_ICONS } from "@nexora/portfolio-builder";

const LABEL_CLASS = "text-[11px] font-medium text-zinc-600 mb-1 block";
const SECTION_TITLE = "text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2";
const SELECT_COMPACT =
  "h-9 w-full max-w-[180px] rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 box-border";

function InlineExpand({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-600 hover:bg-zinc-100/80 transition"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {label}
      </button>
      {open && <div className="border-t border-zinc-200 p-3 space-y-2 bg-white">{children}</div>}
    </div>
  );
}

export type ServicesComponentType = "title" | "subtitle" | "services";

export interface ServicesBlockSettingsProps {
  block: BuilderBlock;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme: { primary: string; accent: string };
  FONT_OPTIONS: { value: string; label: string }[];
  selectedComponent?: ServicesComponentType | null;
  onClearSelection?: () => void;
}

const COMPONENT_LABELS: Record<ServicesComponentType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  services: "Services",
};

interface ServiceItem {
  title?: string;
  description?: string;
  icon?: string;
}

function ServiceIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = SEGMENT_ICONS.find((i) => i.value === value) ?? SEGMENT_ICONS[0];
  const searchLower = search.trim().toLowerCase();
  const filtered = searchLower
    ? SEGMENT_ICONS.filter(
        (i) =>
          i.label.toLowerCase().includes(searchLower) ||
          (i.group && i.group.toLowerCase().includes(searchLower))
      )
    : SEGMENT_ICONS;
  const byGroup = filtered.reduce<Record<string, typeof SEGMENT_ICONS>>((acc, item) => {
    const g = item.group || "\0";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});
  const groups = Object.entries(byGroup).sort(([a], [b]) => (a === "\0" ? -1 : b === "\0" ? 1 : a.localeCompare(b)));

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50"
        title="Choose service icon"
      >
        <span className="text-base leading-none">{selected.emoji || "—"}</span>
        <span className="max-w-[4rem] truncate text-xs text-zinc-600">{selected.label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 max-h-64 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50">
          <div className="sticky top-0 border-b border-zinc-200 bg-zinc-50 p-2">
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-zinc-400"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-zinc-500">No icons match</p>
            ) : searchLower && groups.length <= 1 ? (
              <div className="grid grid-cols-5 gap-1">
                {filtered.map((opt) => (
                  <button
                    key={opt.value || "none"}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-md p-2 text-center transition ${
                      value === opt.value
                        ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                        : "hover:bg-zinc-100 text-zinc-700"
                    }`}
                    title={opt.label}
                  >
                    <span className="text-xl leading-none">{opt.emoji || "—"}</span>
                    <span className="text-[10px] font-medium truncate w-full">{opt.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map(([groupName, items]) => (
                  <div key={groupName}>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {groupName === "\0" ? "General" : groupName}
                    </p>
                    <div className="grid grid-cols-5 gap-1">
                      {items.map((opt) => (
                        <button
                          key={opt.value || "none"}
                          type="button"
                          onClick={() => {
                            onChange(opt.value);
                            setOpen(false);
                          }}
                          className={`flex flex-col items-center justify-center gap-0.5 rounded-md p-2 text-center transition ${
                            value === opt.value
                              ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                              : "hover:bg-zinc-100 text-zinc-700"
                          }`}
                          title={opt.label}
                        >
                          <span className="text-xl leading-none">{opt.emoji || "—"}</span>
                          <span className="text-[10px] font-medium truncate w-full">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SortableServiceItem({
  id,
  service,
  serviceIdx,
  displayItems,
  blockId,
  updateBlockSettings,
}: {
  id: string;
  service: ServiceItem;
  serviceIdx: number;
  displayItems: ServiceItem[];
  blockId: string;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 flex shrink-0 cursor-grab items-center justify-center rounded border border-zinc-300 bg-zinc-100 px-2 py-1.5 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-200 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <ServiceIconPicker
              value={service.icon ?? ""}
              onChange={(v) => {
                const n = [...displayItems];
                n[serviceIdx] = { ...n[serviceIdx], icon: v || undefined };
                updateBlockSettings(blockId, { items: n });
              }}
            />
            <Input
              value={service.title ?? ""}
              onChange={(e) => {
                const n = [...displayItems];
                n[serviceIdx] = { ...n[serviceIdx], title: e.target.value };
                updateBlockSettings(blockId, { items: n });
              }}
              placeholder="Service title"
              className="min-w-0 flex-1"
            />
          </div>
          <textarea
            value={service.description ?? ""}
            onChange={(e) => {
              const n = [...displayItems];
              n[serviceIdx] = { ...n[serviceIdx], description: e.target.value };
              updateBlockSettings(blockId, { items: n });
            }}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center justify-center rounded border border-zinc-300 bg-zinc-100 p-1.5 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
          onClick={() => {
            const src = displayItems[serviceIdx];
            const dup = { title: src.title ?? "", description: src.description ?? "", icon: src.icon };
            const n = [...displayItems];
            n.splice(serviceIdx + 1, 0, dup);
            updateBlockSettings(blockId, { items: n });
          }}
          aria-label="Duplicate service"
          title="Duplicate service"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex shrink-0 items-center justify-center rounded border border-zinc-300 bg-zinc-100 p-1.5 text-zinc-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            const n = displayItems.filter((_, i) => i !== serviceIdx);
            updateBlockSettings(blockId, { items: n });
          }}
          aria-label="Remove service"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ServicesBlockSettings({
  block,
  updateBlockSettings,
  theme,
  FONT_OPTIONS,
  selectedComponent = null,
  onClearSelection,
}: ServicesBlockSettingsProps) {
  const [importLoading, setImportLoading] = useState(false);
  const show = (...components: ServicesComponentType[]) =>
    !selectedComponent || components.includes(selectedComponent);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const displayItems: ServiceItem[] = Array.isArray(block.settings.items)
    ? (block.settings.items as ServiceItem[])
    : [];

  const handleServiceDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const serviceIds = displayItems.map((_, i) => `svc-${i}`);
      const fromIdx = serviceIds.indexOf(String(active.id));
      const toIdx = serviceIds.indexOf(String(over.id));
      if (fromIdx < 0 || toIdx < 0) return;
      const n = arrayMove(displayItems, fromIdx, toIdx);
      updateBlockSettings(block.id, { items: n });
    },
    [displayItems, block.id, updateBlockSettings]
  );

  return (
    <div className="space-y-4">
      {selectedComponent && onClearSelection && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <span className="text-sm font-medium text-indigo-800">
            Editing: {COMPONENT_LABELS[selectedComponent]}
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
          >
            Show all
          </button>
        </div>
      )}

      {/* 1. Content */}
      <div className="space-y-3">
        <p className={SECTION_TITLE}>Content</p>
        <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3 space-y-3">
          {show("title") && (
            <div>
              <label className={LABEL_CLASS}>Title</label>
              <Input
                value={String(block.settings.title ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
                placeholder="Section title"
              />
            </div>
          )}
          {show("subtitle") && (
            <div>
              <label className={LABEL_CLASS}>Subtitle</label>
              <Input
                value={String(block.settings.subtitle ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
                placeholder="Subtitle (optional)"
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS}>Empty state message</label>
            <Input
              value={String(block.settings.emptyMessage ?? "")}
              onChange={(e) => updateBlockSettings(block.id, { emptyMessage: e.target.value })}
              placeholder="Add services below or from your admin profile."
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Data source</label>
            <select
              value={String(block.settings.servicesDataSource ?? "auto")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  servicesDataSource: e.target.value as "auto" | "block" | "profile",
                })
              }
              className={SELECT_COMPACT}
            >
              <option value="auto">Auto (block → profile)</option>
              <option value="block">Block only (manual items)</option>
              <option value="profile">Profile only (from API)</option>
            </select>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {String(block.settings.servicesDataSource ?? "auto") === "profile"
                ? "Services come from your profile only. Items below are ignored."
                : String(block.settings.servicesDataSource ?? "auto") === "block"
                  ? "Only manual items below are shown. Profile services are ignored."
                  : "Auto: use block items, or profile services if empty"}
            </p>
          </div>
          <button
            type="button"
            disabled={importLoading}
            className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={async () => {
              setImportLoading(true);
              try {
                const res = await fetch("/api/admin/portfolio");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = (await res.json()) as {
                  services?: { id: string; title: string; description: string | null }[];
                };
                const apiServices = data.services ?? [];
                if (apiServices.length === 0) {
                  toast.info("No services in profile");
                  return;
                }
                const items = apiServices.map((s) => ({
                  title: s.title,
                  description: s.description ?? "",
                }));
                updateBlockSettings(block.id, { items, servicesDataSource: "block" });
                toast.success(`Imported ${apiServices.length} services`);
              } catch {
                toast.error("Failed to import services");
              } finally {
                setImportLoading(false);
              }
            }}
          >
            {importLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {importLoading ? "Importing..." : "Import from profile"}
          </button>
        </div>
      </div>

      {/* 2. Header (Title & Subtitle) */}
      <div className="space-y-2">
        <p className={SECTION_TITLE}>Header</p>
        <InlineExpand
          label="Title & Subtitle"
          defaultOpen={!!selectedComponent && (selectedComponent === "title" || selectedComponent === "subtitle")}
        >
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLASS}>Alignment</label>
              <select
                value={String(block.settings.servicesHeaderAlign ?? "left")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    servicesHeaderAlign: e.target.value as "left" | "center" | "right",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              <p className="mt-0.5 text-[10px] text-zinc-500">Title and subtitle alignment</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
                Title typography
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={LABEL_CLASS}>Font</label>
                  <select
                    value={String(block.settings.servicesTitleFontFamily ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesTitleFontFamily: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Size</label>
                  <select
                    value={String(block.settings.servicesTitleFontSize ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesTitleFontSize: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="2xl">2xl</option>
                    <option value="3xl">3xl</option>
                    <option value="4xl">4xl</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Weight</label>
                  <select
                    value={String(block.settings.servicesTitleFontWeight ?? "bold")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesTitleFontWeight: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Color</label>
                  <select
                    value={String(block.settings.servicesTitleColor ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesTitleColor: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="primary">Primary</option>
                    <option value="accent">Accent</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {String(block.settings.servicesTitleColor ?? "inherit") === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(
                          String(block.settings.servicesTitleCustomColor ?? "")
                        )
                          ? String(block.settings.servicesTitleCustomColor)
                          : theme.accent
                      }
                      onChange={(e) =>
                        updateBlockSettings(block.id, { servicesTitleCustomColor: e.target.value })
                      }
                      className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                    />
                  </div>
                  <Input
                    value={String(block.settings.servicesTitleCustomColor ?? theme.accent)}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesTitleCustomColor: e.target.value })
                    }
                    placeholder="#18181b"
                    className="h-9 flex-1 font-mono text-sm"
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
                Subtitle typography
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={LABEL_CLASS}>Weight</label>
                  <select
                    value={String(block.settings.servicesSubtitleFontWeight ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesSubtitleFontWeight: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Font</label>
                  <select
                    value={String(block.settings.servicesSubtitleFontFamily ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesSubtitleFontFamily: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Size</label>
                  <select
                    value={String(block.settings.servicesSubtitleFontSize ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesSubtitleFontSize: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Color</label>
                  <select
                    value={String(block.settings.servicesSubtitleColor ?? "inherit")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { servicesSubtitleColor: e.target.value })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="primary">Primary</option>
                    <option value="accent">Accent</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {String(block.settings.servicesSubtitleColor ?? "inherit") === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(
                          String(block.settings.servicesSubtitleCustomColor ?? "")
                        )
                          ? String(block.settings.servicesSubtitleCustomColor)
                          : "#52525b"
                      }
                      onChange={(e) =>
                        updateBlockSettings(block.id, {
                          servicesSubtitleCustomColor: e.target.value,
                        })
                      }
                      className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                    />
                  </div>
                  <Input
                    value={String(block.settings.servicesSubtitleCustomColor ?? "#52525b")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        servicesSubtitleCustomColor: e.target.value,
                      })
                    }
                    placeholder="#52525b"
                    className="h-9 flex-1 font-mono text-sm"
                  />
                </div>
              )}
            </div>
            <div>
              <label className={LABEL_CLASS}>Header gap</label>
              <select
                value={String(block.settings.headerGap ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    headerGap: e.target.value as "none" | "sm" | "md" | "lg",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
              <p className="mt-0.5 text-[10px] text-zinc-500">Title ↔ subtitle</p>
            </div>
          </div>
        </InlineExpand>
      </div>

      {/* 3. Layout */}
      <div className="space-y-2">
        <p className={SECTION_TITLE}>Layout</p>
        <InlineExpand label="Section layout">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Columns</label>
              <Input
                type="number"
                min={1}
                max={6}
                value={String(block.settings.columns ?? 2)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    columns: Math.min(6, Math.max(1, Number(e.target.value) || 2)),
                  })
                }
                placeholder="1–6"
                className="h-9"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Service layout</label>
              <select
                value={String(block.settings.serviceLayout ?? "grid")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceLayout: e.target.value as "grid" | "list" | "compact",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Card style</label>
              <select
                value={String(block.settings.serviceCardStyle ?? "bordered")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceCardStyle: e.target.value as "bordered" | "elevated" | "minimal",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="bordered">Bordered</option>
                <option value="elevated">Elevated (shadow)</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Alignment</label>
              <select
                value={String(block.settings.serviceAlignment ?? "left")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceAlignment: e.target.value as "left" | "center" | "right",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Max services</label>
              <Input
                type="number"
                min={0}
                value={String(block.settings.maxServices ?? 0)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    maxServices: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                placeholder="0 = no limit"
                className="h-9"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Service gap</label>
              <select
                value={String(block.settings.serviceGap ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceGap: e.target.value as "none" | "sm" | "md" | "lg",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
              <p className="mt-0.5 text-[10px] text-zinc-500">Between cards</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Columns (mobile)</label>
              <Input
                type="number"
                min={0}
                max={6}
                value={String(block.settings.columnsMobile ?? 0)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    columnsMobile: Math.min(6, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                placeholder="0 = same as desktop"
                className="h-9"
              />
              <p className="mt-0.5 text-[10px] text-zinc-500">Override on small screens</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Section ID (anchor)</label>
              <Input
                value={String(block.settings.sectionId ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { sectionId: e.target.value })}
                placeholder="e.g. services"
              />
            </div>
          </div>
        </InlineExpand>
        <InlineExpand label="Section style">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Background</label>
              <select
                value={String(block.settings.sectionBgColor ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    sectionBgColor: e.target.value as "none" | "light" | "custom",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="light">Light gray</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {String(block.settings.sectionBgColor ?? "none") === "custom" && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                  <input
                    type="color"
                    value={
                      /^#[0-9A-Fa-f]{6}$/.test(
                        String(block.settings.sectionBgCustomColor ?? "")
                      )
                        ? String(block.settings.sectionBgCustomColor)
                        : "#fafafa"
                    }
                    onChange={(e) =>
                      updateBlockSettings(block.id, { sectionBgCustomColor: e.target.value })
                    }
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.sectionBgCustomColor ?? "#fafafa")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, { sectionBgCustomColor: e.target.value })
                  }
                  placeholder="#fafafa"
                  className="h-9 flex-1 font-mono text-sm"
                />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>Padding</label>
              <select
                value={String(block.settings.sectionPadding ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    sectionPadding: e.target.value as "none" | "sm" | "md" | "lg",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Border</label>
              <select
                value={String(block.settings.sectionBorder ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    sectionBorder: e.target.value as "none" | "top" | "full",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="top">Top only</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>
        </InlineExpand>
        <InlineExpand label="Service card">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Hover effect</label>
              <select
                value={String(block.settings.serviceHoverEffect ?? "subtle")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceHoverEffect: e.target.value as "none" | "subtle" | "lift" | "glow",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="subtle">Subtle (opacity)</option>
                <option value="lift">Lift (scale)</option>
                <option value="glow">Glow (shadow)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Title font size</label>
              <select
                value={String(block.settings.serviceTitleFontSize ?? "base")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceTitleFontSize: e.target.value as "sm" | "base" | "lg",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="sm">Small</option>
                <option value="base">Base</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Title font weight</label>
              <select
                value={String(block.settings.serviceTitleFontWeight ?? "semibold")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceTitleFontWeight: e.target.value as "normal" | "medium" | "semibold" | "bold",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Description font size</label>
              <select
                value={String(block.settings.serviceDescriptionFontSize ?? "sm")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceDescriptionFontSize: e.target.value as "xs" | "sm" | "base",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="xs">Extra small</option>
                <option value="sm">Small</option>
                <option value="base">Base</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Description color</label>
              <select
                value={String(block.settings.serviceDescriptionColor ?? "muted")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceDescriptionColor: e.target.value as "inherit" | "muted" | "custom",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="inherit">Inherit</option>
                <option value="muted">Muted (gray)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {String(block.settings.serviceDescriptionColor ?? "muted") === "custom" && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                  <input
                    type="color"
                    value={
                      /^#[0-9A-Fa-f]{6}$/.test(
                        String(block.settings.serviceDescriptionCustomColor ?? "")
                      )
                        ? String(block.settings.serviceDescriptionCustomColor)
                        : "#52525b"
                    }
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        serviceDescriptionCustomColor: e.target.value,
                      })
                    }
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.serviceDescriptionCustomColor ?? "#52525b")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      serviceDescriptionCustomColor: e.target.value,
                    })
                  }
                  placeholder="#52525b"
                  className="h-9 flex-1 font-mono text-sm"
                />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>Border radius</label>
              <select
                value={String(block.settings.serviceCardBorderRadius ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceCardBorderRadius: e.target.value as "none" | "sm" | "md" | "lg" | "full",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Full (pill)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Card border</label>
              <select
                value={String(block.settings.serviceCardBorder ?? "default")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceCardBorder: e.target.value as "none" | "subtle" | "default" | "medium",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="subtle">Subtle</option>
                <option value="default">Default</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            {String(block.settings.serviceCardBorder ?? "default") !== "none" && (
              <>
                <div>
                  <label className={LABEL_CLASS}>Border color</label>
                  <select
                    value={String(block.settings.serviceCardBorderColor ?? "neutral")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        serviceCardBorderColor: e.target.value as "primary" | "accent" | "neutral" | "custom",
                      })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="neutral">Neutral (gray)</option>
                    <option value="primary">Primary</option>
                    <option value="accent">Accent</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {String(block.settings.serviceCardBorderColor ?? "neutral") === "custom" && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                      <input
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(
                            String(block.settings.serviceCardBorderCustomColor ?? "")
                          )
                            ? String(block.settings.serviceCardBorderCustomColor)
                            : "#d4d4d8"
                        }
                        onChange={(e) =>
                          updateBlockSettings(block.id, { serviceCardBorderCustomColor: e.target.value })
                        }
                        className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                      />
                    </div>
                    <Input
                      value={String(block.settings.serviceCardBorderCustomColor ?? "#d4d4d8")}
                      onChange={(e) =>
                        updateBlockSettings(block.id, { serviceCardBorderCustomColor: e.target.value })
                      }
                      placeholder="#d4d4d8"
                      className="h-9 flex-1 font-mono text-sm"
                    />
                  </div>
                )}
              </>
            )}
            <div>
              <label className={LABEL_CLASS}>Card background</label>
              <select
                value={String(block.settings.serviceCardBgColor ?? "default")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    serviceCardBgColor: e.target.value as "default" | "subtle" | "custom",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="default">Default (white)</option>
                <option value="subtle">Subtle (gray)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {String(block.settings.serviceCardBgColor ?? "default") === "custom" && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                  <input
                    type="color"
                    value={
                      /^#[0-9A-Fa-f]{6}$/.test(
                        String(block.settings.serviceCardBgCustomColor ?? "")
                      )
                        ? String(block.settings.serviceCardBgCustomColor)
                        : "#ffffff"
                    }
                    onChange={(e) =>
                      updateBlockSettings(block.id, { serviceCardBgCustomColor: e.target.value })
                    }
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.serviceCardBgCustomColor ?? "#ffffff")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, { serviceCardBgCustomColor: e.target.value })
                  }
                  placeholder="#ffffff"
                  className="h-9 flex-1 font-mono text-sm"
                />
              </div>
            )}
            <p className="mt-3 sm:col-span-4 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Service icon
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:col-span-4">
              <div>
                <label className={LABEL_CLASS}>Icon position</label>
                <select
                  value={String(block.settings.serviceIconPosition ?? "top")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      serviceIconPosition: e.target.value as "top" | "left" | "inline",
                    })
                  }
                  className={SELECT_COMPACT}
                >
                  <option value="top">Above title</option>
                  <option value="left">Left of content</option>
                  <option value="inline">Inline with title</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Icon alignment</label>
                <select
                  value={String(block.settings.serviceIconAlign ?? "left")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      serviceIconAlign: e.target.value as "left" | "center" | "right",
                    })
                  }
                  className={SELECT_COMPACT}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
                <p className="mt-0.5 text-[10px] text-zinc-500">When above or inline</p>
              </div>
              <div>
                <label className={LABEL_CLASS}>Icon size</label>
                <select
                  value={String(block.settings.serviceIconSize ?? "md")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      serviceIconSize: e.target.value as "sm" | "md" | "lg",
                    })
                  }
                  className={SELECT_COMPACT}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
          </div>
        </InlineExpand>
      </div>

      {/* 4. Services items */}
      {show("services") && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-600">Services</p>
            {displayItems.length > 0 && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                {displayItems.length} service{displayItems.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mb-3 text-[11px] text-zinc-500">
            Preview matches public view. Drag to reorder, click to edit.
          </p>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
            {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-white py-12 text-center">
                <p className="mb-1 text-sm font-medium text-zinc-600">No services yet</p>
                <p className="mb-4 text-xs text-zinc-500">
                  Add services manually or import from your profile
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                    onClick={() =>
                      updateBlockSettings(block.id, {
                        items: [{ title: "", description: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add first service
                  </button>
                  <button
                    type="button"
                    disabled={importLoading}
                    className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                    onClick={async () => {
                      setImportLoading(true);
                      try {
                        const res = await fetch("/api/admin/portfolio");
                        if (!res.ok) throw new Error("Failed to fetch");
                        const data = (await res.json()) as {
                          services?: { id: string; title: string; description: string | null }[];
                        };
                        const apiServices = data.services ?? [];
                        if (apiServices.length === 0) {
                          toast.info("No services in profile");
                          return;
                        }
                        const items = apiServices.map((s) => ({
                          title: s.title,
                          description: s.description ?? "",
                        }));
                        updateBlockSettings(block.id, { items, servicesDataSource: "block" });
                        toast.success(`Imported ${apiServices.length} services`);
                      } catch {
                        toast.error("Failed to import services");
                      } finally {
                        setImportLoading(false);
                      }
                    }}
                  >
                    {importLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import from profile
                  </button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleServiceDragEnd}
              >
                <SortableContext
                  items={displayItems.map((_, i) => `svc-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {displayItems.map((svc, idx) => (
                      <SortableServiceItem
                        key={`svc-${idx}`}
                        id={`svc-${idx}`}
                        service={svc}
                        serviceIdx={idx}
                        displayItems={displayItems}
                        blockId={block.id}
                        updateBlockSettings={updateBlockSettings}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
          {displayItems.length > 0 && (
            <button
              type="button"
              className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
              onClick={() =>
                updateBlockSettings(block.id, {
                  items: [...displayItems, { title: "", description: "" }],
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add service
            </button>
          )}
        </div>
      )}
    </div>
  );
}
