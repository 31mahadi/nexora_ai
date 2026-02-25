"use client";

import { Button, Input } from "@nexora/ui";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { ImageField } from "./ImageField";
import { hasLowContrast } from "@nexora/portfolio-builder";
import type { BuilderBlock } from "@nexora/portfolio-builder";

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

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 box-border";
const SELECT_COMPACT = "h-9 w-full max-w-[180px] rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 box-border";
const INPUT_CLASS =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 box-border";
const LABEL_CLASS = "text-[11px] font-medium text-zinc-600 mb-1 block";
const SECTION_TITLE = "text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2";
const COLOR_INPUT_WRAPPER = "h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex";
const COLOR_INPUT_INNER = "h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block";

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

export type HeroComponentType = "badge" | "title" | "subtitle" | "avatar" | "ctas" | "cta1" | "cta2";

export interface HeroBlockSettingsProps {
  block: BuilderBlock;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme: { primary: string; accent: string };
  newCarouselImage: string;
  setNewCarouselImage: (v: string) => void;
  addToStringList: (blockId: string, key: "carouselImages" | "images" | "logos", value: string) => void;
  removeFromStringList: (blockId: string, key: "carouselImages" | "images" | "logos", idx: number) => void;
  FONT_OPTIONS: { value: string; label: string }[];
  selectedComponent?: HeroComponentType | null;
  onClearSelection?: () => void;
}

