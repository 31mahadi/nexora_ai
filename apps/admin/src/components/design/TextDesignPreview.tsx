"use client";

import { Input } from "@nexora/ui";
import { useCallback, useRef, useState } from "react";
import type { BuilderBlock } from "@nexora/portfolio-builder";
import { RichTextEditor } from "./RichTextEditor";

export type TextComponentType = "title" | "subtitle" | "body";

const COMPONENT_LABELS: Record<TextComponentType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  body: "Body",
};

export interface TextDesignPreviewProps {
  block: BuilderBlock;
  selectedComponent: TextComponentType | null;
  onSelectComponent: (c: TextComponentType | null) => void;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme?: { primary: string; accent: string };
  FONT_OPTIONS?: { value: string; label: string }[];
  viewportWidth?: number;
}

function getColor(
  block: BuilderBlock,
  key: string,
  customKey: string,
  theme: { primary: string; accent: string }
): string {
  const v = block.settings[key];
  if (v === "primary") return theme.primary;
  if (v === "accent") return theme.accent;
  if (v === "custom") return String(block.settings[customKey] ?? theme.primary);
  return "";
}

const DEFAULT_FONT_OPTIONS = [
  { value: "inter", label: "Inter" },
  { value: "georgia", label: "Georgia" },
  { value: "playfair", label: "Playfair Display" },
  { value: "source-sans", label: "Source Sans Pro" },
  { value: "system", label: "System" },
];

