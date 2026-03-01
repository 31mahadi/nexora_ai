"use client";

import { Button, Card, Input } from "@nexora/ui";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Award,
  BadgeCheck,
  BarChart2,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  GitBranch,
  GripVertical,
  HelpCircle,
  Image,
  Layout,
  ListOrdered,
  Lock,
  LockOpen,
  Moon,
  Mail,
  Minus,
  Monitor,
  Palette,
  Plus,
  Quote,
  Search,
  Send,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Video,
  X,
  Undo2,
  Upload,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/Skeleton";
import { BlockTypePreview } from "@/components/design/BlockTypePreview";
import { HeroBlockSettings, type HeroComponentType } from "@/components/design/HeroBlockSettings";
import { HeroDesignCanvas } from "@/components/design/HeroDesignCanvas";
import { HeroDesignPreview } from "@/components/design/HeroDesignPreview";
import { TextBlockSettings } from "@/components/design/TextBlockSettings";
import { TextDesignPreview, type TextComponentType } from "@/components/design/TextDesignPreview";
import { SkillsBlockSettings, type SkillsComponentType } from "@/components/design/SkillsBlockSettings";
import { SkillsDesignPreview } from "@/components/design/SkillsDesignPreview";
import { ServicesBlockSettings, type ServicesComponentType } from "@/components/design/ServicesBlockSettings";
import { ServicesDesignPreview } from "@/components/design/ServicesDesignPreview";
import { ImageField } from "@/components/design/ImageField";
import {
  BLOCK_LIBRARY,
  BLOCK_PRESETS,
  createBlock,
  DEFAULT_SITE_CONFIG,
  FONT_OPTIONS,
  getBlockValidationIssues,
  getContrastRatio,
  hasLowContrast,
  isValidUrl,
  MASTER_THEMES,
  normalizePortfolioSiteConfig,
  type BlockBackgroundType,
  type BlockPadding,
  type BlockType,
  type BuilderBlock,
  type PortfolioSiteConfig,
} from "@nexora/portfolio-builder";

const DEFAULT_PRIMARY = "#0f172a";
const DEFAULT_ACCENT = "#22c55e";
const PORTFOLIO_PORT = process.env.NEXT_PUBLIC_PORTFOLIO_PORT ?? "3002";

const BLOCK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout,
  Type,
  Award,
  Briefcase,
  GitBranch,
  Quote,
  Zap,
  Mail,
  FileText,
  Image,
  BarChart2,
  FolderOpen,
  Building2,
  CreditCard,
  HelpCircle,
  Video,
  ListOrdered,
  BadgeCheck,
  Send,
  Minus,
};