export function HeroBlockSettings({
  block,
  updateBlockSettings,
  theme,
  newCarouselImage,
  setNewCarouselImage,
  addToStringList,
  removeFromStringList,
  FONT_OPTIONS,
  selectedComponent = null,
  onClearSelection,
}: HeroBlockSettingsProps) {
  const show = (...components: HeroComponentType[]) =>
    !selectedComponent || components.includes(selectedComponent);
  const carouselImages = Array.isArray(block.settings.carouselImages)
    ? (block.settings.carouselImages as unknown[]).filter((v): v is string => typeof v === "string")
    : [];

  const CtaSection = ({
    label,
    textKey,
    hrefKey,
    colorKey,
    customColorKey,
    styleKey,
    textColorKey,
    textCustomColorKey,
    borderWidthKey,
    borderRadiusKey,
    borderColorKey,
    borderCustomColorKey,
    sizeKey,
    fontSizeKey,
    sameOption = false,
    hideTextLink = false,
  }: {
    label: string;
    textKey: "ctaText" | "cta2Text";
    hrefKey: "ctaHref" | "cta2Href";
    colorKey: "ctaColor" | "cta2Color";
    customColorKey: "ctaCustomColor" | "cta2CustomColor";
    styleKey: "ctaStyle" | "cta2Style";
    textColorKey: "ctaTextColor" | "cta2TextColor";
    textCustomColorKey: "ctaTextCustomColor" | "cta2TextCustomColor";
    borderWidthKey: "ctaBorderWidth" | "cta2BorderWidth";
    borderRadiusKey: "ctaBorderRadius" | "cta2BorderRadius";
    borderColorKey: "ctaBorderColor" | "cta2BorderColor";
    borderCustomColorKey: "ctaBorderCustomColor" | "cta2BorderCustomColor";
    sizeKey: "ctaSize" | "cta2Size";
    fontSizeKey: "ctaFontSize" | "cta2FontSize";
    sameOption?: boolean;
    hideTextLink?: boolean;
  }) => {
    const colorOpts = sameOption
      ? (["same", "accent", "primary", "block", "custom"] as const)
      : (["accent", "primary", "block", "custom"] as const);
    const styleOpts = sameOption
      ? (["same", "primary", "outline", "ghost"] as const)
      : (["primary", "outline", "ghost"] as const);
    const textColorOpts = sameOption
      ? (["same", "auto", "white", "primary", "custom"] as const)
      : (["auto", "white", "primary", "custom"] as const);
    const borderWidthOpts = sameOption
      ? (["same", "none", "thin", "medium", "thick"] as const)
      : (["none", "thin", "medium", "thick"] as const);
    const borderRadiusOpts = sameOption
      ? (["same", "none", "sm", "md", "lg", "full"] as const)
      : (["none", "sm", "md", "lg", "full"] as const);
    const sizeOpts = sameOption
      ? (["same", "compact", "normal", "large"] as const)
      : (["compact", "normal", "large"] as const);
    const fontSizeOpts = sameOption
      ? (["same", "sm", "md", "lg"] as const)
      : (["sm", "md", "lg"] as const);
    const borderColorOpts = sameOption
      ? (["same", "accent", "primary", "custom"] as const)
      : (["same", "accent", "primary", "custom"] as const);

    return (
      <div className="space-y-2">
        {label && <p className={LABEL_CLASS}>{label}</p>}
        {!hideTextLink && (
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            value={String(block.settings[textKey] ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { [textKey]: e.target.value })}
            placeholder={sameOption ? "Second button text" : "CTA text"}
          />
          <Input
            value={String(block.settings[hrefKey] ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { [hrefKey]: e.target.value })}
            placeholder={sameOption ? "#contact" : "#services"}
          />
        </div>
        )}
        <div className="mt-2 space-y-2">
          <p className={LABEL_CLASS}>Color</p>
          <div className="flex flex-wrap gap-2">
            {colorOpts.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateBlockSettings(block.id, { [colorKey]: opt })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  (block.settings[colorKey] ?? (sameOption ? "same" : "accent")) === opt
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {opt === "same"
                  ? "Same as primary"
                  : opt === "accent"
                    ? "Theme accent"
                    : opt === "primary"
                      ? "Theme primary"
                      : opt === "block"
                        ? "Block accent"
                        : "Custom"}
              </button>
            ))}
          </div>
          {(block.settings[colorKey] ?? (sameOption ? "same" : "accent")) === "custom" && (
            <div className="flex items-center gap-3">
              <div className={COLOR_INPUT_WRAPPER}>
                <input
                  type="color"
                  value={
                    new RegExp("^#[0-9A-Fa-f]{6}$").test(String(block.settings[customColorKey] ?? ""))
                      ? String(block.settings[customColorKey])
                      : "#6366f1"
                  }
                  onChange={(e) => updateBlockSettings(block.id, { [customColorKey]: e.target.value })}
                  className={COLOR_INPUT_INNER}
                />
              </div>
              <Input
                value={String(block.settings[customColorKey] ?? "#6366f1")}
                onChange={(e) => updateBlockSettings(block.id, { [customColorKey]: e.target.value })}
                placeholder="#6366f1"
                className="h-9 flex-1 font-mono text-sm"
              />
              <ContrastWarning color={String(block.settings[customColorKey] ?? theme.accent)} onWhite={false} />
            </div>
          )}
        </div>
        <p className="mt-3 text-xs font-medium text-zinc-600">Appearance</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className={LABEL_CLASS}>Style</label>
            <select
              value={String(block.settings[styleKey] ?? (sameOption ? "same" : "primary"))}
              onChange={(e) => updateBlockSettings(block.id, { [styleKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {styleOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as primary" : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Text color</label>
            <select
              value={String(block.settings[textColorKey] ?? (sameOption ? "same" : "auto"))}
              onChange={(e) => updateBlockSettings(block.id, { [textColorKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {textColorOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as primary" : o === "auto" ? "Auto (contrast)" : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {(block.settings[textColorKey] ?? (sameOption ? "same" : "auto")) === "custom" && (
            <div className="flex items-end gap-2 min-h-[52px]">
              <div className={COLOR_INPUT_WRAPPER}>
                <input
                  type="color"
                  value={
                    new RegExp("^#[0-9A-Fa-f]{6}$").test(String(block.settings[textCustomColorKey] ?? ""))
                      ? String(block.settings[textCustomColorKey])
                      : "#ffffff"
                  }
                  onChange={(e) => updateBlockSettings(block.id, { [textCustomColorKey]: e.target.value })}
                  className={COLOR_INPUT_INNER}
                />
              </div>
              <Input
                value={String(block.settings[textCustomColorKey] ?? "#ffffff")}
                onChange={(e) => updateBlockSettings(block.id, { [textCustomColorKey]: e.target.value })}
                placeholder="#ffffff"
                className="h-9 flex-1 font-mono text-sm"
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS}>Border width</label>
            <select
              value={String(block.settings[borderWidthKey] ?? (sameOption ? "same" : "medium"))}
              onChange={(e) => updateBlockSettings(block.id, { [borderWidthKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {borderWidthOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as primary" : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Border radius</label>
            <select
              value={String(block.settings[borderRadiusKey] ?? (sameOption ? "same" : "md"))}
              onChange={(e) => updateBlockSettings(block.id, { [borderRadiusKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {borderRadiusOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as primary" : o === "none" ? "Square" : o === "full" ? "Full (pill)" : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Border color</label>
            <select
              value={String(block.settings[borderColorKey] ?? "same")}
              onChange={(e) => updateBlockSettings(block.id, { [borderColorKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {borderColorOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as background" : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {(block.settings[borderColorKey] ?? "same") === "custom" && (
            <div className="flex items-end gap-2 min-h-[52px]">
              <div className={COLOR_INPUT_WRAPPER}>
                <input
                  type="color"
                  value={
                    new RegExp("^#[0-9A-Fa-f]{6}$").test(String(block.settings[borderCustomColorKey] ?? ""))
                      ? String(block.settings[borderCustomColorKey])
                      : "#6366f1"
                  }
                  onChange={(e) => updateBlockSettings(block.id, { [borderCustomColorKey]: e.target.value })}
                  className={COLOR_INPUT_INNER}
                />
              </div>
              <Input
                value={String(block.settings[borderCustomColorKey] ?? "#6366f1")}
                onChange={(e) => updateBlockSettings(block.id, { [borderCustomColorKey]: e.target.value })}
                placeholder="#6366f1"
                className="h-9 flex-1 font-mono text-sm"
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS}>Button size</label>
            <select
              value={String(block.settings[sizeKey] ?? (sameOption ? "same" : "normal"))}
              onChange={(e) => updateBlockSettings(block.id, { [sizeKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {sizeOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as primary" : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Font size</label>
            <select
              value={String(block.settings[fontSizeKey] ?? (sameOption ? "same" : "md"))}
              onChange={(e) => updateBlockSettings(block.id, { [fontSizeKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              {fontSizeOpts.map((o) => (
                <option key={o} value={o}>
                  {o === "same" ? "Same as primary" : o === "sm" ? "Small" : o === "lg" ? "Large" : "Medium"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const [subtitleExpanded, setSubtitleExpanded] = useState(false);
  const hasSecondaryCta = Boolean(String(block.settings.cta2Text ?? "").trim());

  return (
    <div className="space-y-4">
      {selectedComponent && onClearSelection && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <span className="text-sm font-medium text-indigo-800">
            Editing: {selectedComponent === "cta1" ? "Primary CTA" : selectedComponent === "cta2" ? "Secondary CTA" : selectedComponent.charAt(0).toUpperCase() + selectedComponent.slice(1)}
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
      {/* Content */}
      {(show("badge") || show("title") || show("subtitle") || show("avatar")) && (
      <div>
        <p className={SECTION_TITLE}>Content</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {show("title") && (
          <div className="lg:col-span-2">
            <label className={LABEL_CLASS}>Title</label>
            <Input
              value={String(block.settings.title ?? "")}
              onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
              placeholder="Hero title"
              className="h-9"
            />
          </div>
          )}
          {show("badge") && (
          <div className="lg:col-span-2 flex items-end gap-2">
            <label className={LABEL_CLASS} />
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={Boolean(block.settings.badgeVisible ?? true)}
                onChange={(e) => updateBlockSettings(block.id, { badgeVisible: e.target.checked })}
              />
              Badge
            </label>
            {Boolean(block.settings.badgeVisible ?? true) && (
              <Input
                value={String(block.settings.badgeText ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { badgeText: e.target.value })}
                placeholder="Badge text"
                className="h-9 flex-1"
              />
            )}
          </div>
          )}
        </div>
        {show("subtitle") && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <label className={LABEL_CLASS}>Subtitle</label>
            <button
              type="button"
              onClick={() => setSubtitleExpanded((e) => !e)}
              className="text-[10px] text-zinc-500 hover:text-zinc-700"
            >
              {subtitleExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
          <textarea
            value={String(block.settings.subtitle ?? "")}
            onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
            placeholder="Hero subtitle"
            className={`${INPUT_CLASS} w-full ${subtitleExpanded ? "min-h-[80px]" : ""}`}
            rows={subtitleExpanded ? 3 : 1}
          />
        </div>
        )}
        {show("avatar") && (
        <div className="mt-2">
          <label className={LABEL_CLASS}>Avatar</label>
          <ImageField
            value={String(block.settings.avatarUrl ?? "")}
            onChange={(v) => updateBlockSettings(block.id, { avatarUrl: v })}
            placeholder="Profile photo URL"
          />
        </div>
        )}
      </div>
      )}

      {/* Layout */}
      {(show("title") || show("avatar") || !selectedComponent) && (
      <div>
        <p className={SECTION_TITLE}>Layout</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div>
            <label className={LABEL_CLASS}>Section mode</label>
            <select
              value={String(block.settings.heroSectionMode ?? "standard")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroSectionMode: e.target.value as "standard" | "full-page",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="standard">Standard (compact / normal / tall)</option>
              <option value="full-page">Full page (responsive viewport)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Layout</label>
            <select
              value={String(block.settings.heroLayout ?? "centered")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroLayout: e.target.value as "centered" | "left" | "right" | "split-left" | "split-right",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="centered">Centered</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="split-left">Split (text left, avatar right)</option>
              <option value="split-right">Split (text right, avatar left)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Title size</label>
            <select
              value={String(block.settings.heroSize ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroSize: e.target.value as "compact" | "normal" | "large",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Content spacing</label>
            <select
              value={String(block.settings.heroContentSpacing ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroContentSpacing: e.target.value as "tight" | "normal" | "loose",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="loose">Loose</option>
            </select>
          </div>
          {(block.settings.heroSectionMode ?? "standard") === "full-page" && (
            <div>
              <label className={LABEL_CLASS}>Content vertical alignment</label>
              <select
                value={String(block.settings.heroContentVerticalAlign ?? "center")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    heroContentVerticalAlign: e.target.value as "top" | "center" | "bottom",
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          )}
          {(block.settings.heroSectionMode ?? "standard") === "standard" && (
            <div>
              <label className={LABEL_CLASS}>Height</label>
              <select
                value={String(block.settings.heroHeight ?? "normal")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    heroHeight: e.target.value as "compact" | "normal" | "tall",
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="tall">Tall</option>
              </select>
            </div>
          )}
          <div>
            <label className={LABEL_CLASS}>Content max width</label>
            <select
              value={String(block.settings.heroContentMaxWidth ?? "medium")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroContentMaxWidth: e.target.value as "narrow" | "medium" | "wide" | "full",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Avatar size</label>
            <select
              value={String(block.settings.avatarSize ?? "md")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  avatarSize: e.target.value as "sm" | "md" | "lg",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Avatar position</label>
            <select
              value={String(block.settings.avatarPosition ?? "top")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  avatarPosition: e.target.value as "top" | "hidden",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="top">Show</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Avatar shape / border radius</label>
            <select
              value={String(block.settings.avatarBorderRadius ?? block.settings.avatarShape ?? "full")}
              onChange={(e) => {
                const v = e.target.value as "full" | "xl" | "lg" | "md" | "none";
                updateBlockSettings(block.id, {
                  avatarBorderRadius: v,
                  avatarShape: v === "full" ? "round" : "rounded-square",
                });
              }}
              className={SELECT_CLASS}
            >
              <option value="full">Full (round)</option>
              <option value="xl">Extra large</option>
              <option value="lg">Large</option>
              <option value="md">Medium</option>
              <option value="none">Square</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Avatar border width</label>
            <select
              value={String(block.settings.avatarBorderWidth ?? "medium")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  avatarBorderWidth: e.target.value as "none" | "thin" | "medium" | "thick",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="none">None</option>
              <option value="thin">Thin</option>
              <option value="medium">Medium</option>
              <option value="thick">Thick</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Avatar border color</label>
            <select
              value={String(block.settings.avatarBorderColor ?? "accent")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  avatarBorderColor: e.target.value as "accent" | "primary" | "custom",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="accent">Accent</option>
              <option value="primary">Primary</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {block.settings.avatarBorderColor === "custom" && (
            <div>
              <label className={LABEL_CLASS}>Avatar custom color (hex)</label>
              <Input
                value={String(block.settings.avatarCustomColor ?? "#6366f1")}
                onChange={(e) => updateBlockSettings(block.id, { avatarCustomColor: e.target.value })}
                placeholder="#6366f1"
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS}>Title alignment</label>
            <select
              value={String(block.settings.titleAlign ?? "inherit")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  titleAlign: e.target.value as "inherit" | "left" | "center" | "right",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="inherit">Inherit from layout</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Subtitle alignment</label>
            <select
              value={String(block.settings.subtitleAlign ?? "inherit")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  subtitleAlign: e.target.value as "inherit" | "left" | "center" | "right",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="inherit">Inherit from layout</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Title line height</label>
            <select
              value={String(block.settings.titleLineHeight ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  titleLineHeight: e.target.value as "tight" | "normal" | "relaxed",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Subtitle line height</label>
            <select
              value={String(block.settings.subtitleLineHeight ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  subtitleLineHeight: e.target.value as "tight" | "normal" | "relaxed",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Title letter spacing</label>
            <select
              value={String(block.settings.titleLetterSpacing ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  titleLetterSpacing: e.target.value as "tight" | "normal" | "wide",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Title max width</label>
            <select
              value={String(block.settings.titleMaxWidth ?? "none")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  titleMaxWidth: e.target.value as "none" | "narrow" | "medium" | "wide",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="none">Full width</option>
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Subtitle max width</label>
            <select
              value={String(block.settings.subtitleMaxWidth ?? "medium")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  subtitleMaxWidth: e.target.value as "none" | "narrow" | "medium" | "wide",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="none">Full width</option>
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        {(block.settings.heroSectionMode ?? "standard") === "full-page" && (
          <>
            <div>
              <label className={LABEL_CLASS}>Nav bar height (for calc)</label>
              <select
                value={String(block.settings.heroNavHeight ?? "4rem")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    heroNavHeight: e.target.value as "3rem" | "4rem" | "5rem",
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="3rem">3rem</option>
                <option value="4rem">4rem</option>
                <option value="5rem">5rem</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(block.settings.heroScrollIndicator ?? false)}
                onChange={(e) => updateBlockSettings(block.id, { heroScrollIndicator: e.target.checked })}
              />
              Show scroll indicator
            </label>
          </>
        )}
        <label className="flex items-center gap-2 text-xs text-zinc-600 col-span-full">
          <input
            type="checkbox"
            checked={Boolean(block.settings.titleUseHtml ?? false)}
            onChange={(e) => updateBlockSettings(block.id, { titleUseHtml: e.target.checked })}
          />
          Title supports HTML
        </label>
        </div>
      </div>
      )}

      {/* Typography */}
      {(show("badge") || show("title") || show("subtitle") || show("cta1") || show("cta2") || !selectedComponent) && (
      <div>
        <p className={SECTION_TITLE}>Typography</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div>
            <label className={LABEL_CLASS}>Block font</label>
            <select
              value={String(block.settings.heroFontFamily ?? "inherit")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroFontFamily: e.target.value as "inherit" | "inter" | "georgia" | "playfair" | "source-sans" | "system",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="inherit">Inherit (site default)</option>
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Block font size</label>
            <select
              value={String(block.settings.heroFontSize ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroFontSize: e.target.value as "small" | "normal" | "large",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="small">Small (87.5%)</option>
              <option value="normal">Normal (100%)</option>
              <option value="large">Large (112.5%)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Block font weight</label>
            <select
              value={String(block.settings.heroFontWeight ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroFontWeight: e.target.value as "normal" | "medium" | "semibold" | "bold",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="normal">Normal (400)</option>
              <option value="medium">Medium (500)</option>
              <option value="semibold">Semibold (600)</option>
              <option value="bold">Bold (700)</option>
            </select>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-200">
          <p className="text-[10px] font-medium text-zinc-500 mb-1.5">Badge</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className={LABEL_CLASS}>Font</label>
              <select
                value={String(block.settings.badgeFontFamily ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { badgeFontFamily: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (block)</option>
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
                value={String(block.settings.badgeFontSize ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { badgeFontSize: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit</option>
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight</label>
              <select
                value={String(block.settings.badgeFontWeight ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { badgeFontWeight: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Icon</label>
              <select
                value={String(block.settings.badgeIcon ?? "none")}
                onChange={(e) => updateBlockSettings(block.id, { badgeIcon: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="none">None</option>
                <option value="star">Star</option>
                <option value="check">Check</option>
                <option value="sparkles">Sparkles</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Border radius</label>
              <select
                value={String(block.settings.badgeBorderRadius ?? "pill")}
                onChange={(e) => updateBlockSettings(block.id, { badgeBorderRadius: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="pill">Pill</option>
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-200">
          <p className="text-[10px] font-medium text-zinc-500 mb-1.5">Title</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className={LABEL_CLASS}>Font</label>
              <select
                value={String(block.settings.titleFontFamily ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { titleFontFamily: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (block)</option>
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
                value={String(block.settings.titleFontSize ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { titleFontSize: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (from layout)</option>
                <option value="2xl">2xl (2.5rem)</option>
                <option value="3xl">3xl (3rem)</option>
                <option value="4xl">4xl (3.75rem)</option>
                <option value="5xl">5xl (4.5rem)</option>
                <option value="6xl">6xl (5rem)</option>
                <option value="7xl">7xl (6rem)</option>
                <option value="8xl">8xl (7rem)</option>
                <option value="9xl">9xl (8rem)</option>
                <option value="custom">Custom (rem)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight</label>
              <select
                value={String(block.settings.titleFontWeight ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { titleFontWeight: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
          {(block.settings.titleFontSize ?? "inherit") === "custom" && (
            <div>
              <label className={LABEL_CLASS}>Custom size (rem)</label>
              <input
                type="number"
                min={1}
                max={12}
                step={0.25}
                value={String(block.settings.titleFontSizeCustom ?? "4")}
                onChange={(e) => updateBlockSettings(block.id, { titleFontSizeCustom: e.target.value })}
                placeholder="4"
                className={INPUT_CLASS}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={Boolean(block.settings.titleTextShadow ?? false)}
                onChange={(e) => updateBlockSettings(block.id, { titleTextShadow: e.target.checked })}
              />
              Text shadow (on media bg)
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={Boolean(block.settings.titleSubtitleDivider ?? false)}
                onChange={(e) => updateBlockSettings(block.id, { titleSubtitleDivider: e.target.checked })}
              />
              Divider between title & subtitle
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS}>Decorative accent</label>
            <select
              value={String(block.settings.titleDecorativeAccent ?? "none")}
              onChange={(e) => updateBlockSettings(block.id, { titleDecorativeAccent: e.target.value })}
              className={SELECT_COMPACT}
            >
              <option value="none">None</option>
              <option value="underline">Underline</option>
              <option value="accent-line">Accent line</option>
            </select>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-200">
          <p className="text-[10px] font-medium text-zinc-500 mb-1.5">Subtitle</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className={LABEL_CLASS}>Font</label>
              <select
                value={String(block.settings.subtitleFontFamily ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleFontFamily: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (block)</option>
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
                value={String(block.settings.subtitleFontSize ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleFontSize: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (1.25rem)</option>
                <option value="sm">sm (0.875rem)</option>
                <option value="base">base (1rem)</option>
                <option value="lg">lg (1.125rem)</option>
                <option value="xl">xl (1.25rem)</option>
                <option value="2xl">2xl (1.5rem)</option>
                <option value="3xl">3xl (1.875rem)</option>
                <option value="custom">Custom (rem)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight</label>
              <select
                value={String(block.settings.subtitleFontWeight ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleFontWeight: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
          {(block.settings.subtitleFontSize ?? "inherit") === "custom" && (
            <div>
              <label className={LABEL_CLASS}>Custom size (rem)</label>
              <input
                type="number"
                min={0.5}
                max={4}
                step={0.125}
                value={String(block.settings.subtitleFontSizeCustom ?? "1.25")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleFontSizeCustom: e.target.value })}
                placeholder="1.25"
                className={INPUT_CLASS}
              />
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2 pt-2">
            <div>
              <label className={LABEL_CLASS}>Line clamp</label>
              <select
                value={String(block.settings.subtitleLineClamp ?? "none")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleLineClamp: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="none">None</option>
                <option value="1">1 line</option>
                <option value="2">2 lines</option>
                <option value="3">3 lines</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Letter spacing</label>
              <select
                value={String(block.settings.subtitleLetterSpacing ?? "normal")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleLetterSpacing: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={Boolean(block.settings.subtitleTextShadow ?? false)}
                onChange={(e) => updateBlockSettings(block.id, { subtitleTextShadow: e.target.checked })}
              />
              Text shadow (on media bg)
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={Boolean(block.settings.subtitleDropCap ?? false)}
                onChange={(e) => updateBlockSettings(block.id, { subtitleDropCap: e.target.checked })}
              />
              Drop cap
            </label>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-200">
          <p className="text-[10px] font-medium text-zinc-500 mb-1.5">Primary CTA font</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Font</label>
              <select
                value={String(block.settings.ctaFontFamily ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { ctaFontFamily: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (block)</option>
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
                value={String(block.settings.ctaFontSizeTypo ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { ctaFontSizeTypo: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit (from button)</option>
                <option value="sm">sm (0.875rem)</option>
                <option value="base">base (1rem)</option>
                <option value="lg">lg (1.125rem)</option>
                <option value="xl">xl (1.25rem)</option>
                <option value="2xl">2xl (1.5rem)</option>
                <option value="3xl">3xl (1.875rem)</option>
                <option value="custom">Custom (rem)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight</label>
              <select
                value={String(block.settings.ctaFontWeight ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { ctaFontWeight: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="inherit">Inherit</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
          {(block.settings.ctaFontSizeTypo ?? "inherit") === "custom" && (
            <div>
              <label className={LABEL_CLASS}>Custom size (rem)</label>
              <input
                type="number"
                min={0.5}
                max={3}
                step={0.125}
                value={String(block.settings.ctaFontSizeTypoCustom ?? "1")}
                onChange={(e) => updateBlockSettings(block.id, { ctaFontSizeTypoCustom: e.target.value })}
                placeholder="1"
                className={INPUT_CLASS}
              />
            </div>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-200">
          <p className="text-[10px] font-medium text-zinc-500 mb-1.5">Secondary CTA font</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Font</label>
              <select
                value={String(block.settings.cta2FontFamily ?? "same")}
                onChange={(e) => updateBlockSettings(block.id, { cta2FontFamily: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="same">Same as primary</option>
                <option value="inherit">Inherit (block)</option>
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
                value={String(block.settings.cta2FontSizeTypo ?? "same")}
                onChange={(e) => updateBlockSettings(block.id, { cta2FontSizeTypo: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="same">Same as primary</option>
                <option value="inherit">Inherit (from button)</option>
                <option value="sm">sm (0.875rem)</option>
                <option value="base">base (1rem)</option>
                <option value="lg">lg (1.125rem)</option>
                <option value="xl">xl (1.25rem)</option>
                <option value="2xl">2xl (1.5rem)</option>
                <option value="3xl">3xl (1.875rem)</option>
                <option value="custom">Custom (rem)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight</label>
              <select
                value={String(block.settings.cta2FontWeight ?? "same")}
                onChange={(e) => updateBlockSettings(block.id, { cta2FontWeight: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="same">Same as primary</option>
                <option value="inherit">Inherit</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
          {(block.settings.cta2FontSizeTypo ?? "same") === "custom" && (
            <div>
              <label className={LABEL_CLASS}>Custom size (rem)</label>
              <input
                type="number"
                min={0.5}
                max={3}
                step={0.125}
                value={String(block.settings.cta2FontSizeTypoCustom ?? "1")}
                onChange={(e) => updateBlockSettings(block.id, { cta2FontSizeTypoCustom: e.target.value })}
                placeholder="1"
                className={INPUT_CLASS}
              />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Buttons */}
      {(show("badge") || show("cta1") || show("cta2") || !selectedComponent) && (
      <div>
        <p className={SECTION_TITLE}>Buttons</p>
        {Boolean(block.settings.badgeVisible ?? true) && (show("badge") || !selectedComponent) && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={LABEL_CLASS}>Badge color</label>
                <select
                  value={String(block.settings.badgeColor ?? "accent")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      badgeColor: e.target.value as "accent" | "primary" | "neutral" | "custom",
                    })
                  }
                  className={SELECT_COMPACT}
                >
                  <option value="accent">Accent</option>
                  <option value="primary">Primary</option>
                  <option value="neutral">Neutral</option>
                  <option value="custom">Custom</option>
                </select>
                <ContrastWarning
                  color={
                    (block.settings.badgeColor ?? "accent") === "custom"
                      ? String(block.settings.badgeCustomColor ?? theme.accent)
                      : (block.settings.badgeColor ?? "accent") === "primary"
                        ? theme.primary
                        : (block.settings.badgeColor ?? "accent") === "neutral"
                          ? "#71717a"
                          : theme.accent
                  }
                  onWhite
                />
              </div>
              {(block.settings.badgeColor ?? "accent") === "custom" && (
              <div className="flex gap-2 items-center">
                <div className={COLOR_INPUT_WRAPPER}>
                  <input
                    type="color"
                    value={String(block.settings.badgeCustomColor ?? "#6366f1").slice(0, 7)}
                    onChange={(e) => updateBlockSettings(block.id, { badgeCustomColor: e.target.value })}
                    className={COLOR_INPUT_INNER}
                  />
                </div>
                <Input
                  value={String(block.settings.badgeCustomColor ?? "#6366f1")}
                  onChange={(e) => updateBlockSettings(block.id, { badgeCustomColor: e.target.value })}
                  placeholder="#6366f1"
                  className="h-9 w-32"
                />
              </div>
            )}
              <div>
                <label className={LABEL_CLASS}>Badge size</label>
                <select
                  value={String(block.settings.badgeSize ?? "md")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      badgeSize: e.target.value as "sm" | "md" | "lg",
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
        )}
        {(show("cta1") || show("cta2") || !selectedComponent) && (
        <>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className={LABEL_CLASS}>Position</label>
            <select
              value={String(block.settings.ctaPosition ?? "left")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  ctaPosition: e.target.value as "left" | "center" | "right",
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
            <label className={LABEL_CLASS}>Vertical</label>
            <select
              value={String(block.settings.ctaPositionVertical ?? "below-subtitle")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  ctaPositionVertical: e.target.value as "below-subtitle" | "below-title",
                })
              }
              className={SELECT_COMPACT}
            >
              <option value="below-subtitle">Below subtitle</option>
              <option value="below-title">Between title and subtitle</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Layout</label>
            <select
              value={String(block.settings.ctaLayout ?? "horizontal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  ctaLayout: e.target.value as "horizontal" | "vertical",
                })
              }
              className={SELECT_COMPACT}
            >
              <option value="horizontal">Horizontal (side by side)</option>
              <option value="vertical">Vertical (stacked)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Spacing</label>
            <select
              value={String(block.settings.ctaSpacing ?? "normal")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  ctaSpacing: e.target.value as "tight" | "normal" | "loose",
                })
              }
              className={SELECT_COMPACT}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="loose">Loose</option>
            </select>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={Boolean(block.settings.ctaFullWidthMobile ?? false)}
              onChange={(e) => updateBlockSettings(block.id, { ctaFullWidthMobile: e.target.checked })}
            />
            Full width mobile
          </label>
          <label className="flex items-center gap-1.5 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={Boolean(block.settings.ctaOpenNewTab ?? false)}
              onChange={(e) => updateBlockSettings(block.id, { ctaOpenNewTab: e.target.checked })}
            />
            Primary: new tab
          </label>
          <label className="flex items-center gap-1.5 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={
                block.settings.cta2OpenNewTab === "same" || block.settings.cta2OpenNewTab === undefined
                  ? Boolean(block.settings.ctaOpenNewTab ?? false)
                  : Boolean(block.settings.cta2OpenNewTab)
              }
              onChange={(e) =>
                updateBlockSettings(block.id, { cta2OpenNewTab: e.target.checked ? true : "same" })
              }
            />
            Secondary: new tab
          </label>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>Primary icon</label>
            <select
              value={String(block.settings.ctaIcon ?? "none")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  ctaIcon: e.target.value as "none" | "arrow" | "arrow-right" | "external",
                })
              }
              className={`${SELECT_CLASS} w-24`}
            >
              <option value="none">None</option>
              <option value="arrow">Arrow</option>
              <option value="arrow-right">Arrow right</option>
              <option value="external">External</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Secondary icon</label>
            <select
              value={String(block.settings.cta2Icon ?? "same")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  cta2Icon: e.target.value as "same" | "none" | "arrow" | "arrow-right" | "external",
                })
              }
              className={`${SELECT_CLASS} w-24`}
            >
              <option value="same">Same</option>
              <option value="none">None</option>
              <option value="arrow">Arrow</option>
              <option value="arrow-right">Arrow right</option>
              <option value="external">External</option>
            </select>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {(show("cta1") || !selectedComponent) && (
          <div>
            <label className={LABEL_CLASS}>Primary CTA</label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Input
                value={String(block.settings.ctaText ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { ctaText: e.target.value })}
                placeholder="Button text"
                className="h-9 w-32"
              />
              <Input
                value={String(block.settings.ctaHref ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { ctaHref: e.target.value })}
                placeholder="#"
                className="h-9 w-28"
              />
              <select
                value={String(block.settings.ctaStyle ?? "primary")}
                onChange={(e) => updateBlockSettings(block.id, { ctaStyle: e.target.value })}
                className={`${SELECT_CLASS} w-24`}
              >
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <InlineExpand label="More options (color, borders, size)">
                <CtaSection
                  label=""
                  textKey="ctaText"
                  hrefKey="ctaHref"
                  colorKey="ctaColor"
                  customColorKey="ctaCustomColor"
                  styleKey="ctaStyle"
                  textColorKey="ctaTextColor"
                  textCustomColorKey="ctaTextCustomColor"
                  borderWidthKey="ctaBorderWidth"
                  borderRadiusKey="ctaBorderRadius"
                  borderColorKey="ctaBorderColor"
                  borderCustomColorKey="ctaBorderCustomColor"
                  sizeKey="ctaSize"
                  fontSizeKey="ctaFontSize"
                  hideTextLink
                />
              </InlineExpand>
          </div>
          )}
          {(show("cta2") || !selectedComponent) && (hasSecondaryCta ? (
            <div>
              <label className={LABEL_CLASS}>Secondary CTA</label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Input
                  value={String(block.settings.cta2Text ?? "")}
                  onChange={(e) => updateBlockSettings(block.id, { cta2Text: e.target.value })}
                  placeholder="Button text"
                  className="h-9 w-32"
                />
                <Input
                  value={String(block.settings.cta2Href ?? "")}
                  onChange={(e) => updateBlockSettings(block.id, { cta2Href: e.target.value })}
                  placeholder="#"
                  className="h-9 w-28"
                />
                <select
                  value={String(block.settings.cta2Style ?? "same")}
                  onChange={(e) => updateBlockSettings(block.id, { cta2Style: e.target.value })}
                  className={`${SELECT_CLASS} w-24`}
                >
                  <option value="same">Same</option>
                  <option value="primary">Primary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => updateBlockSettings(block.id, { cta2Text: "", cta2Href: "#" })}
                  className="h-9 px-2 text-xs"
                >
                  Remove
                </Button>
              </div>
              <InlineExpand label="More options (color, borders, size)">
                  <CtaSection
                    label=""
                    textKey="cta2Text"
                    hrefKey="cta2Href"
                    colorKey="cta2Color"
                    customColorKey="cta2CustomColor"
                    styleKey="cta2Style"
                    textColorKey="cta2TextColor"
                    textCustomColorKey="cta2TextCustomColor"
                    borderWidthKey="cta2BorderWidth"
                    borderRadiusKey="cta2BorderRadius"
                    borderColorKey="cta2BorderColor"
                    borderCustomColorKey="cta2BorderCustomColor"
                    sizeKey="cta2Size"
                    fontSizeKey="cta2FontSize"
                    sameOption
                    hideTextLink
                  />
                </InlineExpand>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => updateBlockSettings(block.id, { cta2Text: "Learn more", cta2Href: "#" })}
              className="text-xs text-zinc-500 hover:text-zinc-700 underline"
            >
              + Add secondary CTA
            </button>
          ))}
        </div>
        </>
        )}
      </div>
      )}

      {/* Background */}
      {!selectedComponent && (
      <div>
        <p className={SECTION_TITLE}>Background</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={LABEL_CLASS}>Background type</label>
            <select
            value={String(block.settings.heroBackgroundType ?? "carousel")}
            onChange={(e) =>
              updateBlockSettings(block.id, {
                heroBackgroundType: e.target.value as "carousel" | "video" | "none",
              })
            }
            className={SELECT_CLASS}
          >
            <option value="none">None</option>
            <option value="carousel">Image carousel</option>
            <option value="video">Video</option>
          </select>
          </div>
          {(block.settings.heroBackgroundType ?? "carousel") === "video" && (
            <>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={LABEL_CLASS}>Video URL</label>
                <Input
                value={String(block.settings.heroVideoUrl ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { heroVideoUrl: e.target.value })}
                placeholder="https://example.com/video.mp4"
                className="h-9"
              />
              </div>
              <div>
                <label className={LABEL_CLASS}>Video overlay</label>
              <select
                value={String(block.settings.heroVideoOverlayType ?? "solid")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    heroVideoOverlayType: e.target.value as "none" | "solid" | "gradient",
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            {(block.settings.heroVideoOverlayType ?? "solid") !== "none" && (
              <div>
                <label className={LABEL_CLASS}>Overlay opacity (0–100%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.min(100, Math.max(0, Number(block.settings.heroVideoOverlayOpacity ?? 55)))}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      heroVideoOverlayOpacity: Number(e.target.value),
                    })
                  }
                  className="w-full max-w-[180px]"
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(block.settings.heroVideoAutoplay ?? true)}
                onChange={(e) => updateBlockSettings(block.id, { heroVideoAutoplay: e.target.checked })}
              />
              Video autoplay
            </label>
            </>
          )}
          <div>
            <label className={LABEL_CLASS}>Scroll animation</label>
            <select
            value={String(block.settings.heroScrollAnimation ?? "none")}
            onChange={(e) =>
              updateBlockSettings(block.id, {
                heroScrollAnimation: e.target.value as "none" | "fade" | "slide-up",
              })
            }
            className={SELECT_CLASS}
          >
            <option value="none">None</option>
            <option value="fade">Fade</option>
            <option value="slide-up">Slide up</option>
          </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={Boolean(block.settings.heroParallax ?? false)}
              onChange={(e) => updateBlockSettings(block.id, { heroParallax: e.target.checked })}
            />
            Parallax
          </label>
          {(block.settings.heroScrollAnimation ?? "none") !== "none" && (
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={Boolean(block.settings.heroScrollAnimationStagger ?? false)}
                onChange={(e) =>
                  updateBlockSettings(block.id, { heroScrollAnimationStagger: e.target.checked })
                }
              />
              Staggered animation
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={Boolean(block.settings.carouselEnabled)}
              onChange={(e) => updateBlockSettings(block.id, { carouselEnabled: e.target.checked })}
            />
            Enable carousel
          </label>
        </div>
        {Boolean(block.settings.carouselEnabled) && (
          <div className="mt-2 rounded-lg border border-zinc-200 p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={LABEL_CLASS}>Overlay type</label>
                <select
                  value={String(block.settings.carouselOverlayType ?? "solid")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselOverlayType: e.target.value as "solid" | "gradient",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="solid">Solid</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Overlay opacity (30–70%)</label>
                <input
                  type="range"
                  min={30}
                  max={70}
                  value={Math.min(70, Math.max(30, Number(block.settings.carouselOverlayOpacity ?? 55)))}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselOverlayOpacity: Number(e.target.value),
                    })
                  }
                  className="w-full max-w-[160px]"
                />
                <span className="text-xs text-zinc-500">
                  {Math.min(70, Math.max(30, Number(block.settings.carouselOverlayOpacity ?? 55)))}%
                </span>
              </div>
              <div>
                <label className={LABEL_CLASS}>Auto-advance</label>
              <select
                value={String(block.settings.carouselDuration ?? 5)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    carouselDuration: Number(e.target.value),
                  })
                }
                className={SELECT_CLASS}
              >
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={7}>7s</option>
                <option value={10}>10s</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Transition type</label>
              <select
                value={String(block.settings.carouselTransitionType ?? "fade")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    carouselTransitionType: e.target.value as "fade" | "slide" | "zoom" | "instant",
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="fade">Fade (opacity crossfade)</option>
                <option value="slide">Slide (horizontal)</option>
                <option value="zoom">Zoom (scale + fade)</option>
                <option value="instant">Instant (no animation)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Transition duration</label>
              <select
                value={String(block.settings.carouselTransitionDuration ?? 700)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    carouselTransitionDuration: Number(e.target.value),
                  })
                }
                className={SELECT_CLASS}
              >
                <option value={300}>300ms (fast)</option>
                <option value={500}>500ms</option>
                <option value={700}>700ms</option>
                <option value={1000}>1000ms (slow)</option>
              </select>
            </div>
              <div className="flex flex-wrap gap-4 sm:col-span-2 lg:col-span-4">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={Boolean(block.settings.carouselShowDots ?? true)}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { carouselShowDots: e.target.checked })
                    }
                  />
                  Show dots
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={Boolean(block.settings.carouselShowArrows ?? true)}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { carouselShowArrows: e.target.checked })
                    }
                  />
                  Show arrows
                </label>
              </div>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS}>Arrow color</label>
                <select
                  value={String(block.settings.carouselArrowsColor ?? "white")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselArrowsColor: e.target.value as "white" | "light" | "accent" | "custom",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="white">White</option>
                  <option value="light">Light (70%)</option>
                  <option value="accent">Accent</option>
                  <option value="custom">Custom</option>
                </select>
                {(block.settings.carouselArrowsColor ?? "white") === "custom" && (
                  <div className="mt-2 flex gap-2 items-center">
                    <div className={COLOR_INPUT_WRAPPER}>
                      <input
                        type="color"
                        value={String(block.settings.carouselArrowsCustomColor ?? "#ffffff").slice(0, 7)}
                        onChange={(e) =>
                          updateBlockSettings(block.id, { carouselArrowsCustomColor: e.target.value })
                        }
                        className={COLOR_INPUT_INNER}
                      />
                    </div>
                    <input
                      type="text"
                      value={String(block.settings.carouselArrowsCustomColor ?? "#ffffff")}
                      onChange={(e) =>
                        updateBlockSettings(block.id, { carouselArrowsCustomColor: e.target.value })
                      }
                      placeholder="#ffffff"
                      className="h-9 flex-1 rounded-lg border border-zinc-300 px-3 text-sm"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className={LABEL_CLASS}>Dots color</label>
                <select
                  value={String(block.settings.carouselDotsColor ?? "same")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselDotsColor: e.target.value as "same" | "white" | "light" | "accent" | "custom",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="same">Same as arrows</option>
                  <option value="white">White</option>
                  <option value="light">Light (70%)</option>
                  <option value="accent">Accent</option>
                  <option value="custom">Custom</option>
                </select>
                {(block.settings.carouselDotsColor ?? "same") === "custom" && (
                  <div className="mt-2 flex gap-2 items-center">
                    <div className={COLOR_INPUT_WRAPPER}>
                      <input
                        type="color"
                        value={String(block.settings.carouselDotsCustomColor ?? "#ffffff").slice(0, 7)}
                        onChange={(e) =>
                          updateBlockSettings(block.id, { carouselDotsCustomColor: e.target.value })
                        }
                        className={COLOR_INPUT_INNER}
                      />
                    </div>
                    <input
                      type="text"
                      value={String(block.settings.carouselDotsCustomColor ?? "#ffffff")}
                      onChange={(e) =>
                        updateBlockSettings(block.id, { carouselDotsCustomColor: e.target.value })
                      }
                      placeholder="#ffffff"
                      className="h-9 flex-1 rounded-lg border border-zinc-300 px-3 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={LABEL_CLASS}>Arrow icon</label>
                <select
                  value={String(block.settings.carouselArrowIcon ?? "chevron")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselArrowIcon: e.target.value as "chevron" | "arrow" | "arrow-circle" | "caret",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="chevron">Chevron</option>
                  <option value="arrow">Arrow</option>
                  <option value="arrow-circle">Arrow in circle</option>
                  <option value="caret">Caret</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Arrow size</label>
                <select
                  value={String(block.settings.carouselArrowSize ?? "md")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselArrowSize: e.target.value as "sm" | "md" | "lg",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Dots size</label>
                <select
                  value={String(block.settings.carouselDotsSize ?? "md")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      carouselDotsSize: e.target.value as "sm" | "md" | "lg",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Carousel images</label>
              <ImageField
                value={newCarouselImage}
                onChange={setNewCarouselImage}
                onAdd={() => {
                  addToStringList(block.id, "carouselImages", newCarouselImage);
                  setNewCarouselImage("");
                }}
                placeholder="Paste image URL or upload"
              />
              <div className="space-y-2 mt-2">
                {carouselImages.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2"
                  >
                    <p className="truncate text-xs text-zinc-600">{url}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeFromStringList(block.id, "carouselImages", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Borders */}
      {!selectedComponent && (
      <div>
        <p className={SECTION_TITLE}>Borders</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={LABEL_CLASS}>Hero section border</label>
            <select
              value={String(block.settings.heroSectionBorder ?? "none")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  heroSectionBorder: e.target.value as "none" | "thin" | "medium" | "thick",
                })
              }
              className={SELECT_CLASS}
            >
              <option value="none">None</option>
              <option value="thin">Thin</option>
              <option value="medium">Medium</option>
              <option value="thick">Thick</option>
            </select>
          </div>
          {block.settings.heroSectionBorder !== "none" && (
            <>
              <div>
                <label className={LABEL_CLASS}>Section border color</label>
                <select
                  value={String(block.settings.heroSectionBorderColor ?? "neutral")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      heroSectionBorderColor: e.target.value as "accent" | "primary" | "neutral" | "custom",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="accent">Accent</option>
                  <option value="primary">Primary</option>
                  <option value="neutral">Neutral</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {block.settings.heroSectionBorderColor === "custom" && (
                <div className="flex items-center gap-3">
                  <div className={COLOR_INPUT_WRAPPER}>
                    <input
                      type="color"
                      value={
                        new RegExp("^#[0-9A-Fa-f]{6}$").test(
                          String(block.settings.heroSectionBorderCustomColor ?? "")
                        )
                          ? String(block.settings.heroSectionBorderCustomColor)
                          : "#e4e4e7"
                      }
                      onChange={(e) =>
                        updateBlockSettings(block.id, { heroSectionBorderCustomColor: e.target.value })
                      }
                      className={COLOR_INPUT_INNER}
                    />
                  </div>
                  <Input
                    value={String(block.settings.heroSectionBorderCustomColor ?? "#e4e4e7")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { heroSectionBorderCustomColor: e.target.value })
                    }
                    placeholder="#e4e4e7"
                    className="h-9 flex-1 font-mono text-sm"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
