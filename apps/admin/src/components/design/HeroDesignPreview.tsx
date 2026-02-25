"use client";

import { Button, Input } from "@nexora/ui";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { BuilderBlock } from "@nexora/portfolio-builder";

export type HeroComponentType = "badge" | "title" | "subtitle" | "avatar" | "cta1" | "cta2";

const COMPONENT_LABELS: Record<HeroComponentType, string> = {
  badge: "Badge",
  title: "Title",
  subtitle: "Subtitle",
  avatar: "Avatar",
  cta1: "Primary CTA",
  cta2: "Secondary CTA",
};

function getColor(block: BuilderBlock, key: string, theme: { primary: string; accent: string }): string {
  const v = block.settings[key];
  if (typeof v !== "string") return theme.accent;
  if (v === "accent") return theme.accent;
  if (v === "primary") return theme.primary;
  if (v === "custom") return String(block.settings[`${key.replace("Color", "CustomColor")}`] ?? theme.accent);
  if (v === "neutral") return "#71717a";
  return theme.accent;
}

function getColorForInput(
  block: BuilderBlock,
  key: "badgeColor" | "ctaColor" | "cta2Color",
  theme: { primary: string; accent: string }
): string {
  const v = block.settings[key];
  if (v === "custom") {
    const customKey = key.replace("Color", "CustomColor") as "badgeCustomColor" | "ctaCustomColor" | "cta2CustomColor";
    return String(block.settings[customKey] ?? theme.accent);
  }
  if (v === "primary") return theme.primary;
  return theme.accent;
}

export interface HeroDesignPreviewProps {
  block: BuilderBlock;
  selectedComponent: HeroComponentType | null;
  onSelectComponent: (c: HeroComponentType | null) => void;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme: { primary: string; accent: string };
  viewportWidth?: number;
}

