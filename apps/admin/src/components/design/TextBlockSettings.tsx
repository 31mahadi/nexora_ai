"use client";

import { Input } from "@nexora/ui";
import dynamic from "next/dynamic";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { hasLowContrast } from "@nexora/portfolio-builder";
import type { BuilderBlock } from "@nexora/portfolio-builder";

function ContrastWarning({ color, onWhite = true }: { color: string; onWhite?: boolean }) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(color.trim()) ? color : "#000000";
  const fg = onWhite ? hex : "#ffffff";
  const bg = onWhite ? "#ffffff" : hex;
  if (!hasLowContrast(fg, bg)) return null;
  return (
    <span
      title="Low contrast — may affect readability"
      className="inline-flex text-amber-600"
    >
      <AlertTriangle className="h-4 w-4" />
    </span>
  );
}

const RichTextEditor = dynamic(
  () => import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-24 animate-pulse rounded-lg bg-zinc-200" /> },
);

const LABEL_CLASS = "text-[11px] font-medium text-zinc-600 mb-1 block";
const SECTION_TITLE = "text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2";
const SELECT_COMPACT =
  "h-9 w-full max-w-[180px] rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 box-border";
const COLOR_INPUT_WRAPPER = "h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex";

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

function TypoRow({
  label,
  fontFamilyKey,
  fontSizeKey,
  fontWeightKey,
  colorKey,
  customColorKey,
  lineHeightKey,
  letterSpacingKey,
  block,
  updateBlockSettings,
  theme,
  FONT_OPTIONS,
  fontSizeOpts,
  showLineHeight = true,
  showLetterSpacing = true,
}: {
  label: string;
  fontFamilyKey: string;
  fontSizeKey: string;
  fontWeightKey: string;
  colorKey: string;
  customColorKey: string;
  lineHeightKey?: string;
  letterSpacingKey?: string;
  block: BuilderBlock;
  updateBlockSettings: (id: string, patch: Record<string, unknown>) => void;
  theme: { primary: string; accent: string };
  FONT_OPTIONS: { value: string; label: string }[];
  fontSizeOpts: { value: string; label: string }[];
  showLineHeight?: boolean;
  showLetterSpacing?: boolean;
}) {
  const colorVal = String(block.settings[colorKey] ?? "inherit");
  return (
    <div className="space-y-2">
      {label && <p className="text-[10px] font-medium text-zinc-500">{label}</p>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={LABEL_CLASS}>Font</label>
          <select
            value={String(block.settings[fontFamilyKey] ?? "inherit")}
            onChange={(e) => updateBlockSettings(block.id, { [fontFamilyKey]: e.target.value })}
            className={SELECT_COMPACT}
          >
            <option value="inherit">Inherit</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Size</label>
          <select
            value={String(block.settings[fontSizeKey] ?? "inherit")}
            onChange={(e) => updateBlockSettings(block.id, { [fontSizeKey]: e.target.value })}
            className={SELECT_COMPACT}
          >
            <option value="inherit">Inherit</option>
            {fontSizeOpts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {(block.settings[fontSizeKey] ?? "inherit") === "custom" && (
          <div>
            <label className={LABEL_CLASS}>Custom (rem)</label>
            <input
              type="number"
              min={0.5}
              max={8}
              step={0.25}
              value={String(block.settings[`${fontSizeKey.replace("FontSize", "FontSizeCustom")}` as keyof typeof block.settings] ?? "1")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  [`${fontSizeKey.replace("FontSize", "FontSizeCustom")}`]: e.target.value,
                })
              }
              className={SELECT_COMPACT}
            />
          </div>
        )}
        <div>
          <label className={LABEL_CLASS}>Weight</label>
          <select
            value={String(block.settings[fontWeightKey] ?? "inherit")}
            onChange={(e) => updateBlockSettings(block.id, { [fontWeightKey]: e.target.value })}
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
          <label className={LABEL_CLASS}>Color</label>
          <select
            value={colorVal}
            onChange={(e) => updateBlockSettings(block.id, { [colorKey]: e.target.value })}
            className={SELECT_COMPACT}
          >
            <option value="inherit">Inherit</option>
            <option value="primary">Primary</option>
            <option value="accent">Accent</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {showLineHeight && lineHeightKey && (
          <div>
            <label className={LABEL_CLASS}>Line height</label>
            <select
              value={String(block.settings[lineHeightKey] ?? "normal")}
              onChange={(e) => updateBlockSettings(block.id, { [lineHeightKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
        )}
        {showLetterSpacing && letterSpacingKey && (
          <div>
            <label className={LABEL_CLASS}>Letter spacing</label>
            <select
              value={String(block.settings[letterSpacingKey] ?? "normal")}
              onChange={(e) => updateBlockSettings(block.id, { [letterSpacingKey]: e.target.value })}
              className={SELECT_COMPACT}
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        )}
      </div>
      {colorVal === "custom" && (
        <div className="flex items-center gap-2">
          <div className={COLOR_INPUT_WRAPPER}>
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings[customColorKey] ?? "")) ? String(block.settings[customColorKey]) : theme.accent}
              onChange={(e) => updateBlockSettings(block.id, { [customColorKey]: e.target.value })}
              className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
            />
          </div>
          <Input
            value={String(block.settings[customColorKey] ?? theme.accent)}
            onChange={(e) => updateBlockSettings(block.id, { [customColorKey]: e.target.value })}
            placeholder="#6366f1"
            className="h-9 flex-1 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}

export type TextComponentType = "title" | "subtitle" | "body";

export interface TextBlockSettingsProps {
  block: BuilderBlock;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme: { primary: string; accent: string };
  FONT_OPTIONS: { value: string; label: string }[];
  selectedComponent?: TextComponentType | null;
  onClearSelection?: () => void;
}

const TITLE_SIZE_OPTS = [
  { value: "2xl", label: "2xl" },
  { value: "3xl", label: "3xl" },
  { value: "4xl", label: "4xl" },
  { value: "5xl", label: "5xl" },
  { value: "custom", label: "Custom" },
];
const SUBTITLE_SIZE_OPTS = [
  { value: "sm", label: "sm" },
  { value: "base", label: "base" },
  { value: "lg", label: "lg" },
  { value: "xl", label: "xl" },
  { value: "custom", label: "Custom" },
];
const BODY_SIZE_OPTS = [
  { value: "sm", label: "sm" },
  { value: "base", label: "base" },
  { value: "lg", label: "lg" },
  { value: "custom", label: "Custom" },
];

const COMPONENT_LABELS: Record<TextComponentType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  body: "Body",
};

export function TextBlockSettings({
  block,
  updateBlockSettings,
  theme,
  FONT_OPTIONS,
  selectedComponent = null,
  onClearSelection,
}: TextBlockSettingsProps) {
  const show = (...components: TextComponentType[]) =>
    !selectedComponent || components.includes(selectedComponent);

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

      {/* Content */}
      <div>
        <p className={SECTION_TITLE}>Content</p>
        <div className="space-y-3">
          {show("title") && (
            <div>
              <label className={LABEL_CLASS}>Title</label>
              <Input
                value={String(block.settings.title ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
                placeholder="Section title"
              />
              <InlineExpand label="Title options" defaultOpen={!!selectedComponent && selectedComponent === "title"}>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs text-zinc-600">
                    <input
                      type="checkbox"
                      checked={Boolean(block.settings.titleUseHtml ?? false)}
                      onChange={(e) => updateBlockSettings(block.id, { titleUseHtml: e.target.checked })}
                    />
                    Allow HTML
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">Heading:</span>
                    <select
                      value={String(block.settings.titleHeadingLevel ?? "h2")}
                      onChange={(e) => updateBlockSettings(block.id, { titleHeadingLevel: e.target.value })}
                      className="h-8 rounded border border-zinc-300 px-2 text-xs"
                    >
                      <option value="h1">H1</option>
                      <option value="h2">H2</option>
                      <option value="h3">H3</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">Transform:</span>
                    <select
                      value={String(block.settings.titleTextTransform ?? "none")}
                      onChange={(e) => updateBlockSettings(block.id, { titleTextTransform: e.target.value })}
                      className="h-8 rounded border border-zinc-300 px-2 text-xs"
                    >
                      <option value="none">None</option>
                      <option value="uppercase">Uppercase</option>
                      <option value="lowercase">Lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                  </div>
                </div>
              </InlineExpand>
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
              <InlineExpand label="Subtitle options" defaultOpen={!!selectedComponent && selectedComponent === "subtitle"}>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-600">
                    <input
                      type="checkbox"
                      checked={Boolean(block.settings.subtitleUseHtml ?? false)}
                      onChange={(e) => updateBlockSettings(block.id, { subtitleUseHtml: e.target.checked })}
                    />
                    Allow HTML
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-600">
                    <input
                      type="checkbox"
                      checked={Boolean(block.settings.subtitleVisible ?? true)}
                      onChange={(e) => updateBlockSettings(block.id, { subtitleVisible: e.target.checked })}
                    />
                    Show subtitle
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">Position:</span>
                    <select
                      value={String(block.settings.subtitlePosition ?? "below")}
                      onChange={(e) => updateBlockSettings(block.id, { subtitlePosition: e.target.value })}
                      className="h-8 rounded border border-zinc-300 px-2 text-xs"
                    >
                      <option value="below">Below title</option>
                      <option value="above">Above title</option>
                    </select>
                  </div>
                </div>
              </InlineExpand>
            </div>
          )}

          <InlineExpand label="Title–subtitle divider">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={LABEL_CLASS}>Show</label>
                <select
                  value={String(block.settings.titleSubtitleDivider ?? "none")}
                  onChange={(e) => updateBlockSettings(block.id, { titleSubtitleDivider: e.target.value })}
                  className={SELECT_COMPACT}
                >
                  <option value="none">None</option>
                  <option value="line">Line</option>
                  <option value="dot">Dot</option>
                </select>
              </div>
              {(block.settings.titleSubtitleDivider ?? "none") === "line" && (
                <>
                  <div>
                    <label className={LABEL_CLASS}>Style</label>
                    <select
                      value={String(block.settings.titleSubtitleDividerStyle ?? "line")}
                      onChange={(e) => updateBlockSettings(block.id, { titleSubtitleDividerStyle: e.target.value })}
                      className={SELECT_COMPACT}
                    >
                      <option value="line">Solid</option>
                      <option value="dotted">Dotted</option>
                      <option value="dashed">Dashed</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Width</label>
                    <select
                      value={String(block.settings.titleSubtitleDividerWidth ?? "short")}
                      onChange={(e) => updateBlockSettings(block.id, { titleSubtitleDividerWidth: e.target.value })}
                      className={SELECT_COMPACT}
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </>
              )}
              {(block.settings.titleSubtitleDivider ?? "none") !== "none" && (
                <div>
                  <label className={LABEL_CLASS}>Color</label>
                  <select
                    value={String(block.settings.titleSubtitleDividerColor ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { titleSubtitleDividerColor: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="primary">Primary</option>
                    <option value="accent">Accent</option>
                  </select>
                </div>
              )}
            </div>
          </InlineExpand>

          {show("body") && (
            <div>
              <label className={LABEL_CLASS}>Body</label>
              <RichTextEditor
                value={String(block.settings.body ?? "")}
                onChange={(html) => updateBlockSettings(block.id, { body: html })}
                placeholder="Write your content..."
              />
            </div>
          )}

          <InlineExpand label="CTA button (optional)">
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={String(block.settings.ctaText ?? "")}
                  onChange={(e) => updateBlockSettings(block.id, { ctaText: e.target.value })}
                  placeholder="Button text"
                />
                <Input
                  value={String(block.settings.ctaHref ?? "")}
                  onChange={(e) => updateBlockSettings(block.id, { ctaHref: e.target.value })}
                  placeholder="#contact"
                />
              </div>
              <div>
                <p className={LABEL_CLASS}>Color</p>
                <div className="flex flex-wrap gap-2">
                  {(["accent", "primary", "custom"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateBlockSettings(block.id, { ctaColor: opt })}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        (block.settings.ctaColor ?? "accent") === opt
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      {opt === "accent" ? "Theme accent" : opt === "primary" ? "Theme primary" : "Custom"}
                    </button>
                  ))}
                </div>
                {(block.settings.ctaColor ?? "accent") === "custom" && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={COLOR_INPUT_WRAPPER}>
                      <input
                        type="color"
                        value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.ctaCustomColor ?? "")) ? String(block.settings.ctaCustomColor) : theme.accent}
                        onChange={(e) => updateBlockSettings(block.id, { ctaCustomColor: e.target.value })}
                        className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                      />
                    </div>
                    <Input
                      value={String(block.settings.ctaCustomColor ?? theme.accent)}
                      onChange={(e) => updateBlockSettings(block.id, { ctaCustomColor: e.target.value })}
                      placeholder="#6366f1"
                      className="h-9 flex-1 font-mono text-sm"
                    />
                    <ContrastWarning color={String(block.settings.ctaCustomColor ?? theme.accent)} onWhite={false} />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-zinc-600">Appearance</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={LABEL_CLASS}>Style</label>
                  <select
                    value={String(block.settings.ctaStyle ?? "primary")}
                    onChange={(e) => updateBlockSettings(block.id, { ctaStyle: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Text color</label>
                  <select
                    value={String(block.settings.ctaTextColor ?? "auto")}
                    onChange={(e) => updateBlockSettings(block.id, { ctaTextColor: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="auto">Auto (contrast)</option>
                    <option value="white">White</option>
                    <option value="primary">Primary</option>
                    <option value="custom">Custom</option>
                  </select>
                  {(block.settings.ctaTextColor ?? "auto") === "custom" && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className={COLOR_INPUT_WRAPPER}>
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.ctaTextCustomColor ?? "")) ? String(block.settings.ctaTextCustomColor) : "#ffffff"}
                          onChange={(e) => updateBlockSettings(block.id, { ctaTextCustomColor: e.target.value })}
                          className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                        />
                      </div>
                      <Input
                        value={String(block.settings.ctaTextCustomColor ?? "#ffffff")}
                        onChange={(e) => updateBlockSettings(block.id, { ctaTextCustomColor: e.target.value })}
                        placeholder="#ffffff"
                        className="h-9 flex-1 font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Border width</label>
                  <select
                    value={String(block.settings.ctaBorderWidth ?? "medium")}
                    onChange={(e) => updateBlockSettings(block.id, { ctaBorderWidth: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="none">None</option>
                    <option value="thin">Thin</option>
                    <option value="medium">Medium</option>
                    <option value="thick">Thick</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Border radius</label>
                  <select
                    value={String(block.settings.ctaBorderRadius ?? "md")}
                    onChange={(e) => updateBlockSettings(block.id, { ctaBorderRadius: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="none">Square</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="full">Full (pill)</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Size</label>
                  <select
                    value={String(block.settings.ctaSize ?? "normal")}
                    onChange={(e) => updateBlockSettings(block.id, { ctaSize: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Font size</label>
                  <select
                    value={String(block.settings.ctaFontSize ?? "md")}
                    onChange={(e) => updateBlockSettings(block.id, { ctaFontSize: e.target.value })}
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
      </div>

      {/* Layout */}
      <div>
        <p className={SECTION_TITLE}>Layout</p>
        <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Alignment</label>
              <select
                value={String(block.settings.textLayout ?? "left")}
                onChange={(e) => updateBlockSettings(block.id, { textLayout: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Columns</label>
              <select
                value={String(block.settings.textLayoutColumns ?? "single")}
                onChange={(e) => updateBlockSettings(block.id, { textLayoutColumns: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="single">Single</option>
                <option value="two">Two columns</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Content max width</label>
              <select
                value={String(block.settings.textContentMaxWidth ?? "medium")}
                onChange={(e) => updateBlockSettings(block.id, { textContentMaxWidth: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="narrow">Narrow</option>
                <option value="medium">Medium</option>
                <option value="wide">Wide</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Card style</label>
              <select
                value={String(block.settings.textCardStyle ?? "bordered")}
                onChange={(e) => updateBlockSettings(block.id, { textCardStyle: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="bordered">Bordered</option>
                <option value="elevated">Elevated</option>
                <option value="filled">Filled</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Content padding</label>
              <select
                value={String(block.settings.textContentPadding ?? "md")}
                onChange={(e) => updateBlockSettings(block.id, { textContentPadding: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="sm">Compact</option>
                <option value="md">Default</option>
                <option value="lg">Spacious</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Title alignment</label>
              <select
                value={String(block.settings.titleAlign ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { titleAlign: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="inherit">Inherit</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Subtitle alignment</label>
              <select
                value={String(block.settings.subtitleAlign ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { subtitleAlign: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="inherit">Inherit</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS}>Section ID (anchor)</label>
              <Input
                value={String(block.settings.sectionId ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { sectionId: e.target.value })}
                placeholder="e.g. about"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className={SECTION_TITLE}>Typography</p>
        <div className="space-y-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3">
            <p className="text-[10px] font-medium text-zinc-500 mb-2">Block defaults</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS}>Font</label>
                <select
                  value={String(block.settings.textFontFamily ?? "inherit")}
                  onChange={(e) => updateBlockSettings(block.id, { textFontFamily: e.target.value })}
                  className={SELECT_COMPACT}
                >
                  <option value="inherit">Inherit</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Size</label>
                <select
                  value={String(block.settings.textFontSize ?? "normal")}
                  onChange={(e) => updateBlockSettings(block.id, { textFontSize: e.target.value })}
                  className={SELECT_COMPACT}
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Weight</label>
                <select
                  value={String(block.settings.textFontWeight ?? "normal")}
                  onChange={(e) => updateBlockSettings(block.id, { textFontWeight: e.target.value })}
                  className={SELECT_COMPACT}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
          </div>

          <InlineExpand label="Title typography" defaultOpen={!!selectedComponent && selectedComponent === "title"}>
            <TypoRow
              label=""
              fontFamilyKey="titleFontFamily"
              fontSizeKey="titleFontSize"
              fontWeightKey="titleFontWeight"
              colorKey="titleColor"
              customColorKey="titleCustomColor"
              lineHeightKey="titleLineHeight"
              letterSpacingKey="titleLetterSpacing"
              block={block}
              updateBlockSettings={updateBlockSettings}
              theme={theme}
              FONT_OPTIONS={FONT_OPTIONS}
              fontSizeOpts={TITLE_SIZE_OPTS}
              showLineHeight
              showLetterSpacing
            />
          </InlineExpand>

          <InlineExpand label="Subtitle typography" defaultOpen={!!selectedComponent && selectedComponent === "subtitle"}>
            <TypoRow
              label=""
              fontFamilyKey="subtitleFontFamily"
              fontSizeKey="subtitleFontSize"
              fontWeightKey="subtitleFontWeight"
              colorKey="subtitleColor"
              customColorKey="subtitleCustomColor"
              lineHeightKey="subtitleLineHeight"
              letterSpacingKey="subtitleLetterSpacing"
              block={block}
              updateBlockSettings={updateBlockSettings}
              theme={theme}
              FONT_OPTIONS={FONT_OPTIONS}
              fontSizeOpts={SUBTITLE_SIZE_OPTS}
              showLineHeight
              showLetterSpacing
            />
          </InlineExpand>

          <InlineExpand label="Body typography" defaultOpen={!!selectedComponent && selectedComponent === "body"}>
            <TypoRow
              label=""
              fontFamilyKey="bodyFontFamily"
              fontSizeKey="bodyFontSize"
              fontWeightKey="bodyFontWeight"
              colorKey="bodyColor"
              customColorKey="bodyCustomColor"
              lineHeightKey="bodyLineHeight"
              letterSpacingKey="bodyLetterSpacing"
              block={block}
              updateBlockSettings={updateBlockSettings}
              theme={theme}
              FONT_OPTIONS={FONT_OPTIONS}
              fontSizeOpts={BODY_SIZE_OPTS}
              showLineHeight
              showLetterSpacing
            />
            <div className="mt-3 pt-3 border-t border-zinc-200">
              <p className="text-[10px] font-medium text-zinc-500 mb-2">Prose</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>Prose size</label>
                  <select
                    value={String(block.settings.bodyProseSize ?? "sm")}
                    onChange={(e) => updateBlockSettings(block.id, { bodyProseSize: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Link color</label>
                  <select
                    value={String(block.settings.bodyLinkColor ?? "accent")}
                    onChange={(e) => updateBlockSettings(block.id, { bodyLinkColor: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="accent">Accent</option>
                    <option value="primary">Primary</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {String(block.settings.bodyLinkColor ?? "accent") === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={COLOR_INPUT_WRAPPER}>
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.bodyLinkCustomColor ?? "")) ? String(block.settings.bodyLinkCustomColor) : theme.accent}
                      onChange={(e) => updateBlockSettings(block.id, { bodyLinkColor: "custom", bodyLinkCustomColor: e.target.value })}
                      className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                    />
                  </div>
                  <Input
                    value={String(block.settings.bodyLinkCustomColor ?? theme.accent)}
                    onChange={(e) => updateBlockSettings(block.id, { bodyLinkColor: "custom", bodyLinkCustomColor: e.target.value })}
                    placeholder="#6366f1"
                    className="h-9 flex-1 font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </InlineExpand>
        </div>
      </div>
    </div>
  );
}