export function TextDesignPreview({
  block,
  selectedComponent,
  onSelectComponent,
  updateBlockSettings,
  theme = { primary: "#0f172a", accent: "#6366f1" },
  FONT_OPTIONS = DEFAULT_FONT_OPTIONS,
  viewportWidth = 375,
}: TextDesignPreviewProps) {
  const [floatingPanelPos, setFloatingPanelPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const title = String(block.settings.title ?? "Section");
  const titleUseHtml = Boolean(block.settings.titleUseHtml ?? false);
  const titleHeadingLevel = String(block.settings.titleHeadingLevel ?? "h2");
  const titleTextTransform = String(block.settings.titleTextTransform ?? "none");
  const subtitle = String(block.settings.subtitle ?? "");
  const subtitleUseHtml = Boolean(block.settings.subtitleUseHtml ?? false);
  const subtitleVisible = Boolean(block.settings.subtitleVisible ?? true);
  const subtitlePosition = String(block.settings.subtitlePosition ?? "below");
  const body = String(block.settings.body ?? "Write your content here.");
  const isHtml = body.startsWith("<");
  const textLayout = String(block.settings.textLayout ?? "left");
  const titleAlign = String(block.settings.titleAlign ?? "inherit");
  const subtitleAlign = String(block.settings.subtitleAlign ?? "inherit");
  const textContentMaxWidth = String(block.settings.textContentMaxWidth ?? "medium");
  const textCardStyle = String(block.settings.textCardStyle ?? "bordered");
  const textContentPadding = String(block.settings.textContentPadding ?? "md");

  const layoutClass =
    textLayout === "center" ? "text-center" : textLayout === "right" ? "text-right" : "text-left";
  const titleAlignClass =
    titleAlign === "inherit" ? "" : titleAlign === "center" ? "text-center" : titleAlign === "right" ? "text-right" : "text-left";
  const subtitleAlignClass =
    subtitleAlign === "inherit" ? "" : subtitleAlign === "center" ? "text-center" : subtitleAlign === "right" ? "text-right" : "text-left";
  const maxWidthClass =
    textContentMaxWidth === "narrow"
      ? "max-w-2xl"
      : textContentMaxWidth === "wide"
        ? "max-w-4xl"
        : textContentMaxWidth === "full"
          ? "max-w-none"
          : "max-w-3xl";
  const cardClass =
    textCardStyle === "none"
      ? ""
      : textCardStyle === "elevated"
        ? "shadow-lg shadow-zinc-200/50"
        : textCardStyle === "filled"
          ? "bg-zinc-50"
          : "border border-zinc-200";
  const titleSubtitleDivider = String(block.settings.titleSubtitleDivider ?? "none");
  const titleSubtitleDividerStyle = String(block.settings.titleSubtitleDividerStyle ?? "line");
  const titleSubtitleDividerColor = String(block.settings.titleSubtitleDividerColor ?? "inherit");
  const titleSubtitleDividerWidth = String(block.settings.titleSubtitleDividerWidth ?? "short");
  const ctaText = String(block.settings.ctaText ?? "").trim();
  const ctaHref = String(block.settings.ctaHref ?? "").trim();
  const ctaColor = String(block.settings.ctaColor ?? "accent");
  const ctaCustomColor = String(block.settings.ctaCustomColor ?? "").trim() || theme.accent;
  const ctaStyle = String(block.settings.ctaStyle ?? "primary");
  const ctaTextColor = String(block.settings.ctaTextColor ?? "auto");
  const ctaTextCustomColor = String(block.settings.ctaTextCustomColor ?? "").trim() || "#ffffff";
  const ctaBorderWidth = String(block.settings.ctaBorderWidth ?? "medium");
  const ctaBorderRadius = String(block.settings.ctaBorderRadius ?? "md");
  const ctaSize = String(block.settings.ctaSize ?? "normal");
  const ctaFontSize = String(block.settings.ctaFontSize ?? "md");
  const textLayoutColumns = String(block.settings.textLayoutColumns ?? "single");
  const bodyLetterSpacing = String(block.settings.bodyLetterSpacing ?? "normal");
  const cardPaddingClass =
    textContentPadding === "sm" ? "p-4" : textContentPadding === "lg" ? "p-8" : "p-6";

  const titleSizeMap: Record<string, string> = { "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl", "5xl": "text-5xl" };
  const subtitleSizeMap: Record<string, string> = { sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl" };
  const bodySizeMap: Record<string, string> = { sm: "text-sm", base: "text-base", lg: "text-lg" };
  const titleSize = String(block.settings.titleFontSize ?? "inherit");
  const subtitleSize = String(block.settings.subtitleFontSize ?? "inherit");
  const bodySize = String(block.settings.bodyFontSize ?? "inherit");
  const titleSizeCustom = String(block.settings.titleFontSizeCustom ?? "3");
  const subtitleSizeCustom = String(block.settings.subtitleFontSizeCustom ?? "1.25");
  const bodySizeCustom = String(block.settings.bodyFontSizeCustom ?? "1");
  const titleWeight = String(block.settings.titleFontWeight ?? "inherit");
  const subtitleWeight = String(block.settings.subtitleFontWeight ?? "inherit");
  const bodyWeight = String(block.settings.bodyFontWeight ?? "inherit");
  const titleSizeClass = titleSize === "inherit" ? "text-3xl" : titleSize === "custom" ? "" : titleSizeMap[titleSize] ?? "text-3xl";
  const subtitleSizeClass = subtitleSize === "inherit" ? "text-xl" : subtitleSize === "custom" ? "" : subtitleSizeMap[subtitleSize] ?? "text-xl";
  const bodySizeClass = bodySize === "inherit" ? "text-base" : bodySize === "custom" ? "" : bodySizeMap[bodySize] ?? "text-base";
  const titleSizeStyle = titleSize === "custom" ? { fontSize: `${Math.max(0.5, Math.min(8, parseFloat(titleSizeCustom) || 3))}rem` } : undefined;
  const subtitleSizeStyle = subtitleSize === "custom" ? { fontSize: `${Math.max(0.5, Math.min(4, parseFloat(subtitleSizeCustom) || 1.25))}rem` } : undefined;
  const bodySizeStyle = bodySize === "custom" ? { fontSize: `${Math.max(0.5, Math.min(2, parseFloat(bodySizeCustom) || 1))}rem` } : undefined;
  const titleWeightClass =
    titleWeight === "inherit" ? "font-bold" : titleWeight === "medium" ? "font-medium" : titleWeight === "semibold" ? "font-semibold" : titleWeight === "bold" ? "font-bold" : "font-normal";
  const subtitleWeightClass =
    subtitleWeight === "inherit" ? "font-normal" : subtitleWeight === "medium" ? "font-medium" : subtitleWeight === "semibold" ? "font-semibold" : subtitleWeight === "bold" ? "font-bold" : "font-normal";
  const bodyWeightClass =
    bodyWeight === "inherit" ? "font-normal" : bodyWeight === "medium" ? "font-medium" : bodyWeight === "semibold" ? "font-semibold" : bodyWeight === "bold" ? "font-bold" : "font-normal";
  const titleColorStyle = getColor(block, "titleColor", "titleCustomColor", theme)
    ? { color: getColor(block, "titleColor", "titleCustomColor", theme) }
    : undefined;
  const subtitleColorStyle = getColor(block, "subtitleColor", "subtitleCustomColor", theme)
    ? { color: getColor(block, "subtitleColor", "subtitleCustomColor", theme) }
    : undefined;
  const bodyColorStyle = getColor(block, "bodyColor", "bodyCustomColor", theme)
    ? { color: getColor(block, "bodyColor", "bodyCustomColor", theme) }
    : undefined;

  const textFontFamily = String(block.settings.textFontFamily ?? "inherit");
  const bodyFontFamily = String(block.settings.bodyFontFamily ?? "inherit");
  const bodyFontClass =
    (bodyFontFamily === "inherit" ? textFontFamily : bodyFontFamily) !== "inherit"
      ? `font-hero-${bodyFontFamily === "inherit" ? textFontFamily : bodyFontFamily}`
      : "";
  const bodyLineHeight = String(block.settings.bodyLineHeight ?? "normal");
  const bodyLineClass =
    bodyLineHeight === "tight" ? "leading-tight" : bodyLineHeight === "relaxed" ? "leading-relaxed" : "leading-normal";
  const bodyLetterClass =
    bodyLetterSpacing === "tight" ? "tracking-tight" : bodyLetterSpacing === "wide" ? "tracking-wide" : "tracking-normal";
  const titleTransformClass =
    titleTextTransform === "uppercase" ? "uppercase" : titleTextTransform === "lowercase" ? "lowercase" : titleTextTransform === "capitalize" ? "capitalize" : "";
  const bodyProseSize = String(block.settings.bodyProseSize ?? "sm");
  const proseSizeClass =
    bodyProseSize === "base" ? "prose" : bodyProseSize === "lg" ? "prose-lg" : "prose-sm";
  const bodyLinkColor = String(block.settings.bodyLinkColor ?? "accent");
  const bodyLinkCustomColor = String(block.settings.bodyLinkCustomColor ?? "#6366f1");
  const proseLinkColor =
    bodyLinkColor === "inherit"
      ? "currentColor"
      : bodyLinkColor === "primary"
        ? theme.primary
        : bodyLinkColor === "custom" && /^#[0-9A-Fa-f]{6}$/.test(bodyLinkCustomColor)
          ? bodyLinkCustomColor
          : theme.accent;

  const handleElementClick = useCallback(
    (e: React.MouseEvent, component: TextComponentType) => {
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
    component: TextComponentType;
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

  return (
    <div ref={containerRef} className="relative min-h-[300px] rounded-lg border border-zinc-300 bg-zinc-50 p-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        Text block — click elements to edit
      </p>
      <div
        className={`mx-auto rounded-lg bg-white ${layoutClass}`}
        style={{ width: viewportWidth, maxWidth: "100%" }}
      >
        {subtitlePosition === "above" && subtitleVisible && subtitle !== "" && (
          <Selectable component="subtitle">
            <p
              className={`mb-2 ${subtitleSizeClass} ${subtitleWeightClass} ${subtitleAlignClass || layoutClass} ${!subtitleColorStyle ? "text-zinc-600" : ""}`}
              style={{ ...subtitleColorStyle, ...subtitleSizeStyle }}
            >
              {subtitleUseHtml && subtitle ? (
                <span dangerouslySetInnerHTML={{ __html: subtitle }} />
              ) : (
                subtitle
              )}
            </p>
          </Selectable>
        )}
        {subtitlePosition === "above" && (subtitle === "" || !subtitleVisible) && (
          <Selectable component="subtitle">
            <p className={`mb-2 text-sm italic text-zinc-400 ${layoutClass}`}>
              {subtitleVisible ? "Add subtitle (optional)" : "Subtitle hidden"}
            </p>
          </Selectable>
        )}
        <Selectable component="title">
          {titleHeadingLevel === "h1" ? (
            <h1
              className={`mb-4 ${titleSizeClass} ${titleWeightClass} ${titleAlignClass || layoutClass} ${titleTransformClass} ${!titleColorStyle ? "text-zinc-900" : ""}`}
              style={{ ...titleColorStyle, ...titleSizeStyle }}
            >
              {titleUseHtml && title ? (
                <span dangerouslySetInnerHTML={{ __html: title }} />
              ) : (
                title || "Section title"
              )}
            </h1>
          ) : titleHeadingLevel === "h3" ? (
            <h3
              className={`mb-4 ${titleSizeClass} ${titleWeightClass} ${titleAlignClass || layoutClass} ${titleTransformClass} ${!titleColorStyle ? "text-zinc-900" : ""}`}
              style={{ ...titleColorStyle, ...titleSizeStyle }}
            >
              {titleUseHtml && title ? (
                <span dangerouslySetInnerHTML={{ __html: title }} />
              ) : (
                title || "Section title"
              )}
            </h3>
          ) : (
            <h2
              className={`mb-4 ${titleSizeClass} ${titleWeightClass} ${titleAlignClass || layoutClass} ${titleTransformClass} ${!titleColorStyle ? "text-zinc-900" : ""}`}
              style={{ ...titleColorStyle, ...titleSizeStyle }}
            >
              {titleUseHtml && title ? (
                <span dangerouslySetInnerHTML={{ __html: title }} />
              ) : (
                title || "Section title"
              )}
            </h2>
          )}
        </Selectable>
        {titleSubtitleDivider !== "none" && (
          titleSubtitleDivider === "dot" ? (
            <div
              className={`my-4 h-1.5 w-1.5 rounded-full ${layoutClass === "text-center" ? "mx-auto" : layoutClass === "text-right" ? "ml-auto" : ""}`}
              style={{
                backgroundColor:
                  titleSubtitleDividerColor === "primary"
                    ? theme.primary
                    : titleSubtitleDividerColor === "accent"
                      ? theme.accent
                      : "currentColor",
                opacity: titleSubtitleDividerColor === "inherit" ? 0.3 : 1,
              }}
            />
          ) : (
            <div
              className={`my-4 ${
                titleSubtitleDividerWidth === "full"
                  ? "w-full"
                  : titleSubtitleDividerWidth === "medium"
                    ? "w-24"
                    : "w-16"
              } ${layoutClass === "text-center" ? "mx-auto" : layoutClass === "text-right" ? "ml-auto" : ""}`}
              style={{
                borderColor:
                  titleSubtitleDividerColor === "primary"
                    ? theme.primary
                    : titleSubtitleDividerColor === "accent"
                      ? theme.accent
                      : "currentColor",
                borderTopWidth: 2,
                borderTopStyle: titleSubtitleDividerStyle === "dotted" ? "dotted" : titleSubtitleDividerStyle === "dashed" ? "dashed" : "solid",
                opacity: titleSubtitleDividerColor === "inherit" ? 0.3 : 1,
              }}
            />
          )
        )}
        {subtitlePosition === "below" && subtitleVisible && subtitle !== "" && (
          <Selectable component="subtitle">
            <p
              className={`mb-4 ${subtitleSizeClass} ${subtitleWeightClass} ${subtitleAlignClass || layoutClass} ${!subtitleColorStyle ? "text-zinc-600" : ""}`}
              style={{ ...subtitleColorStyle, ...subtitleSizeStyle }}
            >
              {subtitleUseHtml && subtitle ? (
                <span dangerouslySetInnerHTML={{ __html: subtitle }} />
              ) : (
                subtitle
              )}
            </p>
          </Selectable>
        )}
        {subtitlePosition === "below" && (subtitle === "" || !subtitleVisible) && (
          <Selectable component="subtitle">
            <p className={`mb-4 text-sm italic text-zinc-400 ${layoutClass}`}>
              {subtitleVisible ? "Add subtitle (optional)" : "Subtitle hidden — toggle in Content tab"}
            </p>
          </Selectable>
        )}
        <div className={`mx-auto w-full ${maxWidthClass}`}>
          <Selectable component="body">
            <div className={`rounded-xl ${cardClass} ${cardPaddingClass} ${textCardStyle === "none" ? "rounded-none" : ""} ${textLayoutColumns === "two" ? "columns-1 md:columns-2 gap-6" : ""}`}>
            {isHtml ? (
              <div
                className={`prose max-w-none text-zinc-700 ${proseSizeClass} ${bodyFontClass} ${bodySizeClass || "text-base"} ${bodyWeightClass} ${bodyLineClass} ${bodyLetterClass} ${textLayoutColumns === "two" ? "break-inside-avoid" : ""}`}
                style={
                  {
                    ...bodyColorStyle,
                    ...bodySizeStyle,
                    ["--link-color" as string]: proseLinkColor,
                  } as React.CSSProperties
                }
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <p
                className={`whitespace-pre-wrap ${bodyFontClass} ${bodySizeClass || "text-base"} ${bodyWeightClass} ${bodyLineClass} ${bodyLetterClass} ${!bodyColorStyle ? "text-zinc-700" : ""}`}
                style={{ ...bodyColorStyle, ...bodySizeStyle }}
              >
                {body || "Write your content here."}
              </p>
            )}
            {ctaText && (() => {
              const bgColor = ctaColor === "primary" ? theme.primary : ctaColor === "custom" && /^#[0-9A-Fa-f]{6}$/.test(ctaCustomColor) ? ctaCustomColor : theme.accent;
              const textCol = ctaTextColor === "custom" && /^#[0-9A-Fa-f]{6}$/.test(ctaTextCustomColor) ? ctaTextCustomColor : ctaTextColor === "white" ? "#ffffff" : ctaTextColor === "primary" ? theme.primary : "#ffffff";
              const borderW = ctaBorderWidth === "none" ? 0 : ctaBorderWidth === "thin" ? 1 : ctaBorderWidth === "thick" ? 4 : 2;
              const radius = ctaBorderRadius === "none" ? 0 : ctaBorderRadius === "sm" ? 4 : ctaBorderRadius === "lg" ? 8 : ctaBorderRadius === "full" ? 9999 : 6;
              const sizeClass = ctaSize === "compact" ? "px-4 py-2" : ctaSize === "large" ? "px-8 py-4" : "px-6 py-3";
              const fontSizeClass = ctaFontSize === "sm" ? "text-sm" : ctaFontSize === "lg" ? "text-lg" : "text-base";
              const style: React.CSSProperties = ctaStyle === "primary"
                ? { backgroundColor: bgColor, color: textCol, borderWidth: borderW, borderRadius: radius }
                : ctaStyle === "outline"
                  ? { borderColor: bgColor, color: bgColor, borderWidth: borderW, borderRadius: radius }
                  : { color: bgColor };
              return (
                <a
                  href={ctaHref || "#"}
                  className={`mt-4 inline-flex ${sizeClass} ${fontSizeClass} font-medium transition hover:opacity-90 ${ctaStyle === "outline" ? "border" : ""}`}
                  style={style}
                >
                  {ctaText}
                </a>
              );
            })()}
            </div>
          </Selectable>
        </div>
      </div>

      {/* Floating property panel */}
      {selectedComponent && floatingPanelPos && (
        <div
          className="absolute z-50 min-w-[220px] max-w-[320px] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
          style={{ left: floatingPanelPos.x, top: floatingPanelPos.y, transform: "translateX(-50%)" }}
        >
          <p className="mb-2 text-xs font-semibold text-zinc-700">{COMPONENT_LABELS[selectedComponent]}</p>
          <div className="mb-2 space-y-1">
            <label className="block text-[10px] font-medium text-zinc-500">Layout</label>
            <select
              value={textLayout}
              onChange={(e) => updateBlockSettings(block.id, { textLayout: e.target.value })}
              className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          {(selectedComponent === "title" || selectedComponent === "subtitle") && (
            <>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">
                  {selectedComponent === "title" ? "Title" : "Subtitle"} alignment
                </label>
                <select
                  value={selectedComponent === "title" ? titleAlign : subtitleAlign}
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
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Size</label>
                  <select
                    value={selectedComponent === "title" ? titleSize : subtitleSize}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        [selectedComponent === "title" ? "titleFontSize" : "subtitleFontSize"]: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="inherit">Inherit</option>
                    {selectedComponent === "title"
                      ? ["2xl", "3xl", "4xl", "5xl", "custom"].map((s) => (
                          <option key={s} value={s}>{s === "custom" ? "Custom (rem)" : s}</option>
                        ))
                      : ["sm", "base", "lg", "xl", "custom"].map((s) => (
                          <option key={s} value={s}>{s === "custom" ? "Custom (rem)" : s}</option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Weight</label>
                  <select
                    value={selectedComponent === "title" ? titleWeight : subtitleWeight}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        [selectedComponent === "title" ? "titleFontWeight" : "subtitleFontWeight"]: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="inherit">Inherit</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Font</label>
                <select
                  value={String(block.settings[selectedComponent === "title" ? "titleFontFamily" : "subtitleFontFamily"] ?? "inherit")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      [selectedComponent === "title" ? "titleFontFamily" : "subtitleFontFamily"]: e.target.value,
                    })
                  }
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="inherit">Inherit</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Line height</label>
                  <select
                    value={String(block.settings[selectedComponent === "title" ? "titleLineHeight" : "subtitleLineHeight"] ?? "normal")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        [selectedComponent === "title" ? "titleLineHeight" : "subtitleLineHeight"]: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Letter spacing</label>
                  <select
                    value={String(block.settings[selectedComponent === "title" ? "titleLetterSpacing" : "subtitleLetterSpacing"] ?? "normal")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        [selectedComponent === "title" ? "titleLetterSpacing" : "subtitleLetterSpacing"]: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
              </div>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Color</label>
                <select
                  value={String(block.settings[selectedComponent === "title" ? "titleColor" : "subtitleColor"] ?? "inherit")}
                  onChange={(e) =>
                    updateBlockSettings(block.id, {
                      [selectedComponent === "title" ? "titleColor" : "subtitleColor"]: e.target.value,
                    })
                  }
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="inherit">Inherit</option>
                  <option value="primary">Theme primary</option>
                  <option value="accent">Theme accent</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {String(block.settings[selectedComponent === "title" ? "titleColor" : "subtitleColor"] ?? "inherit") === "custom" && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-8 w-10 shrink-0 overflow-hidden rounded border border-zinc-300">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings[selectedComponent === "title" ? "titleCustomColor" : "subtitleCustomColor"] ?? "")) ? String(block.settings[selectedComponent === "title" ? "titleCustomColor" : "subtitleCustomColor"]) : theme.accent}
                      onChange={(e) =>
                        updateBlockSettings(block.id, {
                          [selectedComponent === "title" ? "titleColor" : "subtitleColor"]: "custom",
                          [selectedComponent === "title" ? "titleCustomColor" : "subtitleCustomColor"]: e.target.value,
                        })
                      }
                      className="h-full w-full cursor-pointer border-0 p-0"
                    />
                  </div>
                  <Input
                    value={String(block.settings[selectedComponent === "title" ? "titleCustomColor" : "subtitleCustomColor"] ?? theme.accent)}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        [selectedComponent === "title" ? "titleColor" : "subtitleColor"]: "custom",
                        [selectedComponent === "title" ? "titleCustomColor" : "subtitleCustomColor"]: e.target.value,
                      })
                    }
                    className="h-8 flex-1 font-mono text-xs"
                    placeholder="#18181b"
                  />
                </div>
              )}
              {(selectedComponent === "title" ? titleSize : subtitleSize) === "custom" && (
                <div className="mb-2 space-y-1">
                  <label className="block text-[10px] font-medium text-zinc-500">Custom size (rem)</label>
                  <input
                    type="number"
                    min={0.5}
                    max={selectedComponent === "title" ? 8 : 4}
                    step={0.25}
                    value={selectedComponent === "title" ? titleSizeCustom : subtitleSizeCustom}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        [selectedComponent === "title" ? "titleFontSizeCustom" : "subtitleFontSizeCustom"]: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  />
                </div>
              )}
            </>
          )}
          {selectedComponent === "body" && (
            <>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Font</label>
                <select
                  value={String(block.settings.bodyFontFamily ?? "inherit")}
                  onChange={(e) => updateBlockSettings(block.id, { bodyFontFamily: e.target.value })}
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="inherit">Inherit</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Font size</label>
                  <select
                    value={bodySize}
                    onChange={(e) => updateBlockSettings(block.id, { bodyFontSize: e.target.value })}
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="inherit">Inherit</option>
                    <option value="sm">sm</option>
                    <option value="base">base</option>
                    <option value="lg">lg</option>
                    <option value="custom">Custom (rem)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Weight</label>
                  <select
                    value={bodyWeight}
                    onChange={(e) => updateBlockSettings(block.id, { bodyFontWeight: e.target.value })}
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="inherit">Inherit</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
              {bodySize === "custom" && (
                <div className="mb-2 space-y-1">
                  <label className="block text-[10px] font-medium text-zinc-500">Custom size (rem)</label>
                  <input
                    type="number"
                    min={0.5}
                    max={2}
                    step={0.125}
                    value={bodySizeCustom}
                    onChange={(e) => updateBlockSettings(block.id, { bodyFontSizeCustom: e.target.value })}
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  />
                </div>
              )}
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Line height</label>
                <select
                  value={String(block.settings.bodyLineHeight ?? "normal")}
                  onChange={(e) => updateBlockSettings(block.id, { bodyLineHeight: e.target.value })}
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="tight">Tight</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Color</label>
                <select
                  value={String(block.settings.bodyColor ?? "inherit")}
                  onChange={(e) => updateBlockSettings(block.id, { bodyColor: e.target.value })}
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="inherit">Inherit</option>
                  <option value="primary">Theme primary</option>
                  <option value="accent">Theme accent</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {String(block.settings.bodyColor ?? "inherit") === "custom" && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-8 w-10 shrink-0 overflow-hidden rounded border border-zinc-300">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.bodyCustomColor ?? "")) ? String(block.settings.bodyCustomColor) : theme.accent}
                      onChange={(e) =>
                        updateBlockSettings(block.id, { bodyColor: "custom", bodyCustomColor: e.target.value })
                      }
                      className="h-full w-full cursor-pointer border-0 p-0"
                    />
                  </div>
                  <Input
                    value={String(block.settings.bodyCustomColor ?? theme.accent)}
                    onChange={(e) =>
                      updateBlockSettings(block.id, { bodyColor: "custom", bodyCustomColor: e.target.value })
                    }
                    className="h-8 flex-1 font-mono text-xs"
                    placeholder="#3f3f46"
                  />
                </div>
              )}
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Prose size</label>
                  <select
                    value={String(block.settings.bodyProseSize ?? "sm")}
                    onChange={(e) => updateBlockSettings(block.id, { bodyProseSize: e.target.value })}
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500">Link color</label>
                  <select
                    value={String(block.settings.bodyLinkColor ?? "accent")}
                    onChange={(e) => updateBlockSettings(block.id, { bodyLinkColor: e.target.value })}
                    className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                  >
                    <option value="inherit">Inherit</option>
                    <option value="accent">Accent</option>
                    <option value="primary">Primary</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Content max width</label>
                <select
                  value={textContentMaxWidth}
                  onChange={(e) => updateBlockSettings(block.id, { textContentMaxWidth: e.target.value })}
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="narrow">Narrow</option>
                  <option value="medium">Medium</option>
                  <option value="wide">Wide</option>
                  <option value="full">Full</option>
                </select>
              </div>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Card style</label>
                <select
                  value={textCardStyle}
                  onChange={(e) => updateBlockSettings(block.id, { textCardStyle: e.target.value })}
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="bordered">Bordered</option>
                  <option value="elevated">Elevated</option>
                  <option value="filled">Filled</option>
                </select>
              </div>
              <div className="mb-2 space-y-1">
                <label className="block text-[10px] font-medium text-zinc-500">Content padding</label>
                <select
                  value={textContentPadding}
                  onChange={(e) => updateBlockSettings(block.id, { textContentPadding: e.target.value })}
                  className="h-8 w-full rounded border border-zinc-300 px-2 text-sm"
                >
                  <option value="sm">Compact</option>
                  <option value="md">Default</option>
                  <option value="lg">Spacious</option>
                </select>
              </div>
            </>
          )}
          {selectedComponent === "title" && (
            <>
              <Input
                value={title}
                onChange={(e) => updateBlockSettings(block.id, { title: e.target.value })}
                className="h-8 text-sm"
                placeholder="Section title"
              />
              <label className="mt-2 flex items-center gap-2 text-[10px] text-zinc-600">
                <input
                  type="checkbox"
                  checked={titleUseHtml}
                  onChange={(e) => updateBlockSettings(block.id, { titleUseHtml: e.target.checked })}
                />
                Allow HTML
              </label>
            </>
          )}
          {selectedComponent === "subtitle" && (
            <>
              <Input
                value={subtitle}
                onChange={(e) => updateBlockSettings(block.id, { subtitle: e.target.value })}
                className="h-8 text-sm"
                placeholder="Subtitle (optional)"
              />
              <label className="mt-2 flex items-center gap-2 text-[10px] text-zinc-600">
                <input
                  type="checkbox"
                  checked={subtitleVisible}
                  onChange={(e) => updateBlockSettings(block.id, { subtitleVisible: e.target.checked })}
                />
                Show subtitle
              </label>
            </>
          )}
          {selectedComponent === "body" && (
            <div className="space-y-2">
              <RichTextEditor
                value={body}
                onChange={(html) => updateBlockSettings(block.id, { body: html })}
                placeholder="Write your content..."
                minHeight="100px"
                maxHeight="200px"
                resizable={true}
                showCharCount={false}
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