export function HeroDesignPreview({
  block,
  selectedComponent,
  onSelectComponent,
  updateBlockSettings,
  theme,
  viewportWidth = 375,
}: HeroDesignPreviewProps) {
  const [floatingPanelPos, setFloatingPanelPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const title = String(block.settings.title ?? "Your title");
  const subtitle = String(block.settings.subtitle ?? "Your subtitle here.");
  const badgeText = String(block.settings.badgeText ?? "").trim() || "Badge";
  const badgeVisible = Boolean(block.settings.badgeVisible ?? true);
  const avatarUrl = String(block.settings.avatarUrl ?? "").trim();
  const ctaText = String(block.settings.ctaText ?? "Get started");
  const ctaHref = String(block.settings.ctaHref ?? "#");
  const cta2Text = String(block.settings.cta2Text ?? "").trim();
  const cta2Href = String(block.settings.cta2Href ?? "#");
  const heroLayout = String(block.settings.heroLayout ?? "centered");
  const heroComponentOrder = (Array.isArray(block.settings.heroComponentOrder)
    ? block.settings.heroComponentOrder
    : ["badge", "title", "subtitle", "avatar", "ctas"]
  ).filter((id): id is string => typeof id === "string");

  const badgeColor = getColor(block, "badgeColor", theme);
  const primaryColor = getColor(block, "ctaColor", theme);
  const secondaryColor =
    block.settings.cta2Color === "same"
      ? primaryColor
      : getColor(block, "cta2Color", theme);

  const handleElementClick = useCallback(
    (e: React.MouseEvent, component: HeroComponentType) => {
      e.stopPropagation();
      const next = selectedComponent === component ? null : component;
      onSelectComponent(next);
      if (next) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const container = containerRef.current?.getBoundingClientRect();
        if (container) {
          setFloatingPanelPos({ x: rect.left - container.left + rect.width / 2, y: rect.bottom - container.top + 8 });
        }
      } else {
        setFloatingPanelPos(null);
      }
    },
    [selectedComponent, onSelectComponent]
  );

  const Selectable = ({
    component,
    children,
    className = "",
  }: {
    component: HeroComponentType;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => handleElementClick(e, component)}
      onKeyDown={(e) => e.key === "Enter" && handleElementClick(e as unknown as React.MouseEvent, component)}
      className={`cursor-pointer rounded-lg outline-none transition-all ring-2 ring-transparent hover:ring-indigo-300 ${
        selectedComponent === component ? "ring-indigo-500 ring-offset-2" : ""
      } ${className}`}
      title={`Click to edit ${COMPONENT_LABELS[component]}`}
    >
      {children}
    </div>
  );

  const layoutClasses =
    heroLayout === "centered" || heroLayout === "center"
      ? "text-center items-center"
      : heroLayout === "right"
        ? "text-right items-end"
        : "text-left items-start";

  const avatarPx = 96;
  const badgeStyle =
    badgeColor === "accent"
      ? { backgroundColor: `${theme.accent}20`, color: theme.accent, borderColor: `${theme.accent}40` }
      : badgeColor === "primary"
        ? { backgroundColor: `${theme.primary}15`, color: theme.primary, borderColor: `${theme.primary}30` }
        : { backgroundColor: "#f4f4f5", color: "#71717a", borderColor: "#e4e4e7" };

  const orderedElements = heroComponentOrder.length > 0 ? heroComponentOrder : ["badge", "title", "subtitle", "avatar", "ctas"];

  return (
    <div ref={containerRef} className="relative min-h-[400px] rounded-lg border border-zinc-300 bg-zinc-50 p-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        Design preview — click elements to edit
      </p>
      <div
        className={`mx-auto flex flex-col gap-4 ${layoutClasses}`}
        style={{ width: viewportWidth, maxWidth: "100%" }}
      >
        {orderedElements.map((id) => {
          if (id === "badge" && badgeVisible) {
            return (
              <Selectable key="badge" component="badge">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
                  style={badgeStyle}
                >
                  {badgeText}
                </span>
              </Selectable>
            );
          }
          if (id === "title") {
            return (
              <Selectable key="title" component="title">
                <h1 className="text-3xl font-bold text-zinc-900" style={{ color: theme.primary }}>
                  {title}
                </h1>
              </Selectable>
            );
          }
          if (id === "subtitle") {
            return (
              <Selectable key="subtitle" component="subtitle">
                <p className="text-lg text-zinc-600">{subtitle}</p>
              </Selectable>
            );
          }
          if (id === "avatar") {
            return (
              <Selectable key="avatar" component="avatar">
                <div
                  className="flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-zinc-100 shadow-lg"
                  style={{ width: avatarPx, height: avatarPx }}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={avatarPx}
                      height={avatarPx}
                      className="h-full w-full object-cover"
                      unoptimized={avatarUrl.startsWith("data:")}
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">Add image</span>
                  )}
                </div>
              </Selectable>
            );
          }
          if (id === "ctas") {
            return (
              <div key="ctas" className="flex flex-wrap gap-3">
                <Selectable component="cta1">
                  <Button
                    variant="primary"
                    className="px-6 py-2.5"
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor, color: "#fff" }}
                  >
                    {ctaText}
                  </Button>
                </Selectable>
                {cta2Text && (
                  <Selectable component="cta2">
                    <Button
                      variant="secondary"
                      className="px-6 py-2.5 border-2"
                      style={{ borderColor: secondaryColor, color: secondaryColor }}
                    >
                      {cta2Text}
                    </Button>
                  </Selectable>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Floating property panel */}
      {selectedComponent && floatingPanelPos && (
        <div
          className="absolute z-50 min-w-[200px] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
          style={{ left: floatingPanelPos.x, top: floatingPanelPos.y, transform: "translateX(-50%)" }}
        >
          <p className="mb-2 text-xs font-semibold text-zinc-700">{COMPONENT_LABELS[selectedComponent]}</p>
          <div className="mb-2 space-y-1">
            <label className="block text-[10px] font-medium text-zinc-500">Layout</label>
            <select
              value={String(block.settings.heroLayout ?? "centered")}
              onChange={(e) =>
                updateBlockSettings(block.id, { heroLayout: e.target.value })
              }
              className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
            >
              <option value="centered">Centered</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="mb-2 space-y-1">
            <label className="block text-[10px] font-medium text-zinc-500">Order</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  const order = [...orderedElements];
                  const key = selectedComponent === "cta1" || selectedComponent === "cta2" ? "ctas" : selectedComponent;
                  const idx = order.indexOf(key);
                  if (idx > 0) {
                    [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                    updateBlockSettings(block.id, { heroComponentOrder: order });
                  }
                }}
                className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
              >
                ↑ Move up
              </button>
              <button
                type="button"
                onClick={() => {
                  const order = [...orderedElements];
                  const key = selectedComponent === "cta1" || selectedComponent === "cta2" ? "ctas" : selectedComponent;
                  const idx = order.indexOf(key);
                  if (idx >= 0 && idx < order.length - 1) {
                    [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
                    updateBlockSettings(block.id, { heroComponentOrder: order });
                  }
                }}
                className="flex-1 rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
              >
                ↓ Move down
              </button>
            </div>
          </div>
          {(selectedComponent === "badge" || selectedComponent === "cta1" || selectedComponent === "cta2") && (
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-zinc-500">Color</label>
              <div className="flex items-center gap-2">
                <div className="h-8 w-10 shrink-0 overflow-hidden rounded border border-zinc-300">
                  <input
                    type="color"
                    value={
                      selectedComponent === "badge"
                        ? getColorForInput(block, "badgeColor", theme)
                        : selectedComponent === "cta1"
                          ? getColorForInput(block, "ctaColor", theme)
                          : getColorForInput(block, "cta2Color", theme)
                    }
                    onChange={(e) => {
                      const hex = e.target.value;
                      if (selectedComponent === "badge") {
                        updateBlockSettings(block.id, { badgeColor: "custom", badgeCustomColor: hex });
                      } else if (selectedComponent === "cta1") {
                        updateBlockSettings(block.id, { ctaColor: "custom", ctaCustomColor: hex });
                      } else {
                        updateBlockSettings(block.id, { cta2Color: "custom", cta2CustomColor: hex });
                      }
                    }}
                    className="h-full w-full cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  value={
                    selectedComponent === "badge"
                      ? getColorForInput(block, "badgeColor", theme)
                      : selectedComponent === "cta1"
                        ? getColorForInput(block, "ctaColor", theme)
                        : getColorForInput(block, "cta2Color", theme)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (selectedComponent === "badge") {
                      updateBlockSettings(block.id, { badgeColor: "custom", badgeCustomColor: v });
                    } else if (selectedComponent === "cta1") {
                      updateBlockSettings(block.id, { ctaColor: "custom", ctaCustomColor: v });
                    } else {
                      updateBlockSettings(block.id, { cta2Color: "custom", cta2CustomColor: v });
                    }
                  }}
                  className="h-8 flex-1 font-mono text-xs"
                  placeholder="#6366f1"
                />
              </div>
            </div>
          )}
          {(selectedComponent === "title" || selectedComponent === "subtitle") && (
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-zinc-500">
                {selectedComponent === "title" ? "Title" : "Subtitle"}
              </label>
              <Input
                value={selectedComponent === "title" ? title : subtitle}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    [selectedComponent === "title" ? "title" : "subtitle"]: e.target.value,
                  })
                }
                className="h-8 text-sm"
                placeholder={selectedComponent === "title" ? "Title" : "Subtitle"}
              />
              <label className="block text-[10px] font-medium text-zinc-500">Alignment</label>
              <select
                value={String(selectedComponent === "title" ? block.settings.titleAlign ?? "inherit" : block.settings.subtitleAlign ?? "inherit")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    [selectedComponent === "title" ? "titleAlign" : "subtitleAlign"]: e.target.value,
                  })
                }
                className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
              >
                <option value="inherit">Inherit from layout</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          )}
          {selectedComponent === "cta1" && (
            <div className="mt-2 space-y-2">
              <label className="block text-[10px] font-medium text-zinc-500">Button text</label>
              <Input
                value={ctaText}
                onChange={(e) => updateBlockSettings(block.id, { ctaText: e.target.value })}
                className="h-8 text-sm"
                placeholder="Button text"
              />
              <label className="block text-[10px] font-medium text-zinc-500">Link</label>
              <Input
                value={ctaHref}
                onChange={(e) => updateBlockSettings(block.id, { ctaHref: e.target.value })}
                className="h-8 text-sm"
                placeholder="#"
              />
            </div>
          )}
          {selectedComponent === "cta2" && (
            <div className="mt-2 space-y-2">
              <label className="block text-[10px] font-medium text-zinc-500">Button text</label>
              <Input
                value={cta2Text}
                onChange={(e) => updateBlockSettings(block.id, { cta2Text: e.target.value })}
                className="h-8 text-sm"
                placeholder="Button text"
              />
              <label className="block text-[10px] font-medium text-zinc-500">Link</label>
              <Input
                value={cta2Href}
                onChange={(e) => updateBlockSettings(block.id, { cta2Href: e.target.value })}
                className="h-8 text-sm"
                placeholder="#"
              />
            </div>
          )}
          {selectedComponent === "avatar" && (
            <div className="mt-2 space-y-2">
              <label className="block text-[10px] font-medium text-zinc-500">Image URL</label>
              <Input
                value={avatarUrl}
                onChange={(e) => updateBlockSettings(block.id, { avatarUrl: e.target.value })}
                className="h-8 text-sm"
                placeholder="https://..."
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onSelectComponent(null);
              setFloatingPanelPos(null);
            }}
            className="mt-2 w-full rounded border border-zinc-200 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
