"use client";

import { useCallback, useRef, useState } from "react";
import type { BuilderBlock } from "@nexora/portfolio-builder";
import { SEGMENT_ICON_MAP } from "@nexora/portfolio-builder";

export type SkillsComponentType = "title" | "subtitle" | "segments";

const COMPONENT_LABELS: Record<SkillsComponentType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  segments: "Segments",
};

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

export interface SkillsDesignPreviewProps {
  block: BuilderBlock;
  selectedComponent: SkillsComponentType | null;
  onSelectComponent: (c: SkillsComponentType | null) => void;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme?: { primary: string; accent: string };
  viewportWidth?: number;
}

export function SkillsDesignPreview({
  block,
  selectedComponent,
  onSelectComponent,
  updateBlockSettings,
  theme = { primary: "#0f172a", accent: "#6366f1" },
  viewportWidth = 375,
}: SkillsDesignPreviewProps) {
  const [floatingPanelPos, setFloatingPanelPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const title = String(block.settings.title ?? "Skills");
  const subtitle = String(block.settings.subtitle ?? "");
  const segments = Array.isArray(block.settings.segments)
    ? (block.settings.segments as Array<{ name?: string; skills?: string[]; icon?: string }>).filter(
        (s) => (s.name ?? "").trim() || (s.skills ?? []).some((sk) => (sk ?? "").trim())
      )
    : [];
  const design = String(block.settings.segmentDesign ?? "badges");
  const skillColor = String(block.settings.skillColor ?? "accent");
  const skillSize = String(block.settings.skillSize ?? "md");
  const skillUniformWidth = Boolean(block.settings.skillUniformWidth ?? false);
  const skillFontWeight = String(block.settings.skillFontWeight ?? "medium");
  const skillTextColor = String(block.settings.skillTextColor ?? "auto");
  const skillTextCustomColor = String(block.settings.skillTextCustomColor ?? "").trim() || "#ffffff";
  const skillCustomColor = String(block.settings.skillCustomColor ?? "").trim();
  const skillBorderRadius = String(block.settings.skillBorderRadius ?? "md");
  const segmentTitleColor = String(block.settings.segmentTitleColor ?? "accent");
  const segmentTitleCustomColor = String(block.settings.segmentTitleCustomColor ?? "").trim() || theme.accent;
  const segmentTitleBgColor = String(block.settings.segmentTitleBgColor ?? "none");
  const segmentTitleBgCustomColor = String(block.settings.segmentTitleBgCustomColor ?? "").trim() || "#f4f4f5";
  const segmentTitlePadding = String(block.settings.segmentTitlePadding ?? "none");
  const segmentTitleBorderRadius = String(block.settings.segmentTitleBorderRadius ?? "none");
  const segmentTitleBorder = String(block.settings.segmentTitleBorder ?? "none");
  const segmentTitleBorderColor = String(block.settings.segmentTitleBorderColor ?? "accent");
  const segmentTitleBorderCustomColor = String(block.settings.segmentTitleBorderCustomColor ?? "").trim() || theme.accent;
  const segmentTitleShadow = String(block.settings.segmentTitleShadow ?? "none");
  const segmentTitleFontWeight = String(block.settings.segmentTitleFontWeight ?? "semibold");

  const titleColor = getColor(block, "skillsTitleColor", "skillsTitleCustomColor", theme) || undefined;
  const subtitleColor = getColor(block, "skillsSubtitleColor", "skillsSubtitleCustomColor", theme) || undefined;
  const headerAlign = String(block.settings.skillsHeaderAlign ?? "left");
  const headerAlignClass = headerAlign === "center" ? "text-center" : headerAlign === "right" ? "text-right" : "text-left";

  const handleElementClick = useCallback(
    (e: React.MouseEvent, component: SkillsComponentType) => {
      e.stopPropagation();
      const next = selectedComponent === component ? null : component;
      onSelectComponent(next);
      if (next) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const container = containerRef.current?.getBoundingClientRect();
        if (container) {
          setFloatingPanelPos({
            x: rect.left - container.left + rect.width / 2,
            y: rect.bottom - container.top + 8,
          });
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
    component: SkillsComponentType;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => handleElementClick(e, component)}
      onKeyDown={(e) =>
        e.key === "Enter" && handleElementClick(e as unknown as React.MouseEvent, component)
      }
      className={`cursor-pointer rounded-lg outline-none transition-all ring-2 ring-transparent hover:ring-indigo-300 ${
        selectedComponent === component ? "ring-indigo-500 ring-offset-2" : ""
      } ${className}`}
      title={`Click to edit ${COMPONENT_LABELS[component]}`}
    >
      {children}
    </div>
  );

  const getSkillColorStyle = (): React.CSSProperties => {
    const bg = skillCustomColor
      ? skillCustomColor
      : skillColor === "primary"
        ? theme.primary
        : skillColor === "neutral"
          ? "#e4e4e7"
          : theme.accent;
    let textColor: string;
    if (skillTextColor === "white") textColor = "white";
    else if (skillTextColor === "black") textColor = "#18181b";
    else if (skillTextColor === "custom") textColor = skillTextCustomColor;
    else if (skillColor === "neutral") textColor = "#18181b";
    else textColor = "white";
    return { backgroundColor: bg, color: textColor };
  };
  const colorStyle = getSkillColorStyle();
  const skillWeightClass =
    skillFontWeight === "normal" ? "font-normal" : skillFontWeight === "semibold" ? "font-semibold" : skillFontWeight === "bold" ? "font-bold" : "font-medium";
  const skillRadiusClass =
    skillBorderRadius === "none" ? "" : skillBorderRadius === "sm" ? "rounded" : skillBorderRadius === "lg" ? "rounded-lg" : skillBorderRadius === "full" ? "rounded-full" : "rounded-md";
  const sizeClass =
    skillSize === "sm" ? "text-xs px-2 py-0.5" : skillSize === "lg" ? "text-base px-5 py-2" : "text-sm px-3 py-1";
  const uniformLayoutClass = skillUniformWidth
    ? "grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2"
    : "flex flex-wrap gap-2";
  const uniformItemClass = skillUniformWidth ? "flex justify-center items-center w-full min-w-0" : "";

  const getSegmentTitleColor = () => {
    if (segmentTitleColor === "primary") return theme.primary;
    if (segmentTitleColor === "custom") return segmentTitleCustomColor;
    return theme.accent;
  };
  const getSegmentTitleStyle = (): React.CSSProperties | undefined => {
    if (segmentTitleBgColor === "none") return undefined;
    if (segmentTitleBgColor === "custom") return { backgroundColor: segmentTitleBgCustomColor };
    if (segmentTitleBgColor === "accent") return { backgroundColor: theme.accent, color: "white" };
    if (segmentTitleBgColor === "primary") return { backgroundColor: theme.primary, color: "white" };
    return undefined;
  };
  const segmentTitlePaddingClass =
    segmentTitlePadding === "sm" ? "px-2 py-0.5" : segmentTitlePadding === "md" ? "px-3 py-1" : segmentTitlePadding === "lg" ? "px-4 py-2" : "";
  const segmentTitleRadiusClass =
    segmentTitleBorderRadius === "sm" ? "rounded" : segmentTitleBorderRadius === "md" ? "rounded-md" : segmentTitleBorderRadius === "lg" ? "rounded-lg" : segmentTitleBorderRadius === "full" ? "rounded-full" : "";
  const segmentTitleBorderClass =
    segmentTitleBorder === "none" ? "border-0" : segmentTitleBorder === "sm" ? "border" : segmentTitleBorder === "md" ? "border-2" : segmentTitleBorder === "lg" ? "border-[3px]" : "border-0";
  const segmentTitleBorderColorStyle = (): React.CSSProperties | undefined => {
    if (segmentTitleBorder === "none") return undefined;
    if (segmentTitleBorderColor === "accent") return { borderColor: theme.accent };
    if (segmentTitleBorderColor === "primary") return { borderColor: theme.primary };
    if (segmentTitleBorderColor === "custom") return { borderColor: segmentTitleBorderCustomColor };
    return { borderColor: "#d4d4d8" };
  };
  const segmentTitleShadowClass =
    segmentTitleShadow === "sm" ? "shadow-sm" : segmentTitleShadow === "md" ? "shadow-md" : segmentTitleShadow === "lg" ? "shadow-lg" : "";
  const segmentTitleWeightClass =
    segmentTitleFontWeight === "normal" ? "font-normal" : segmentTitleFontWeight === "medium" ? "font-medium" : segmentTitleFontWeight === "bold" ? "font-bold" : "font-semibold";

  const renderSkills = (segSkills: string[]) => {
    if (design === "badges") {
      return (
        <div className={uniformLayoutClass}>
          {segSkills.map((skill, i) => (
            <span
              key={i}
              className={`${skillWeightClass} ${skillRadiusClass || "rounded-md"} ${sizeClass} ${uniformItemClass} ${
                skillColor === "neutral" && !skillCustomColor ? "border border-zinc-300 bg-zinc-100 text-zinc-700" : ""
              }`}
              style={skillColor === "neutral" && !skillCustomColor ? undefined : colorStyle}
            >
              {skill}
            </span>
          ))}
        </div>
      );
    }
    if (design === "pills") {
      return (
        <div className={uniformLayoutClass}>
          {segSkills.map((skill, i) => (
            <span
              key={i}
              className={`${skillWeightClass} ${skillRadiusClass || "rounded-full"} ${sizeClass} ${uniformItemClass}`}
              style={colorStyle}
            >
              {skill}
            </span>
          ))}
        </div>
      );
    }
    if (design === "cards") {
      return (
        <div className={uniformLayoutClass}>
          {segSkills.map((skill, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center border px-4 py-2 ${skillWeightClass} ${skillSize === "sm" ? "text-xs" : skillSize === "lg" ? "text-base" : "text-sm"} ${skillRadiusClass || "rounded-md"} ${uniformItemClass}`}
              style={
                skillColor !== "neutral" || skillCustomColor
                  ? { ...colorStyle, borderColor: colorStyle.backgroundColor }
                  : { borderColor: "#d4d4d8", backgroundColor: "#fafafa", color: "#3f3f46" }
              }
            >
              {skill}
            </span>
          ))}
        </div>
      );
    }
    if (design === "list") {
      return (
        <ul className="list-inside list-disc space-y-1">
          {segSkills.map((skill, i) => (
            <li key={i} className={`text-zinc-700 ${skillWeightClass}`}>
              {skill}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className={uniformLayoutClass}>
        {segSkills.map((skill, i) => (
          <span
            key={i}
            className={`border border-zinc-300 bg-zinc-50 text-zinc-700 ${skillWeightClass} ${skillRadiusClass || "rounded"} ${sizeClass} ${uniformItemClass}`}
            style={
              skillCustomColor
                ? { backgroundColor: skillCustomColor, color: skillTextColor === "custom" ? skillTextCustomColor : "white", borderColor: "transparent" }
                : undefined
            }
          >
            {skill}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative min-h-[300px] rounded-lg border border-zinc-300 bg-zinc-50 p-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        Design preview — click elements to edit
      </p>
      <div
        className="mx-auto flex flex-col gap-4"
        style={{ width: viewportWidth, maxWidth: "100%" }}
      >
        <div className={headerAlignClass}>
          <Selectable component="title">
            <h2
              className="text-2xl font-bold"
              style={titleColor ? { color: titleColor } : { color: theme.primary }}
            >
              {title}
            </h2>
          </Selectable>
          {subtitle && (
            <Selectable component="subtitle">
              <p
                className="mt-1 text-sm"
                style={subtitleColor ? { color: subtitleColor } : { color: "#52525b" }}
              >
                {subtitle}
              </p>
            </Selectable>
          )}
        </div>
        <Selectable component="segments">
          <div className="space-y-4">
            {segments.length > 0 ? (
              segments.map((seg, idx) => (
                <div key={idx}>
                  <h3
                    className={`mb-2 border-solid text-sm ${segmentTitleWeightClass} ${segmentTitlePaddingClass} ${segmentTitleRadiusClass} ${segmentTitleBorderClass} ${segmentTitleShadowClass}`}
                    style={{
                      ...(segmentTitleBgColor === "custom" || !segmentTitleBgColor || segmentTitleBgColor === "none"
                        ? { color: getSegmentTitleColor() }
                        : {}),
                      ...(getSegmentTitleStyle() ?? {}),
                      ...(segmentTitleBorderColorStyle() ?? {}),
                    }}
                  >
                    {seg.icon && SEGMENT_ICON_MAP[seg.icon] && (
                      <span className="mr-2" aria-hidden>
                        {SEGMENT_ICON_MAP[seg.icon]}
                      </span>
                    )}
                    {seg.name || "Skills"}
                  </h3>
                  {renderSkills(seg.skills ?? [])}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Add segments in the settings panel</p>
            )}
          </div>
        </Selectable>
      </div>

      {selectedComponent && floatingPanelPos && (
        <div
          className="absolute z-50 min-w-[200px] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
          style={{ left: floatingPanelPos.x, top: floatingPanelPos.y, transform: "translateX(-50%)" }}
        >
          <p className="mb-2 text-xs font-semibold text-zinc-700">
            {COMPONENT_LABELS[selectedComponent]}
          </p>
          <p className="text-[10px] text-zinc-500">
            Edit in the settings panel on the left.
          </p>
        </div>
      )}
    </div>
  );
}