function SortableBlockItem({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: (attrs: { attributes: object; listeners: object | undefined }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50" : ""}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

function normalizeHexColor(value: string, fallback = "#000000"): string {
  const v = value.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(v) ? v : fallback;
}

function ContrastWarning({ color, onWhite = true }: { color: string; onWhite?: boolean }) {
  const hex = normalizeHexColor(color, "#000000");
  const fg = onWhite ? hex : "#ffffff";
  const bg = onWhite ? "#ffffff" : hex;
  const low = hasLowContrast(fg, bg);
  if (!low) return null;
  return (
    <span
      title="Low contrast (&lt;4.5:1) on white/dark — may affect readability"
      className="inline-flex text-amber-600"
    >
      <AlertTriangle className="h-4 w-4" />
    </span>
  );
}

function ColorPickerField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
        <input
          type="color"
          value={normalizeHexColor(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
        />
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9" />
    </div>
  );
}

export default function DesignPage() {
  const [tenant, setTenant] = useState<{ subdomain: string; name: string; customDomain?: string | null } | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [savingDomain, setSavingDomain] = useState(false);
  const [theme, setTheme] = useState({
    primary: DEFAULT_PRIMARY,
    accent: DEFAULT_ACCENT,
  });
  const [siteConfig, setSiteConfig] = useState<PortfolioSiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<BlockType>("hero");
  const [newGalleryImage, setNewGalleryImage] = useState<Record<string, string>>({});
  const [newCarouselImage, setNewCarouselImage] = useState<Record<string, string>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [blockTab, setBlockTab] = useState<Record<string, "content" | "style">>({});
  const [history, setHistory] = useState<PortfolioSiteConfig[]>([DEFAULT_SITE_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<PortfolioSiteConfig | null>(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("mobile");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [previewDarkMode, setPreviewDarkMode] = useState(false);
  const [previewDesignMode, setPreviewDesignMode] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<
    { id?: string; name: string; config: Record<string, unknown> }[]
  >([]);
  const [templateName, setTemplateName] = useState("");
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [loadedTemplate, setLoadedTemplate] = useState<{ id?: string; name: string } | null>(null);
  const [blockSearch, setBlockSearch] = useState("");
  const [selectedHeroComponent, setSelectedHeroComponent] = useState<HeroComponentType | null>(null);
  const [selectedTextComponent, setSelectedTextComponent] = useState<TextComponentType | null>(null);
  const [selectedSkillsComponent, setSelectedSkillsComponent] = useState<SkillsComponentType | null>(null);
  const [selectedServicesComponent, setSelectedServicesComponent] = useState<ServicesComponentType | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadRef = useRef(true);
  const handleSaveRef = useRef<() => void>(() => {});

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isDirty = useMemo(
    () =>
      lastSaved !== null &&
      JSON.stringify({ theme, siteConfig }) !== JSON.stringify({ theme, lastSaved }),
    [theme, siteConfig, lastSaved]
  );

  const pushHistory = useCallback((config: PortfolioSiteConfig) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(JSON.parse(JSON.stringify(config)));
      return next.slice(-50);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const filteredBlocks = useMemo(
    () =>
      blockSearch.trim()
        ? BLOCK_LIBRARY.filter(
            (b) =>
              b.label.toLowerCase().includes(blockSearch.toLowerCase()) ||
              b.type.toLowerCase().includes(blockSearch.toLowerCase())
          )
        : BLOCK_LIBRARY,
    [blockSearch]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/templates");
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as { id: string; name: string; config: Record<string, unknown> }[];
          setSavedTemplates(data ?? []);
        } else {
          const stored = localStorage.getItem("nexora-portfolio-templates");
          if (stored) {
            const parsed = JSON.parse(stored) as { name: string; config: string }[];
            setSavedTemplates(
              parsed.map((t) => ({
                name: t.name,
                config: (() => {
                  try {
                    return JSON.parse(t.config) as Record<string, unknown>;
                  } catch {
                    return {};
                  }
                })(),
              }))
            );
          }
        }
      } catch {
        if (cancelled) return;
        try {
          const stored = localStorage.getItem("nexora-portfolio-templates");
          if (stored) {
            const parsed = JSON.parse(stored) as { name: string; config: string }[];
            setSavedTemplates(
              parsed.map((t) => ({
                name: t.name,
                config: (() => {
                  try {
                    return JSON.parse(t.config) as Record<string, unknown>;
                  } catch {
                    return {};
                  }
                })(),
              }))
            );
          }
        } catch {
          /* ignore */
        }
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [tenantRes, configRes] = await Promise.all([
          fetch("/api/admin/tenant"),
          fetch("/api/admin/tenant/site-config"),
        ]);
        if (!tenantRes.ok || !configRes.ok) throw new Error("Failed to load");

        const tenantData = (await tenantRes.json()) as {
          subdomain: string;
          name: string;
          customDomain?: string | null;
        };
        const configData = (await configRes.json()) as {
          theme?: { primary?: string; accent?: string };
          settings?: { portfolioSite?: unknown };
        };

        const cd = tenantData.customDomain ?? null;
        setTenant({
          subdomain: tenantData.subdomain,
          name: tenantData.name,
          customDomain: cd,
        });
        setCustomDomainInput(cd ?? "");
        if (configData.theme && typeof configData.theme === "object") {
          setTheme({
            primary: (configData.theme.primary as string) || DEFAULT_PRIMARY,
            accent: (configData.theme.accent as string) || DEFAULT_ACCENT,
          });
        }
        const config = normalizePortfolioSiteConfig(configData.settings?.portfolioSite);
        setSiteConfig(config);
        setLastSaved(config);
        setHistory([config]);
        setHistoryIndex(0);
      } catch {
        toast.error("Failed to load builder settings");
      } finally {
        setLoading(false);
        initialLoadRef.current = false;
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (loading || onboardingDismissed) return;
    if (siteConfig.blocks.length === 0 && !initialLoadRef.current) {
      toast.info("Add blocks from the library to build your portfolio. Use presets for quick start!", {
        duration: 6000,
      });
      setOnboardingDismissed(true);
    }
  }, [loading, siteConfig.blocks.length, onboardingDismissed]);

  useEffect(() => {
    if (loading || initialLoadRef.current || !isDirty) return;
    const t = setTimeout(() => {
      handleSave();
    }, 30000);
    return () => clearTimeout(t);
  }, [siteConfig, theme, isDirty, loading]);

  useEffect(() => {
    if (!tenant || loading) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/preview-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: siteConfig, theme }),
        });
        if (res.ok) {
          const data = (await res.json()) as { token?: string };
          if (data.token) {
            setPreviewToken(data.token);
            setPreviewKey((k) => k + 1);
          }
        }
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [siteConfig, theme, tenant, loading]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setSiteConfig(history[nextIndex] ?? siteConfig);
    setHistoryIndex(nextIndex);
  }, [history, historyIndex, siteConfig]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setSiteConfig(history[nextIndex] ?? siteConfig);
    setHistoryIndex(nextIndex);
  }, [history, historyIndex, siteConfig]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "z") return;
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewDrawerOpen) setPreviewDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewDrawerOpen]);

  async function handleSave() {
    setSaving(true);
    toast.info("Saving...");
    try {
      const res = await fetch("/api/admin/tenant/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          settings: { portfolioSite: siteConfig },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setLastSaved(JSON.parse(JSON.stringify(siteConfig)));
      setPreviewKey((k) => k + 1);
      toast.success("Saved — preview will refresh");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }
  handleSaveRef.current = handleSave;

  const previewParams = [
    previewToken ? `preview=1&token=${encodeURIComponent(previewToken)}` : "",
    previewDarkMode ? "dark=1" : "",
  ].filter(Boolean);
  const previewUrl = tenant
    ? `http://${tenant.subdomain}.localhost:${PORTFOLIO_PORT}${previewParams.length ? `?${previewParams.join("&")}` : ""}`
    : null;

  useEffect(() => {
    setPreviewLoading(true);
  }, [previewKey]);
  const enabledCount = useMemo(
    () => siteConfig.blocks.filter((block) => block.enabled).length,
    [siteConfig.blocks],
  );


  function addBlock(type: BlockType, preset?: Partial<BuilderBlock>) {
    const template = createBlock(type);
    const newBlock = preset
      ? {
          ...template,
          ...preset,
          id: template.id,
          type: template.type,
          style: { ...template.style, ...(preset.style ?? {}) },
          settings: { ...template.settings, ...(preset.settings ?? {}) },
        }
      : template;
    setSiteConfig((prev) => {
      const next = { ...prev, blocks: [...prev.blocks, newBlock] };
      pushHistory(next);
      return next;
    });
    setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
  }

  function removeBlock(blockId: string) {
    setSiteConfig((prev) => {
      const next = { ...prev, blocks: prev.blocks.filter((b) => b.id !== blockId) };
      pushHistory(next);
      return next;
    });
  }

  function duplicateBlock(blockId: string) {
    setSiteConfig((prev) => {
      const index = prev.blocks.findIndex((block) => block.id === blockId);
      if (index === -1) return prev;
      const existing = prev.blocks[index];
      const duplicate = { ...existing, id: createBlock(existing.type).id };
      const next = [...prev.blocks];
      next.splice(index + 1, 0, duplicate);
      const result = { ...prev, blocks: next };
      pushHistory(result);
      return result;
    });
  }

  function moveBlock(index: number, direction: "up" | "down") {
    setSiteConfig((prev) => {
      const next = [...prev.blocks];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      const result = { ...prev, blocks: next };
      pushHistory(result);
      return result;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = siteConfig.blocks.findIndex((b) => b.id === active.id);
    const newIndex = siteConfig.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const sourceBlock = siteConfig.blocks[oldIndex];
    const targetBlock = siteConfig.blocks[newIndex];
    if (sourceBlock?.locked || targetBlock?.locked) return;
    setSiteConfig((prev) => {
      const next = arrayMove([...prev.blocks], oldIndex, newIndex);
      const result = { ...prev, blocks: next };
      pushHistory(result);
      return result;
    });
  }

  function updateBlock(blockId: string, patch: Partial<BuilderBlock>) {
    setSiteConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    }));
  }

  function updateBlockSettings(blockId: string, patch: Record<string, unknown>) {
    setSiteConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === blockId ? { ...block, settings: { ...block.settings, ...patch } } : block,
      ),
    }));
  }

  function updateBlockStyle(blockId: string, patch: Partial<BuilderBlock["style"]>) {
    setSiteConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === blockId ? { ...block, style: { ...block.style, ...patch } } : block,
      ),
    }));
  }

  function addToStringList(blockId: string, key: "carouselImages" | "images" | "logos", value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const block = siteConfig.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const current = Array.isArray(block.settings[key]) ? (block.settings[key] as unknown[]) : [];
    updateBlockSettings(blockId, { [key]: [...current, trimmed] });
    if (key === "carouselImages") {
      setNewCarouselImage((prev) => ({ ...prev, [blockId]: "" }));
    } else {
      setNewGalleryImage((prev) => ({ ...prev, [blockId]: "" }));
    }
  }

  function addLogo(blockId: string, url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    const block = siteConfig.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const current = Array.isArray(block.settings.logos) ? (block.settings.logos as unknown[]) : [];
    updateBlockSettings(blockId, { logos: [...current, trimmed] });
    setNewGalleryImage((prev) => ({ ...prev, [blockId]: "" }));
  }

  function removeFromStringList(blockId: string, key: "carouselImages" | "images" | "logos", idx: number) {
    const block = siteConfig.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const current = Array.isArray(block.settings[key]) ? (block.settings[key] as unknown[]) : [];
    updateBlockSettings(blockId, {
      [key]: current.filter((_, i) => i !== idx),
    });
  }

  function resetToBlank() {
    const next = { ...DEFAULT_SITE_CONFIG, blocks: [] };
    setSiteConfig(next);
    pushHistory(next);
    setExpandedBlocks(new Set());
  }

  function toggleBlockExpanded(blockId: string) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  function getBlockTab(blockId: string): "content" | "style" {
    return blockTab[blockId] ?? "content";
  }

  function setBlockTabFor(blockId: string, tab: "content" | "style") {
    setBlockTab((prev) => ({ ...prev, [blockId]: tab }));
  }

  function renderStyleEditor(block: BuilderBlock) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Background</label>
            <select
              value={block.style.backgroundType}
              onChange={(e) =>
                updateBlockStyle(block.id, {
                  backgroundType: e.target.value as BlockBackgroundType,
                })
              }
              className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
            >
              <option value="none">None</option>
              <option value="color">Solid color</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Background color</label>
            <ColorPickerField
              value={block.style.backgroundColor}
              onChange={(value) => updateBlockStyle(block.id, { backgroundColor: value })}
              placeholder="#ffffff"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Background image</label>
            <Input
              value={block.style.backgroundImage}
              onChange={(e) =>
                updateBlockStyle(block.id, { backgroundImage: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Text color</label>
            <ColorPickerField
              value={block.style.textColor}
              onChange={(value) => updateBlockStyle(block.id, { textColor: value })}
              placeholder="#18181b"
            />
            {(() => {
              const bg =
                block.style.backgroundType === "color"
                  ? block.style.backgroundColor
                  : block.style.backgroundType === "image"
                    ? "#333333"
                    : "#ffffff";
              const ratio = getContrastRatio(
                normalizeHexColor(block.style.textColor, "#18181b"),
                normalizeHexColor(bg, "#ffffff"),
              );
              if (ratio < 4.5)
                return (
                  <p className="mt-1 text-xs text-amber-600">
                    Low contrast (ratio {ratio.toFixed(1)}). Aim for ≥4.5 for readability.
                  </p>
                );
              return null;
            })()}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Accent color</label>
            <ColorPickerField
              value={block.style.accentColor}
              onChange={(value) => updateBlockStyle(block.id, { accentColor: value })}
              placeholder="#6366f1"
            />
          </div>
            <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Padding</label>
              <select
                value={block.style.padding}
                onChange={(e) =>
                  updateBlockStyle(block.id, { padding: e.target.value as BlockPadding })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="sm">Compact</option>
                <option value="md">Default</option>
                <option value="lg">Spacious</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Container</label>
              <select
                value={block.style.container}
                onChange={(e) =>
                  updateBlockStyle(block.id, {
                    container: e.target.value as BuilderBlock["style"]["container"],
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Block spacing</label>
              <select
                value={block.style.blockSpacing ?? "normal"}
                onChange={(e) =>
                  updateBlockStyle(block.id, {
                    blockSpacing: e.target.value as "tight" | "normal" | "loose",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="loose">Loose</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Visibility</label>
              <select
                value={block.style.blockVisibility ?? "all"}
                onChange={(e) =>
                  updateBlockStyle(block.id, {
                    blockVisibility: e.target.value as "all" | "desktop-only" | "mobile-only",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="all">All devices</option>
                <option value="desktop-only">Desktop only</option>
                <option value="mobile-only">Mobile only</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Divider</label>
              <select
                value={block.style.blockDivider ?? "none"}
                onChange={(e) =>
                  updateBlockStyle(block.id, {
                    blockDivider: e.target.value as "none" | "line" | "wave",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="none">None</option>
                <option value="line">Line</option>
                <option value="wave">Wave</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Animation</label>
              <select
                value={block.style.blockAnimation ?? "none"}
                onChange={(e) =>
                  updateBlockStyle(block.id, {
                    blockAnimation: e.target.value as "none" | "fade" | "slide-up",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="none">None</option>
                <option value="fade">Fade in</option>
                <option value="slide-up">Slide up</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSettingsEditor(block: BuilderBlock) {
    if (block.type === "hero") {
      return (
        <div className="space-y-4">
          <HeroDesignCanvas
            block={block}
            selectedComponent={selectedHeroComponent}
            onSelectComponent={setSelectedHeroComponent}
            onOrderChange={(order) => updateBlockSettings(block.id, { heroComponentOrder: order })}
            theme={{ primary: theme.primary, accent: theme.accent }}
          />
          <HeroBlockSettings
            block={block}
            updateBlockSettings={updateBlockSettings}
            theme={{ primary: theme.primary, accent: theme.accent }}
            newCarouselImage={newCarouselImage[block.id] ?? ""}
            setNewCarouselImage={(v) => setNewCarouselImage((prev) => ({ ...prev, [block.id]: v }))}
            addToStringList={addToStringList}
            removeFromStringList={removeFromStringList}
            FONT_OPTIONS={FONT_OPTIONS}
            selectedComponent={selectedHeroComponent}
            onClearSelection={() => setSelectedHeroComponent(null)}
          />
        </div>
      );
    }

    if (block.type === "separator") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Separator style</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-600">Style</p>
              <select
                value={String(block.settings.separatorStyle ?? "solid")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    separatorStyle: e.target.value as "solid" | "dashed" | "dotted" | "double" | "gradient",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-600">Thickness</p>
              <select
                value={String(block.settings.separatorThickness ?? "medium")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    separatorThickness: e.target.value as "thin" | "medium" | "thick",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="thin">Thin</option>
                <option value="medium">Medium</option>
                <option value="thick">Thick</option>
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-600">Width</p>
              <select
                value={String(block.settings.separatorWidth ?? "full")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    separatorWidth: e.target.value as "full" | "narrow" | "wide",
                  })
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                <option value="full">Full width</option>
                <option value="narrow">Narrow</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (block.type === "text") {
      return (
        <TextBlockSettings
          block={block}
          updateBlockSettings={updateBlockSettings}
          theme={{ primary: theme.primary, accent: theme.accent }}
          FONT_OPTIONS={FONT_OPTIONS}
          selectedComponent={selectedTextComponent}
          onClearSelection={() => setSelectedTextComponent(null)}
        />
      );
    }

    if (block.type === "skills") {
      return (
        <SkillsBlockSettings
          block={block}
          updateBlockSettings={updateBlockSettings}
          theme={{ primary: theme.primary, accent: theme.accent }}
          FONT_OPTIONS={FONT_OPTIONS}
          selectedComponent={selectedSkillsComponent}
          onClearSelection={() => setSelectedSkillsComponent(null)}
        />
      );
    }

    if (block.type === "services") {
      return (
        <ServicesBlockSettings
          block={block}
          updateBlockSettings={updateBlockSettings}
          theme={{ primary: theme.primary, accent: theme.accent }}
          FONT_OPTIONS={FONT_OPTIONS}
          selectedComponent={selectedServicesComponent}
          onClearSelection={() => setSelectedServicesComponent(null)}
        />
      );
    }

    if (block.type === "timeline") {
      const items = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ type?: string; title?: string; description?: string; date?: string; tags?: string[] }>)
        : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input
            value={String(block.settings.title ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
            placeholder="Section title"
          />
          <Input
            value={String(block.settings.subtitle ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
            placeholder="Section subtitle (optional)"
          />
          <Input
            value={String(block.settings.emptyMessage ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { emptyMessage: e.target.value })}
            placeholder="Empty state message (optional)"
          />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-zinc-200 p-3">
                <div className="flex gap-2">
                  <Input
                    value={item.date ?? ""}
                    onChange={(e) => {
                      const n = [...items];
                      n[idx] = { ...n[idx], date: e.target.value };
                      updateBlockSettings(block.id, { items: n });
                    }}
                    placeholder="Date (e.g. 2024)"
                    className="w-24"
                  />
                  <Input
                    value={item.type ?? ""}
                    onChange={(e) => {
                      const n = [...items];
                      n[idx] = { ...n[idx], type: e.target.value };
                      updateBlockSettings(block.id, { items: n });
                    }}
                    placeholder="Type (e.g. Work)"
                    className="flex-1"
                  />
                </div>
                <Input
                  value={item.title ?? ""}
                  onChange={(e) => {
                    const n = [...items];
                    n[idx] = { ...n[idx], title: e.target.value };
                    updateBlockSettings(block.id, { items: n });
                  }}
                  placeholder="Title"
                />
                <textarea
                  value={item.description ?? ""}
                  onChange={(e) => {
                    const n = [...items];
                    n[idx] = { ...n[idx], description: e.target.value };
                    updateBlockSettings(block.id, { items: n });
                  }}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
                <Input
                  value={(item.tags ?? []).join(", ")}
                  onChange={(e) => {
                    const n = [...items];
                    n[idx] = { ...n[idx], tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) };
                    updateBlockSettings(block.id, { items: n });
                  }}
                  placeholder="Tags (comma-separated)"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                updateBlockSettings(block.id, {
                  items: [...items, { type: "Work", title: "", description: "", date: new Date().getFullYear().toString(), tags: [] }],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add entry
            </Button>
          </div>
        </div>
      );
    }

    if (block.type === "blog-feed") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input
            value={String(block.settings.title ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
            placeholder="Section title"
          />
          <Input
            value={String(block.settings.subtitle ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
            placeholder="Section subtitle (optional)"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              type="number"
              value={String(block.settings.limit ?? 3)}
              onChange={(e) =>
                updateBlockSettings(block.id, { limit: Number(e.target.value) || 3 })
              }
              placeholder="3"
            />
            <Input
              type="number"
              value={String(block.settings.columns ?? 2)}
              onChange={(e) =>
                updateBlockSettings(block.id, { columns: Number(e.target.value) || 2 })
              }
              placeholder="2"
            />
          </div>
        </div>
      );
    }

    if (block.type === "gallery") {
      const images = Array.isArray(block.settings.images)
        ? (block.settings.images as unknown[]).filter((v): v is string => typeof v === "string")
        : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input
            value={String(block.settings.title ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
            placeholder="Gallery title"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={String(block.settings.subtitle ?? "")}
              onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
              placeholder="Gallery subtitle (optional)"
            />
            <Input
              type="number"
              value={String(block.settings.columns ?? 3)}
              onChange={(e) =>
                updateBlockSettings(block.id, { columns: Number(e.target.value) || 3 })
              }
              placeholder="3"
            />
          </div>
          <ImageField
            value={newGalleryImage[block.id] ?? ""}
            onChange={(v) => setNewGalleryImage((prev) => ({ ...prev, [block.id]: v }))}
            onAdd={() => addToStringList(block.id, "images", newGalleryImage[block.id] ?? "")}
            placeholder="Paste image URL or upload"
          />
          <div className="space-y-2">
            {images.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2"
              >
                <p className="truncate text-xs text-zinc-600">{url}</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeFromStringList(block.id, "images", idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "cta") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input
            value={String(block.settings.title ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
            placeholder="CTA heading"
          />
          <textarea
            value={String(block.settings.body ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { body: e.target.value })}
            placeholder="CTA body"
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
            rows={3}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={String(block.settings.buttonText ?? "")}
              onChange={(e) => updateBlockSettings(block.id, { buttonText: e.target.value })}
              placeholder="Button text"
            />
            <Input
              value={String(block.settings.buttonHref ?? "")}
              onChange={(e) => updateBlockSettings(block.id, { buttonHref: e.target.value })}
              placeholder="#contact"
            />
          </div>
        </div>
      );
    }

    if (block.type === "contact") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input
            value={String(block.settings.title ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
            placeholder="Section title"
          />
          <Input
            value={String(block.settings.subtitle ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
            placeholder="Subtitle"
          />
          <Input
            value={String(block.settings.submitButtonText ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { submitButtonText: e.target.value })}
            placeholder="Submit button text"
          />
          <Input
            value={String(block.settings.successMessage ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { successMessage: e.target.value })}
            placeholder="Success message"
          />
        </div>
      );
    }

    if (block.type === "testimonials") {
      const items = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ quote?: string; author?: string; role?: string }>)
        : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input
            value={String(block.settings.title ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
            placeholder="Testimonials title"
          />
          <Input
            value={String(block.settings.subtitle ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
            placeholder="Testimonials subtitle (optional)"
          />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={`${item.author ?? "testimonial"}-${idx}`} className="grid gap-2 rounded-lg border border-zinc-200 p-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <Input
                    value={item.quote ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], quote: e.target.value };
                      updateBlockSettings(block.id, { items: next });
                    }}
                    placeholder="Quote"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    value={item.author ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], author: e.target.value };
                      updateBlockSettings(block.id, { items: next });
                    }}
                    placeholder="Author"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    value={item.role ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], role: e.target.value };
                      updateBlockSettings(block.id, { items: next });
                    }}
                    placeholder="Role"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                updateBlockSettings(block.id, {
                  items: [...items, { quote: "", author: "", role: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add testimonial
            </Button>
          </div>
        </div>
      );
    }

    if (block.type === "projects") {
      const items = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ title?: string; description?: string; image?: string; link?: string; tags?: string[] }>)
        : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <Input type="number" value={String(block.settings.columns ?? 2)} onChange={(e) => updateBlockSettings(block.id, { columns: Number(e.target.value) || 2 })} placeholder="Columns" />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3 space-y-2">
                <Input value={item.title ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], title: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Project title" />
                <textarea value={item.description ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Description" rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                <Input value={item.image ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], image: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Image URL" />
                <Input value={item.link ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], link: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Project URL" />
                <Input value={(item.tags ?? []).join(", ")} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }; updateBlockSettings(block.id, { items: n }); }} placeholder="Tags (comma-separated)" />
                <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: [...items, { title: "", description: "", image: "", link: "", tags: [] }] })}><Plus className="h-4 w-4" /> Add project</Button>
          </div>
        </div>
      );
    }

    if (block.type === "client-logos") {
      const logos = Array.isArray(block.settings.logos)
        ? (block.settings.logos as unknown[]).filter((l): l is string => typeof l === "string")
        : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <ImageField value={newGalleryImage[block.id] ?? ""} onChange={(v) => setNewGalleryImage((p) => ({ ...p, [block.id]: v }))} onAdd={() => addLogo(block.id, newGalleryImage[block.id] ?? "")} placeholder="Logo URL or upload" />
          <div className="space-y-2">
            {logos.map((url, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                <p className="truncate text-xs text-zinc-600">{url}</p>
                <Button type="button" variant="secondary" onClick={() => removeFromStringList(block.id, "logos", idx)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === "pricing") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ name?: string; price?: string; description?: string; features?: string[]; ctaText?: string; ctaHref?: string; highlighted?: boolean }>) : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <Input value={item.name ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], name: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Plan name" className="flex-1" />
                  <Input value={item.price ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], price: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="$99" />
                </div>
                <Input value={item.description ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Description" />
                <textarea value={(item.features ?? []).join("\n")} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], features: e.target.value.split("\n").filter(Boolean) }; updateBlockSettings(block.id, { items: n }); }} placeholder="Features (one per line)" rows={3} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <Input value={item.ctaText ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], ctaText: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Button text" />
                  <Input value={item.ctaHref ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], ctaHref: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Button link" />
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!item.highlighted} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], highlighted: e.target.checked }; updateBlockSettings(block.id, { items: n }); }} /> Highlighted</label>
                <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: [...items, { name: "", price: "", description: "", features: [], ctaText: "Get started", ctaHref: "#contact" }] })}><Plus className="h-4 w-4" /> Add plan</Button>
          </div>
        </div>
      );
    }

    if (block.type === "faq") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ question?: string; answer?: string }>) : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3 space-y-2">
                <Input value={item.question ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], question: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Question" />
                <textarea value={item.answer ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], answer: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Answer" rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: [...items, { question: "", answer: "" }] })}><Plus className="h-4 w-4" /> Add FAQ</Button>
          </div>
        </div>
      );
    }

    if (block.type === "video") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <Input value={String(block.settings.videoUrl ?? "")} onChange={(e) => updateBlockSettings(block.id, { videoUrl: e.target.value })} placeholder="YouTube/Vimeo embed URL" />
          <Input value={String(block.settings.posterUrl ?? "")} onChange={(e) => updateBlockSettings(block.id, { posterUrl: e.target.value })} placeholder="Poster image URL (optional)" />
        </div>
      );
    }

    if (block.type === "process") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ step?: number; title?: string; description?: string }>) : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3 space-y-2">
                <Input type="number" value={String(item.step ?? idx + 1)} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], step: Number(e.target.value) || idx + 1 }; updateBlockSettings(block.id, { items: n }); }} placeholder="Step" />
                <Input value={item.title ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], title: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Step title" />
                <textarea value={item.description ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Description" rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: [...items, { step: items.length + 1, title: "", description: "" }] })}><Plus className="h-4 w-4" /> Add step</Button>
          </div>
        </div>
      );
    }

    if (block.type === "certifications") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ name?: string; issuer?: string; url?: string; image?: string }>) : [];
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 p-3 space-y-2">
                <Input value={item.name ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], name: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Certification name" />
                <Input value={item.issuer ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], issuer: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Issuer" />
                <Input value={item.url ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], url: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Verification URL" />
                <Input value={item.image ?? ""} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], image: e.target.value }; updateBlockSettings(block.id, { items: n }); }} placeholder="Badge image URL" />
                <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => updateBlockSettings(block.id, { items: [...items, { name: "", issuer: "", url: "", image: "" }] })}><Plus className="h-4 w-4" /> Add certification</Button>
          </div>
        </div>
      );
    }

    if (block.type === "newsletter") {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
          <Input value={String(block.settings.title ?? "")} onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })} placeholder="Section title" />
          <Input value={String(block.settings.subtitle ?? "")} onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })} placeholder="Subtitle" />
          <Input value={String(block.settings.buttonText ?? "")} onChange={(e) => updateBlockSettings(block.id, { buttonText: e.target.value })} placeholder="Button text" />
          <Input value={String(block.settings.successMessage ?? "")} onChange={(e) => updateBlockSettings(block.id, { successMessage: e.target.value })} placeholder="Success message" />
        </div>
      );
    }

    const items = Array.isArray(block.settings.items)
      ? (block.settings.items as Array<{ label?: string; value?: string }>)
      : [];
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Content settings</p>
        <Input
          value={String(block.settings.title ?? "")}
          onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
          placeholder="Stats title"
        />
        <Input
          value={String(block.settings.subtitle ?? "")}
          onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
          placeholder="Stats subtitle (optional)"
        />
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={`${item.label ?? "stat"}-${idx}`} className="grid gap-2 rounded-lg border border-zinc-200 p-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <Input
                  value={item.label ?? ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], label: e.target.value };
                    updateBlockSettings(block.id, { items: next });
                  }}
                  placeholder="Label (e.g. Projects)"
                />
              </div>
              <div className="md:col-span-6">
                <Input
                  value={item.value ?? ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], value: e.target.value };
                    updateBlockSettings(block.id, { items: next });
                  }}
                  placeholder="Value (e.g. 25+)"
                />
              </div>
              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => updateBlockSettings(block.id, { items: items.filter((_, i) => i !== idx) })}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              updateBlockSettings(block.id, {
                items: [...items, { label: "", value: "" }],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add stat
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="mb-6 h-8 w-52" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        {/* Sticky header with actions */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/80">
          <PageHeader
            title="Portfolio page builder"
            description="Build a full page from scratch with reusable blocks and custom styles."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Design" },
            ]}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="p-2"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (⌘Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="p-2"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (⌘⇧Z)"
              >
                <Undo2 className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPreviewDrawerOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Preview
              </Button>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Open
                </a>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify({ theme, siteConfig }, null, 2)],
                    { type: "application/json" },
                  );
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `nexora-design-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                  toast.success("Design exported");
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const data = JSON.parse(text) as { theme?: { primary?: string; accent?: string }; siteConfig?: unknown };
                      if (data.theme && typeof data.theme === "object") {
                        setTheme({
                          primary: String(data.theme.primary ?? DEFAULT_PRIMARY),
                          accent: String(data.theme.accent ?? DEFAULT_ACCENT),
                        });
                      }
                      if (data.siteConfig) {
                        const config = normalizePortfolioSiteConfig(data.siteConfig);
                        setSiteConfig(config);
                        pushHistory(config);
                        toast.success("Design imported");
                      } else {
                        toast.error("Invalid design file");
                      }
                    } catch {
                      toast.error("Failed to parse design file");
                    }
                    e.target.value = "";
                  }}
                />
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                  <Upload className="h-4 w-4" />
                  Import
                </span>
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isDirty ? "Save" : "Saved"}
              </Button>
            </div>
          </PageHeader>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
          {/* Sidebar: Global settings + Block library */}
          <aside className="flex max-h-[calc(100vh-12rem)] flex-col gap-5 overflow-y-auto lg:sticky lg:top-24 lg:self-start">
            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                Jump start
              </h3>
              <p className="mb-4 text-xs text-zinc-500">
                Select a master theme to pre-fill blocks and colors
              </p>
              <div className="space-y-2">
                {MASTER_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.theme);
                      setSiteConfig(normalizePortfolioSiteConfig(t.siteConfig));
                      pushHistory(normalizePortfolioSiteConfig(t.siteConfig));
                      toast.success(`Applied "${t.name}" theme`);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 gap-0.5 overflow-hidden rounded-md border border-zinc-200">
                      <div
                        className="h-full w-1/2"
                        style={{ backgroundColor: t.theme.primary }}
                      />
                      <div
                        className="h-full w-1/2"
                        style={{ backgroundColor: t.theme.accent }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-800">{t.name}</p>
                      <p className="truncate text-xs text-zinc-500">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                Branding
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-600">
                    Primary color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e) => setTheme((t) => ({ ...t, primary: e.target.value }))}
                      className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-zinc-300"
                    />
                    <Input
                      value={theme.primary}
                      onChange={(e) => setTheme((t) => ({ ...t, primary: e.target.value }))}
                      placeholder="#0f172a"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-600">
                    Accent color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accent}
                      onChange={(e) => setTheme((t) => ({ ...t, accent: e.target.value }))}
                      className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-zinc-300"
                    />
                    <Input
                      value={theme.accent}
                      onChange={(e) => setTheme((t) => ({ ...t, accent: e.target.value }))}
                      placeholder="#22c55e"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                Custom domain
              </h3>
              <p className="mb-3 text-xs text-zinc-500">
                Use your own domain (e.g. portfolio.example.com). Point your DNS CNAME to this app.
              </p>
              <div className="flex gap-2">
                <Input
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="portfolio.example.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={savingDomain}
                  onClick={async () => {
                    setSavingDomain(true);
                    try {
                      const res = await fetch("/api/admin/tenant/custom-domain", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          customDomain: customDomainInput.trim() || null,
                        }),
                      });
                      if (!res.ok) throw new Error("Failed to update");
                      const data = (await res.json()) as { customDomain?: string | null };
                      setCustomDomainInput(data.customDomain ?? "");
                      setTenant((t) => (t ? { ...t, customDomain: data.customDomain ?? null } : t));
                      toast.success("Custom domain updated");
                    } catch {
                      toast.error("Failed to update custom domain");
                    } finally {
                      setSavingDomain(false);
                    }
                  }}
                >
                  {savingDomain ? "Saving..." : "Save"}
                </Button>
              </div>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                Blocks
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  placeholder="Search blocks..."
                  className="w-full rounded-lg border border-zinc-300 py-3 pl-10 pr-4 text-sm font-medium text-zinc-800 placeholder:text-zinc-500"
                />
              </div>
              <div className="mb-4 flex flex-col gap-3">
                {filteredBlocks.map((item) => {
                  const Icon = BLOCK_ICON_MAP[item.icon];
                  const isSelected = selectedType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedType(item.type)}
                      onDoubleClick={() => addBlock(item.type)}
                      className={`flex w-full flex-col gap-2 rounded-lg border text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/80 ring-1 ring-indigo-200"
                          : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
                      }`}
                      title={`${item.description}. Double-click to add.`}
                    >
                      <div className="flex items-center gap-3 px-4 pt-3">
                        {Icon && (
                          <Icon
                            className={`h-5 w-5 shrink-0 ${
                              isSelected ? "text-indigo-600" : "text-zinc-600"
                            }`}
                          />
                        )}
                        <span className={`truncate ${isSelected ? "text-indigo-800" : ""}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="h-24 overflow-hidden rounded-lg border border-zinc-100 bg-white">
                        <div className="scale-[0.55] origin-top-left">
                          <BlockTypePreview blockType={item.type} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => addBlock(selectedType)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4" />
                  Add {BLOCK_LIBRARY.find((b) => b.type === selectedType)?.label ?? selectedType}
                </Button>
                <Button type="button" variant="secondary" onClick={resetToBlank}>
                  Blank
                </Button>
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-600">Presets</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => addBlock("hero", BLOCK_PRESETS["hero-dark"])}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Hero dark
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("stats", BLOCK_PRESETS["stats-minimal"])}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Stats
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("cta", BLOCK_PRESETS["cta-gradient"])}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  CTA
                </button>
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-600">
                {siteConfig.blocks.length} block(s), {enabledCount} enabled
              </p>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                SEO & meta
              </h3>
              <div className="space-y-4">
                <Input
                  value={siteConfig.metadata?.title ?? ""}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, title: e.target.value },
                    }))
                  }
                  placeholder="Page title"
                />
                <textarea
                  value={siteConfig.metadata?.description ?? ""}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, description: e.target.value },
                    }))
                  }
                  placeholder="Meta description"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
                  rows={2}
                />
                <Input
                  value={siteConfig.metadata?.ogImage ?? ""}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, ogImage: e.target.value },
                    }))
                  }
                  placeholder="OG image URL"
                />
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Analytics script (optional)
                  </label>
                  <textarea
                    value={siteConfig.analyticsScript ?? ""}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, analyticsScript: e.target.value }))
                    }
                    placeholder='e.g. <script async src="https://..."></script>'
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 font-mono"
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Paste your analytics script (Google Analytics, Plausible, etc.). It will be injected in the portfolio head.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                Font
              </h3>
              <select
                value={siteConfig.fontFamily ?? "inter"}
                onChange={(e) =>
                  setSiteConfig((prev) => ({ ...prev, fontFamily: e.target.value }))
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 box-border"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p
                className={`mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700 ${
                  (siteConfig.fontFamily ?? "inter") !== "inherit"
                    ? `font-hero-${siteConfig.fontFamily ?? "inter"}`
                    : ""
                }`}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSiteConfig((prev) => ({
                    ...prev,
                    blocks: prev.blocks.map((b) => {
                      const patch: Record<string, unknown> = {};
                      if (b.type === "hero" && "heroFontFamily" in (b.settings ?? {}))
                        patch.heroFontFamily = "inherit";
                      if (b.type === "text") {
                        patch.textFontFamily = "inherit";
                        patch.titleFontFamily = "inherit";
                        patch.subtitleFontFamily = "inherit";
                        patch.bodyFontFamily = "inherit";
                      }
                      return Object.keys(patch).length
                        ? { ...b, settings: { ...b.settings, ...patch } }
                        : b;
                    }),
                  }));
                }}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
              >
                Apply to all blocks
              </button>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                Social links
              </h3>
              <div className="space-y-4">
                {(siteConfig.socialLinks ?? []).map((link, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const next = [...(siteConfig.socialLinks ?? [])];
                          next[idx] = { ...next[idx], label: e.target.value };
                          setSiteConfig((prev) => ({ ...prev, socialLinks: next }));
                        }}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => {
                          const next = [...(siteConfig.socialLinks ?? [])];
                          next[idx] = { ...next[idx], url: e.target.value };
                          setSiteConfig((prev) => ({ ...prev, socialLinks: next }));
                        }}
                        placeholder="URL"
                        className={`flex-1 ${link.url.trim() && !isValidUrl(link.url) ? "border-amber-500" : ""}`}
                      />
                    <Button
                      type="button"
                      variant="secondary"
                      className="p-2"
                      onClick={() =>
                        setSiteConfig((prev) => ({
                          ...prev,
                          socialLinks: (prev.socialLinks ?? []).filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    </div>
                    {link.url.trim() && !isValidUrl(link.url) && (
                      <p className="text-xs text-amber-600">Invalid URL</p>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() =>
                    setSiteConfig((prev) => ({
                      ...prev,
                      socialLinks: [...(prev.socialLinks ?? []), { label: "", url: "" }],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add link
                </Button>
              </div>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                Footer
              </h3>
              <Input
                value={siteConfig.footerText ?? "Powered by Nexora"}
                onChange={(e) =>
                  setSiteConfig((prev) => ({ ...prev, footerText: e.target.value }))
                }
                placeholder="Footer text"
              />
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-700">
                  Navigation
                </h3>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                  <input
                    type="checkbox"
                    checked={siteConfig.showBlogLink}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, showBlogLink: e.target.checked }))
                    }
                  />
                  Show blog link
                </label>
              </div>
            </Card>

            <Card variant="outlined" className="border-zinc-200 p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">
                Import / Export
              </h3>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    const json = JSON.stringify({ theme, siteConfig }, null, 2);
                    const blob = new Blob([json], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "portfolio-config.json";
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success("Config exported");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".json";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const data = JSON.parse(text) as {
                          theme?: { primary?: string; accent?: string };
                          siteConfig?: unknown;
                        };
                        if (data.theme) setTheme((t) => ({ ...t, ...data.theme }));
                        if (data.siteConfig)
                          setSiteConfig(normalizePortfolioSiteConfig(data.siteConfig));
                        toast.success("Config imported");
                      } catch {
                        toast.error("Invalid file");
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
              <div className="mt-5 space-y-3">
                <p className="text-sm font-medium text-zinc-600">Templates</p>
                {loadedTemplate ? (
                  <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3">
                    <p className="text-xs font-medium text-zinc-600">
                      Editing: <span className="text-zinc-800">{loadedTemplate.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {loadedTemplate.id && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                          disabled={templatesLoading}
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/templates/${loadedTemplate.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  name: loadedTemplate.name,
                                  config: { theme, siteConfig },
                                }),
                              });
                              if (res.ok) {
                                const updated = (await res.json()) as {
                                  id: string;
                                  name: string;
                                  config: Record<string, unknown>;
                                };
                                setSavedTemplates((prev) =>
                                  prev.map((x) => (x.id === loadedTemplate.id ? updated : x))
                                );
                                toast.success(`Updated "${loadedTemplate.name}"`);
                              } else {
                                toast.error("Failed to update");
                              }
                            } catch {
                              toast.error("Failed to update");
                            }
                          }}
                        >
                          Update
                        </Button>
                      )}
                      {!loadedTemplate.id && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                          disabled={templatesLoading}
                          onClick={() => {
                            const config = { theme, siteConfig };
                            const next = savedTemplates.map((x) =>
                              x.name === loadedTemplate.name ? { ...x, config } : x
                            );
                            setSavedTemplates(next);
                            localStorage.setItem(
                              "nexora-portfolio-templates",
                              JSON.stringify(next.map((t) => ({ name: t.name, config: JSON.stringify(t.config) })))
                            );
                            toast.success(`Updated "${loadedTemplate.name}" (local)`);
                          }}
                        >
                          Update
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-3 py-1.5 text-sm text-zinc-600"
                        onClick={() => setLoadedTemplate(null)}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder={loadedTemplate ? "New template name" : "Template name"}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={templatesLoading}
                    onClick={async () => {
                      const name = templateName.trim() || `Template ${Date.now()}`;
                      const config = { theme, siteConfig };
                      try {
                        const res = await fetch("/api/admin/templates", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name, config }),
                        });
                        if (res.ok) {
                          const created = (await res.json()) as {
                            id: string;
                            name: string;
                            config: Record<string, unknown>;
                          };
                          setSavedTemplates((prev) => [
                            created,
                            ...prev.filter((t) => t.id !== created.id && t.name !== name),
                          ]);
                          setTemplateName("");
                          setLoadedTemplate(null);
                          toast.success(`Saved as "${name}"`);
                        } else {
                          const next = [...savedTemplates.filter((t) => t.name !== name), { name, config }];
                          setSavedTemplates(next);
                          localStorage.setItem(
                            "nexora-portfolio-templates",
                            JSON.stringify(next.map((t) => ({ name: t.name, config: JSON.stringify(t.config) })))
                          );
                          setTemplateName("");
                          setLoadedTemplate(null);
                          toast.success(`Saved as "${name}" (local)`);
                        }
                      } catch {
                        const next = [...savedTemplates.filter((t) => t.name !== name), { name, config }];
                        setSavedTemplates(next);
                        localStorage.setItem(
                          "nexora-portfolio-templates",
                          JSON.stringify(next.map((t) => ({ name: t.name, config: JSON.stringify(t.config) })))
                        );
                        setTemplateName("");
                        setLoadedTemplate(null);
                        toast.success(`Saved as "${name}" (local)`);
                      }
                    }}
                  >
                    {loadedTemplate ? "Save as new" : "Save"}
                  </Button>
                </div>
                {savedTemplates.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {savedTemplates.map((t) => {
                      const isLoaded =
                        loadedTemplate &&
                        (loadedTemplate.id ? loadedTemplate.id === t.id : loadedTemplate.name === t.name);
                      return (
                      <div
                        key={t.id ?? t.name}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                          isLoaded
                            ? "border-zinc-400 bg-zinc-100 ring-1 ring-zinc-300"
                            : "border-zinc-200 bg-zinc-50"
                        }`}
                      >
                        <span className="truncate text-sm text-zinc-700">{t.name}</span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-1.5 text-xs"
                            onClick={() => {
                              try {
                                const data = t.config as {
                                  theme?: { primary?: string; accent?: string };
                                  siteConfig?: unknown;
                                };
                                if (data?.theme) setTheme((prev) => ({ ...prev, ...data.theme }));
                                if (data?.siteConfig)
                                  setSiteConfig(normalizePortfolioSiteConfig(data.siteConfig));
                                setLoadedTemplate({ id: t.id, name: t.name });
                                toast.success(`Loaded "${t.name}" — edit and Update or Save as new`);
                              } catch {
                                toast.error("Invalid template");
                              }
                            }}
                          >
                            Load
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-1.5 text-xs text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              const removeFromState = () => {
                                setSavedTemplates((prev) =>
                                  prev.filter((x) => (t.id ? x.id !== t.id : x.name !== t.name))
                                );
                                if (loadedTemplate && (loadedTemplate.id === t.id || loadedTemplate.name === t.name)) {
                                  setLoadedTemplate(null);
                                }
                              };
                              if (t.id) {
                                try {
                                  const res = await fetch(`/api/admin/templates/${t.id}`, {
                                    method: "DELETE",
                                  });
                                  if (res.ok) {
                                    removeFromState();
                                    toast.success("Template removed");
                                  } else {
                                    removeFromState();
                                    const next = savedTemplates.filter((x) =>
                                      t.id ? x.id !== t.id : x.name !== t.name
                                    );
                                    localStorage.setItem(
                                      "nexora-portfolio-templates",
                                      JSON.stringify(next.map((x) => ({ name: x.name, config: JSON.stringify(x.config) })))
                                    );
                                    toast.success("Template removed (local)");
                                  }
                                } catch {
                                  removeFromState();
                                  const next = savedTemplates.filter((x) =>
                                    t.id ? x.id !== t.id : x.name !== t.name
                                  );
                                  localStorage.setItem(
                                    "nexora-portfolio-templates",
                                    JSON.stringify(next.map((x) => ({ name: x.name, config: JSON.stringify(x.config) })))
                                  );
                                  toast.success("Template removed (local)");
                                }
                              } else {
                                removeFromState();
                                const next = savedTemplates.filter((x) => x.name !== t.name);
                                localStorage.setItem(
                                  "nexora-portfolio-templates",
                                  JSON.stringify(next.map((x) => ({ name: x.name, config: JSON.stringify(x.config) })))
                                );
                                toast.success("Template removed");
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </aside>

          {/* Main: Block list */}
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto xl:min-h-[calc(100vh-12rem)]">
            {siteConfig.blocks.length === 0 ? (
              <Card variant="outlined" className="border-zinc-200 border-dashed bg-zinc-50/50 p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-zinc-200 p-4">
                    <Layout className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-800">Start building</h3>
                  <p className="mt-1 max-w-sm text-sm text-zinc-600">
                    Your portfolio is empty. Add blocks from the library to get started.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => addBlock(selectedType)}
                  >
                    <Plus className="h-4 w-4" />
                    Add first block
                  </Button>
                </div>
              </Card>
            ) : (
              <>
              {selectedBlocks.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                  <span className="text-sm font-medium text-amber-800">
                    {selectedBlocks.size} selected
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2 py-1 text-sm"
                    onClick={() => {
                      const next = {
                        ...siteConfig,
                        blocks: siteConfig.blocks.map((b) =>
                          selectedBlocks.has(b.id) ? { ...b, enabled: true } : b,
                        ),
                      };
                      setSiteConfig(next);
                      pushHistory(next);
                      setSelectedBlocks(new Set());
                      toast.success("Enabled selected");
                    }}
                  >
                    Enable all
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2 py-1 text-sm"
                    onClick={() => {
                      const next = {
                        ...siteConfig,
                        blocks: siteConfig.blocks.map((b) =>
                          selectedBlocks.has(b.id) ? { ...b, enabled: false } : b,
                        ),
                      };
                      setSiteConfig(next);
                      pushHistory(next);
                      setSelectedBlocks(new Set());
                      toast.success("Disabled selected");
                    }}
                  >
                    Disable all
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2 py-1 text-sm text-red-600 hover:bg-red-100"
                    onClick={() => {
                      const next = {
                        ...siteConfig,
                        blocks: siteConfig.blocks.filter((b) => !selectedBlocks.has(b.id)),
                      };
                      setSiteConfig(next);
                      pushHistory(next);
                      setSelectedBlocks(new Set());
                      toast.success("Deleted selected");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSelectedBlocks(new Set())}
                    className="text-sm text-amber-700 underline"
                  >
                    Clear
                  </button>
                </div>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={siteConfig.blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 overflow-y-auto">
                {siteConfig.blocks.map((block, index) => {
                  const isExpanded = expandedBlocks.has(block.id);
                  const activeTab = getBlockTab(block.id);
                  const blockMeta = BLOCK_LIBRARY.find((b) => b.type === block.type);
                  const blockLabel = blockMeta?.label ?? block.type;
                  const BlockIcon = blockMeta ? BLOCK_ICON_MAP[blockMeta.icon] : null;

                  return (
                    <SortableBlockItem key={block.id} id={block.id} disabled={block.locked}>
                      {({ attributes, listeners }) => (
                    <Card
                      variant="outlined"
                      className={`overflow-hidden border-zinc-300 bg-white transition-shadow ${
                        isExpanded ? "ring-1 ring-zinc-400" : ""
                      }`}
                    >
                      {/* Block header - always visible, whole row draggable */}
                      <div
                        className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-zinc-50/80 ${
                          !block.locked ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
                          toggleBlockExpanded(block.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleBlockExpanded(block.id);
                          }
                        }}
                        {...(attributes as React.HTMLAttributes<HTMLDivElement>)}
                        {...(block.locked ? {} : (listeners as React.HTMLAttributes<HTMLDivElement>))}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        title={block.locked ? undefined : "Drag to reorder · Click to expand"}
                      >
                        <div
                          data-no-drag
                          className={`rounded p-1.5 text-zinc-500 ${
                            block.locked ? "cursor-not-allowed opacity-60" : "opacity-70"
                          }`}
                          title={block.locked ? "Block is locked" : "Drag handle"}
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        {BlockIcon && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                            <BlockIcon className="h-4 w-4 text-zinc-600" />
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
                        )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-zinc-900">{blockLabel}</p>
                              {block.locked && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                  <Lock className="h-3 w-3" />
                                  Locked
                                </span>
                              )}
                              {block.hidden && (
                                <span className="inline-flex items-center gap-1 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                                  <EyeOff className="h-3 w-3" />
                                  Hidden
                                </span>
                              )}
                              {getBlockValidationIssues(block).length > 0 && (
                              <span
                                className="inline-flex text-amber-500"
                                title={getBlockValidationIssues(block).join(". ")}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <div
                            className="mt-1 flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            data-no-drag
                          >
                            <span className="text-xs font-medium text-zinc-500">#</span>
                            <input
                              type="text"
                              value={block.sectionId ?? ""}
                              onChange={(e) =>
                                !block.locked &&
                                updateBlock(block.id, {
                                  sectionId: e.target.value.replace(/[^a-z0-9-]/gi, "") || undefined,
                                })
                              }
                              onClick={(e) => e.stopPropagation()}
                              placeholder="section-id"
                              disabled={block.locked}
                              className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm font-mono text-zinc-700 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          data-no-drag
                        >
                          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-zinc-700">
                            <input
                              type="checkbox"
                              checked={selectedBlocks.has(block.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedBlocks((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(block.id);
                                  else next.delete(block.id);
                                  return next;
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            Select
                          </label>
                          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-zinc-700">
                            <input
                              type="checkbox"
                              checked={block.enabled}
                              onChange={(e) =>
                                updateBlock(block.id, { enabled: e.target.checked })
                              }
                            />
                            On
                          </label>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBlock(block.id, { locked: !block.locked });
                            }}
                            title={block.locked ? "Unlock block" : "Lock block (no edit/move)"}
                          >
                            {block.locked ? (
                              <Lock className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <LockOpen className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBlock(block.id, { hidden: !block.hidden });
                            }}
                            title={block.hidden ? "Show on public" : "Hide from public"}
                          >
                            {block.hidden ? (
                              <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-2"
                            onClick={() => moveBlock(index, "up")}
                            disabled={index === 0 || block.locked}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-2"
                            onClick={() => moveBlock(index, "down")}
                            disabled={index === siteConfig.blocks.length - 1 || block.locked}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-2"
                            onClick={() => duplicateBlock(block.id)}
                            disabled={block.locked}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="p-2"
                            onClick={() => removeBlock(block.id)}
                            disabled={block.locked}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expandable content */}
                      {isExpanded && (
                        <div className="border-t border-zinc-200 bg-zinc-50/30 p-3">
                          {/* Tabs */}
                          <div className="mb-4 flex gap-1 rounded-lg bg-zinc-200/60 p-1">
                            <button
                              type="button"
                              onClick={() => setBlockTabFor(block.id, "content")}
                              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                                activeTab === "content"
                                  ? "bg-white text-zinc-900 shadow-sm"
                                  : "text-zinc-600 hover:text-zinc-900"
                              }`}
                            >
                              <Settings2 className="h-4 w-4" />
                              Content
                            </button>
                            <button
                              type="button"
                              onClick={() => setBlockTabFor(block.id, "style")}
                              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                                activeTab === "style"
                                  ? "bg-white text-zinc-900 shadow-sm"
                                  : "text-zinc-600 hover:text-zinc-900"
                              }`}
                            >
                              <Palette className="h-4 w-4" />
                              Style
                            </button>
                          </div>

                          {block.locked ? (
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                              <Lock className="h-4 w-4 shrink-0" />
                              Block is locked. Unlock to edit.
                            </div>
                          ) : activeTab === "content" ? (
                            renderSettingsEditor(block)
                          ) : (
                            renderStyleEditor(block)
                          )}
                        </div>
                      )}
                    </Card>
                      )}
                    </SortableBlockItem>
                  );
                })}
              </div>
                </SortableContext>
              </DndContext>
              </>
            )}
          </div>

        </div>

        {/* Preview drawer */}
        {previewUrl && (
          <>
            <div
              role="button"
              tabIndex={0}
              aria-hidden={!previewDrawerOpen}
              className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
                previewDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setPreviewDrawerOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setPreviewDrawerOpen(false)}
            />
            <div
              className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[95vw] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out sm:w-[560px] md:w-[640px] lg:w-[720px] xl:w-[800px] ${
                previewDrawerOpen ? "translate-x-0" : "translate-x-full"
              }`}
              aria-hidden={!previewDrawerOpen}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-900 shrink-0">
                  {previewDesignMode ? "Design preview" : "Live preview"}
                </h2>
                {previewDesignMode && (
                  <select
                    value={siteConfig.fontFamily ?? "inter"}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, fontFamily: e.target.value }))
                    }
                    className="h-8 rounded border border-zinc-300 bg-white px-2.5 text-xs text-zinc-700"
                    title="Site font"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewDesignMode((d) => !d)}
                    className={`rounded p-1.5 transition ${
                      previewDesignMode ? "bg-indigo-100 text-indigo-700" : "bg-zinc-200 hover:bg-zinc-300 text-zinc-600"
                    }`}
                    title={previewDesignMode ? "Switch to live preview" : "Design mode — click elements to edit"}
                  >
                    <Layout className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDarkMode((d) => !d)}
                    className={`rounded p-1.5 transition ${
                      previewDarkMode ? "bg-zinc-800 text-white" : "bg-zinc-200 hover:bg-zinc-300"
                    }`}
                    title={previewDarkMode ? "Light mode" : "Dark mode"}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  {(["desktop", "tablet", "mobile"] as const).map((vp) => (
                    <button
                      key={vp}
                      type="button"
                      onClick={() => setPreviewViewport(vp)}
                      className={`rounded p-1.5 transition ${
                        previewViewport === vp ? "bg-zinc-200" : "hover:bg-zinc-100"
                      }`}
                      title={vp}
                    >
                      {vp === "desktop" && <Monitor className="h-4 w-4" />}
                      {vp === "tablet" && <Tablet className="h-4 w-4" />}
                      {vp === "mobile" && <Smartphone className="h-4 w-4" />}
                    </button>
                  ))}
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1.5 text-zinc-600 transition hover:bg-zinc-100"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewDrawerOpen(false)}
                    className="rounded p-1.5 text-zinc-600 transition hover:bg-zinc-100"
                    aria-label="Close preview"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div
                className={`relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto bg-zinc-100 p-4 ${previewDesignMode && (siteConfig.fontFamily ?? "inter") !== "inherit" ? `font-hero-${siteConfig.fontFamily ?? "inter"}` : ""}`}
              >
                {previewDesignMode ? (
                  (() => {
                    const expandedText = siteConfig.blocks.find(
                      (b) => b.type === "text" && expandedBlocks.has(b.id)
                    );
                    const expandedHero = siteConfig.blocks.find(
                      (b) => b.type === "hero" && expandedBlocks.has(b.id)
                    );
                    const expandedSkills = siteConfig.blocks.find(
                      (b) => b.type === "skills" && expandedBlocks.has(b.id)
                    );
                    const expandedServices = siteConfig.blocks.find(
                      (b) => b.type === "services" && expandedBlocks.has(b.id)
                    );
                    const textBlock = expandedText ?? siteConfig.blocks.find((b) => b.type === "text");
                    const heroBlock = expandedHero ?? siteConfig.blocks.find((b) => b.type === "hero");
                    const skillsBlock = expandedSkills ?? siteConfig.blocks.find((b) => b.type === "skills");
                    const servicesBlock = expandedServices ?? siteConfig.blocks.find((b) => b.type === "services");

                    if (expandedText && textBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <TextDesignPreview
                            block={textBlock}
                            selectedComponent={selectedTextComponent}
                            onSelectComponent={(c) => setSelectedTextComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            FONT_OPTIONS={FONT_OPTIONS}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (expandedHero && heroBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <HeroDesignPreview
                            block={heroBlock}
                            selectedComponent={
                              selectedHeroComponent === "ctas" ? "cta1" : (selectedHeroComponent as "badge" | "title" | "subtitle" | "avatar" | "cta1" | "cta2" | null)
                            }
                            onSelectComponent={(c) => setSelectedHeroComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (expandedSkills && skillsBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <SkillsDesignPreview
                            block={skillsBlock}
                            selectedComponent={selectedSkillsComponent}
                            onSelectComponent={(c) => setSelectedSkillsComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (expandedServices && servicesBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <ServicesDesignPreview
                            block={servicesBlock}
                            selectedComponent={selectedServicesComponent}
                            onSelectComponent={(c) => setSelectedServicesComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (textBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <TextDesignPreview
                            block={textBlock}
                            selectedComponent={selectedTextComponent}
                            onSelectComponent={(c) => setSelectedTextComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            FONT_OPTIONS={FONT_OPTIONS}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (heroBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <HeroDesignPreview
                            block={heroBlock}
                            selectedComponent={
                              selectedHeroComponent === "ctas" ? "cta1" : (selectedHeroComponent as "badge" | "title" | "subtitle" | "avatar" | "cta1" | "cta2" | null)
                            }
                            onSelectComponent={(c) => setSelectedHeroComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (skillsBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <SkillsDesignPreview
                            block={skillsBlock}
                            selectedComponent={selectedSkillsComponent}
                            onSelectComponent={(c) => setSelectedSkillsComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    if (servicesBlock) {
                      return (
                        <div className="w-full max-w-full overflow-auto">
                          <ServicesDesignPreview
                            block={servicesBlock}
                            selectedComponent={selectedServicesComponent}
                            onSelectComponent={(c) => setSelectedServicesComponent(c ?? null)}
                            updateBlockSettings={updateBlockSettings}
                            theme={{ primary: theme.primary, accent: theme.accent }}
                            viewportWidth={
                              previewViewport === "desktop"
                                ? 640
                                : previewViewport === "tablet"
                                  ? 480
                                  : 375
                            }
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-lg border border-zinc-300 bg-white p-8 text-center text-zinc-500">
                        <p className="text-sm">Add a Hero, Text, Skills, or Services block to use design preview.</p>
                        <p className="mt-2 text-xs">Expand a block and click the Layout icon to switch to design mode.</p>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    {previewLoading && (
                      <div className="absolute inset-4 z-10 flex items-center justify-center rounded-lg bg-zinc-200/80">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                      </div>
                    )}
                    <div
                      className="mx-auto w-full max-w-full overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-lg"
                      style={{
                        width:
                          previewViewport === "desktop"
                            ? "100%"
                            : previewViewport === "tablet"
                              ? "768px"
                              : "375px",
                        aspectRatio:
                          previewViewport === "desktop"
                            ? "16/10"
                            : previewViewport === "tablet"
                              ? "768/500"
                              : "375/667",
                      }}
                    >
                      <iframe
                        key={previewKey}
                        src={previewUrl}
                        title="Preview"
                        className="h-full w-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={() => setPreviewLoading(false)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
