"use client";

import { Button, Card, Input } from "@nexora/ui";
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
import { ChevronDown, ChevronRight, Copy, GripVertical, Link2, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
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

export type SkillsComponentType = "title" | "subtitle" | "segments";

export interface SkillsBlockSettingsProps {
  block: BuilderBlock;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme: { primary: string; accent: string };
  FONT_OPTIONS: { value: string; label: string }[];
  selectedComponent?: SkillsComponentType | null;
  onClearSelection?: () => void;
}

const COMPONENT_LABELS: Record<SkillsComponentType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  segments: "Segments",
};

interface SegmentPreviewStyle {
  segmentDesign: string;
  skillColor: string;
  skillSize: string;
  skillUniformWidth: boolean;
  segmentTitleColor: string;
  segmentTitleCustomColor: string;
  segmentTitleBgColor: string;
  segmentTitleBgCustomColor: string;
  segmentTitlePadding: string;
  segmentTitleBorderRadius: string;
  segmentTitleBorder: string;
  segmentTitleBorderColor: string;
  segmentTitleBorderCustomColor: string;
  segmentTitleShadow: string;
  segmentTitleFontWeight: string;
  skillFontWeight: string;
  skillTextColor: string;
  skillTextCustomColor: string;
  skillCustomColor: string;
  skillBorderRadius: string;
  theme: { primary: string; accent: string };
}

function SegmentIconPicker({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
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
    const g = item.group || "\0"; // \0 for None/empty to sort first
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
        title="Choose segment icon"
      >
        <span className="text-base leading-none">{selected.emoji || "—"}</span>
        <span className="max-w-[4rem] truncate text-xs text-zinc-600">{selected.label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 max-h-64 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50"
        >
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

function SortableSegmentItem({
  id,
  segment,
  segIdx,
  displaySegments,
  blockId,
  updateBlockSettings,
  previewStyle,
}: {
  id: string;
  segment: { name?: string; skills?: string[]; skillUrls?: string[]; icon?: string };
  segIdx: number;
  displaySegments: Array<{ name?: string; skills?: string[]; skillUrls?: string[]; icon?: string }>;
  blockId: string;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  previewStyle: SegmentPreviewStyle;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const skills = segment.skills ?? [];
  const skillIds = skills.map((_, i) => `seg-${segIdx}-skill-${i}`);
  const skillUrls = segment.skillUrls ?? [];
  const getSkillUrl = (i: number) => skillUrls[i] ?? "";
  const setSkillUrl = (i: number, url: string) => {
    const n = [...displaySegments];
    const urls = [...(n[segIdx].skillUrls ?? skills.map(() => "") ?? [])];
    while (urls.length <= i) urls.push("");
    urls[i] = url;
    n[segIdx] = { ...n[segIdx], skillUrls: urls };
    updateBlockSettings(blockId, { segments: n, items: undefined });
  };
  const {
    segmentDesign,
    skillColor,
    skillSize,
    skillUniformWidth,
    segmentTitleColor,
    segmentTitleCustomColor,
    segmentTitleBgColor,
    segmentTitleBgCustomColor,
    segmentTitlePadding,
    segmentTitleBorderRadius,
    segmentTitleBorder,
    segmentTitleBorderColor,
    segmentTitleBorderCustomColor,
    segmentTitleShadow,
    segmentTitleFontWeight,
    theme,
  } = previewStyle;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );


  const handleSkillDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIdx = skillIds.indexOf(String(active.id));
      const toIdx = skillIds.indexOf(String(over.id));
      if (fromIdx < 0 || toIdx < 0) return;
      const n = [...displaySegments];
      const segSkills = [...(n[segIdx].skills ?? [])];
      let segUrls = [...(n[segIdx].skillUrls ?? [])];
      while (segUrls.length < segSkills.length) segUrls.push("");
      const [movedSkill] = segSkills.splice(fromIdx, 1);
      const [movedUrl] = segUrls.splice(fromIdx, 1);
      segSkills.splice(toIdx, 0, movedSkill);
      segUrls.splice(toIdx, 0, movedUrl);
      n[segIdx] = { ...n[segIdx], skills: segSkills, skillUrls: segUrls };
      updateBlockSettings(blockId, { segments: n, items: undefined });
    },
    [displaySegments, segIdx, skillIds, blockId, updateBlockSettings]
  );

  const getSkillColorStyle = () => {
    if (skillColor === "primary") return { backgroundColor: theme.primary, color: "white" };
    if (skillColor === "neutral") return { backgroundColor: "#e4e4e7", color: "#18181b" };
    return { backgroundColor: theme.accent, color: "white" };
  };
  const colorStyle = getSkillColorStyle();
  const sizeClass =
    skillSize === "sm" ? "text-xs px-2 py-0.5" : skillSize === "lg" ? "text-base px-5 py-2" : "text-sm px-3 py-1";
  const uniformLayoutClass = skillUniformWidth
    ? "grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2"
    : "flex flex-wrap gap-2";
  const isListDesign = segmentDesign === "list";

  const segmentTitleColorStyle = () => {
    if (segmentTitleColor === "primary") return theme.primary;
    if (segmentTitleColor === "custom") return segmentTitleCustomColor;
    return theme.accent;
  };
  const segmentTitleBgStyle = (): React.CSSProperties | undefined => {
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

  const skillsContent = (
    <DndContext
      key={`skills-${segIdx}-${skills.length}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleSkillDragEnd}
    >
      <SortableContext items={skillIds} strategy={verticalListSortingStrategy}>
        {isListDesign ? (
          <ul className="list-inside list-disc space-y-1">
            {skills.map((skill, skillIdx) => (
              <SortableSkillItem
                key={skillIds[skillIdx]}
                id={skillIds[skillIdx]}
                value={typeof skill === "string" ? skill : String(skill ?? "")}
                skillUrl={getSkillUrl(skillIdx)}
                segIdx={segIdx}
                skillIdx={skillIdx}
                displaySegments={displaySegments}
                blockId={blockId}
                updateBlockSettings={updateBlockSettings}
                onSkillUrlChange={setSkillUrl}
                previewStyle={previewStyle}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-2">
            {skills.map((skill, skillIdx) => (
              <SortableSkillItem
                key={skillIds[skillIdx]}
                id={skillIds[skillIdx]}
                value={typeof skill === "string" ? skill : String(skill ?? "")}
                skillUrl={getSkillUrl(skillIdx)}
                segIdx={segIdx}
                skillIdx={skillIdx}
                displaySegments={displaySegments}
                blockId={blockId}
                updateBlockSettings={updateBlockSettings}
                onSkillUrlChange={setSkillUrl}
                previewStyle={previewStyle}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </DndContext>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="mb-3 flex items-start gap-2">
        <span
          className="mt-1 flex shrink-0 cursor-grab items-center justify-center rounded border border-zinc-300 bg-zinc-100 px-2 py-1.5 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-200 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          title="Drag to reorder segment"
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <SegmentIconPicker
              value={segment.icon ?? ""}
              onChange={(v) => {
                const n = [...displaySegments];
                n[segIdx] = { ...n[segIdx], icon: v || undefined };
                updateBlockSettings(blockId, { segments: n, items: undefined });
              }}
            />
            <input
              value={segment.name ?? ""}
              onChange={(e) => {
                const n = [...displaySegments];
                n[segIdx] = { ...n[segIdx], name: e.target.value };
                updateBlockSettings(blockId, { segments: n, items: undefined });
              }}
              placeholder="Segment name (e.g. Frontend)"
            className={`min-w-0 flex-1 border-solid bg-transparent p-0 text-lg outline-none focus:ring-0 ${segmentTitlePaddingClass} ${segmentTitleRadiusClass} ${segmentTitleBorderClass} ${segmentTitleShadowClass} ${segmentTitleWeightClass}`}
            style={{
              color:
                segmentTitleBgColor === "custom" || !segmentTitleBgColor || segmentTitleBgColor === "none"
                  ? segmentTitleColorStyle()
                  : undefined,
              ...segmentTitleBgStyle(),
              ...(segmentTitleBorderColorStyle() ?? {}),
            }}
            />
          </div>
          {skillsContent}
          <button
            type="button"
            className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
            onClick={() => {
              const n = [...displaySegments];
              const skillsList = [...(n[segIdx].skills ?? []), ""];
              const urls = n[segIdx].skillUrls ?? [];
              const newUrls = [...urls];
              while (newUrls.length < skillsList.length) newUrls.push("");
              n[segIdx] = { ...n[segIdx], skills: skillsList, skillUrls: newUrls };
              updateBlockSettings(blockId, { segments: n, items: undefined });
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add skill
          </button>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center justify-center rounded border border-zinc-300 bg-zinc-100 p-1.5 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
          onClick={() => {
            const src = displaySegments[segIdx];
            const dup = {
              ...src,
              name: src.name ?? "",
              skills: [...(src.skills ?? [])],
              skillUrls: [...(src.skillUrls ?? [])],
              icon: src.icon,
            };
            const n = [...displaySegments];
            n.splice(segIdx + 1, 0, dup);
            updateBlockSettings(blockId, { segments: n, items: undefined });
          }}
          aria-label="Duplicate segment"
          title="Duplicate segment"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex shrink-0 items-center justify-center rounded border border-zinc-300 bg-zinc-100 p-1.5 text-zinc-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            const n = displaySegments.filter((_, i) => i !== segIdx);
            updateBlockSettings(blockId, { segments: n, items: undefined });
          }}
          aria-label="Remove segment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SortableSkillItem({
  id,
  value,
  skillUrl,
  segIdx,
  skillIdx,
  displaySegments,
  blockId,
  updateBlockSettings,
  onSkillUrlChange,
  previewStyle,
}: {
  id: string;
  value: string;
  skillUrl: string;
  segIdx: number;
  skillIdx: number;
  displaySegments: Array<{ name?: string; skills?: string[]; skillUrls?: string[]; icon?: string }>;
  blockId: string;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  onSkillUrlChange: (idx: number, url: string) => void;
  previewStyle: SegmentPreviewStyle;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const {
    segmentDesign,
    skillColor,
    skillSize,
    skillFontWeight,
    skillTextColor,
    skillTextCustomColor,
    skillCustomColor,
    skillBorderRadius,
    theme,
  } = previewStyle;

  const getSkillColorStyle = (): React.CSSProperties => {
    const bg = skillCustomColor
      ? skillCustomColor
      : skillColor === "primary"
        ? theme.primary
        : skillColor === "neutral"
          ? "#e4e4e7"
          : theme.accent;
    let textColor: string | undefined;
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
  const uniformItemClass = previewStyle.skillUniformWidth ? "flex justify-center items-center w-full min-w-0" : "";

  const inputClass =
    "min-w-[5rem] max-w-full flex-1 shrink border-0 bg-transparent p-0 outline-none focus:ring-0 text-inherit placeholder:text-zinc-400/80";

  const skillDisplayValue = typeof value === "string" ? value : String(value ?? "");
  const renderSkillInput = () => (
    <input
      value={skillDisplayValue}
      className={`${inputClass} ${skillWeightClass}`}
      onChange={(e) => {
        const n = [...displaySegments];
        const skills = [...(n[segIdx].skills ?? [])];
        skills[skillIdx] = e.target.value;
        n[segIdx] = { ...n[segIdx], skills };
        updateBlockSettings(blockId, { segments: n, items: undefined });
      }}
      placeholder="Skill name"
    />
  );

  const dragHandle = (
    <span
      className="flex shrink-0 cursor-grab items-center justify-center rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-200 active:cursor-grabbing"
      {...attributes}
      {...listeners}
      title="Drag to reorder"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </span>
  );
  const deleteBtn = (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const n = [...displaySegments];
        const skills = (n[segIdx].skills ?? []).filter((_, i) => i !== skillIdx);
        const urls = (n[segIdx].skillUrls ?? []).filter((_, i) => i !== skillIdx);
        n[segIdx] = { ...n[segIdx], skills, skillUrls: urls };
        updateBlockSettings(blockId, { segments: n });
      }}
      className="flex shrink-0 items-center justify-center rounded border border-zinc-300 bg-zinc-100 p-0.5 text-zinc-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      aria-label="Remove skill"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  );

  const [urlExpanded, setUrlExpanded] = useState(!!skillUrl);
  const linkInput = (
    <span className="flex shrink-0 items-center">
      {urlExpanded ? (
        <span
          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 shadow-sm"
          title="Optional link URL"
        >
          <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
          <input
            type="url"
            value={skillUrl}
            onChange={(e) => onSkillUrlChange(skillIdx, e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="https://..."
            className="w-28 min-w-0 shrink-0 border-0 bg-transparent p-0 text-xs text-zinc-600 outline-none placeholder:text-zinc-400 focus:ring-0"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUrlExpanded(false);
            }}
            className="shrink-0 text-zinc-400 hover:text-zinc-600"
            title="Collapse URL field"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setUrlExpanded(true);
          }}
          className="flex items-center justify-center rounded border border-zinc-200 bg-white p-1.5 shadow-sm hover:bg-zinc-50"
          title="Add optional link URL"
        >
          <Link2 className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      )}
    </span>
  );
  const badgeContent = (
    <span
      className={`inline-flex min-h-[2rem] min-w-0 flex-1 items-center gap-2 ${skillWeightClass} ${skillRadiusClass || "rounded-md"} ${sizeClass} ${uniformItemClass} ${
        skillColor === "neutral" && !skillCustomColor ? "border border-zinc-300 bg-zinc-100 text-zinc-700" : ""
      }`}
      style={skillColor === "neutral" && !skillCustomColor ? undefined : colorStyle}
    >
      {renderSkillInput()}
      {linkInput}
      {deleteBtn}
    </span>
  );

  const transformStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (segmentDesign === "badges") {
    return (
      <div
        ref={setNodeRef}
        style={transformStyle}
        className={`flex min-w-0 w-full items-center gap-2 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        {dragHandle}
        <span className="min-w-0 flex-1">{badgeContent}</span>
      </div>
    );
  }
  if (segmentDesign === "pills") {
    return (
      <div
        ref={setNodeRef}
        style={transformStyle}
        className={`flex min-w-0 w-full items-center gap-2 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        {dragHandle}
        <span
          className={`inline-flex min-h-[2rem] min-w-0 flex-1 items-center gap-2 ${skillWeightClass} ${skillRadiusClass || "rounded-full"} ${sizeClass} ${uniformItemClass}`}
          style={colorStyle}
        >
          {renderSkillInput()}
          {linkInput}
          {deleteBtn}
        </span>
      </div>
    );
  }
  if (segmentDesign === "cards") {
    return (
      <div
        ref={setNodeRef}
        style={transformStyle}
        className={`flex min-w-0 w-full items-center gap-2 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        {dragHandle}
        <Card
          variant="outlined"
          className={`flex min-h-[2.5rem] min-w-0 flex-1 items-center gap-2 px-4 py-2 ${skillWeightClass} ${skillSize === "sm" ? "text-xs" : skillSize === "lg" ? "text-base" : "text-sm"}`}
          style={
            skillColor !== "neutral" || skillCustomColor
              ? { backgroundColor: colorStyle.backgroundColor, color: colorStyle.color, borderColor: colorStyle.backgroundColor }
              : undefined
          }
        >
          {renderSkillInput()}
          {linkInput}
          {deleteBtn}
        </Card>
      </div>
    );
  }
  if (segmentDesign === "list") {
    return (
      <li
        ref={setNodeRef}
        style={transformStyle}
        className={`flex min-w-0 list-none items-center gap-2 py-1 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        {dragHandle}
        <span className={`min-w-0 flex-1 text-zinc-700 ${skillWeightClass}`}>
          {renderSkillInput()}
        </span>
        {linkInput}
        {deleteBtn}
      </li>
    );
  }
  if (segmentDesign === "compact") {
    return (
      <div
        ref={setNodeRef}
        style={transformStyle}
        className={`flex min-w-0 w-full items-center gap-2 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        {dragHandle}
        <span
          className={`inline-flex min-h-[2rem] min-w-0 flex-1 items-center gap-2 border border-zinc-300 bg-zinc-50 text-zinc-700 ${skillWeightClass} ${skillRadiusClass || "rounded"} ${sizeClass} ${uniformItemClass}`}
          style={
            skillCustomColor
              ? { backgroundColor: skillCustomColor, color: skillTextColor === "custom" ? skillTextCustomColor : "white", borderColor: "transparent" }
              : undefined
          }
        >
          {renderSkillInput()}
          {linkInput}
          {deleteBtn}
        </span>
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={transformStyle}
      className={`flex min-w-0 w-full items-center gap-2 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      {dragHandle}
      <span className="min-w-0 flex-1">{badgeContent}</span>
    </div>
  );
}

export function SkillsBlockSettings({
  block,
  updateBlockSettings,
  theme,
  FONT_OPTIONS,
  selectedComponent = null,
  onClearSelection,
}: SkillsBlockSettingsProps) {
  const [importLoading, setImportLoading] = useState(false);
  const show = (...components: SkillsComponentType[]) =>
    !selectedComponent || components.includes(selectedComponent);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const segments = Array.isArray(block.settings.segments)
    ? (block.settings.segments as Array<{ name?: string; skills?: string[]; icon?: string }>)
    : [];
  const legacyItems = Array.isArray(block.settings.items)
    ? (block.settings.items as Array<{ name?: string; category?: string }>)
    : [];
  const hasLegacy = legacyItems.length > 0 && segments.length === 0;
  const displaySegments = hasLegacy
    ? (() => {
        const byCategory = new Map<string, string[]>();
        for (const i of legacyItems) {
          const cat = (i.category ?? "").trim() || "Skills";
          if (!byCategory.has(cat)) byCategory.set(cat, []);
          if ((i.name ?? "").trim()) byCategory.get(cat)!.push(i.name!.trim());
        }
        return Array.from(byCategory.entries()).map(([name, skills]) => ({ name, skills }));
      })()
    : segments;

  const handleSegmentDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const segmentIds = displaySegments.map((_, i) => `seg-${i}`);
      const fromIdx = segmentIds.indexOf(String(active.id));
      const toIdx = segmentIds.indexOf(String(over.id));
      if (fromIdx < 0 || toIdx < 0) return;
      const n = arrayMove(displaySegments, fromIdx, toIdx);
      updateBlockSettings(block.id, { segments: n, items: undefined });
    },
    [displaySegments, block.id, updateBlockSettings]
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
              placeholder="Add segments below or from your admin profile."
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Data source</label>
            <select
              value={String(block.settings.skillsDataSource ?? "auto")}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  skillsDataSource: e.target.value as "auto" | "block" | "profile",
                })
              }
              className={SELECT_COMPACT}
            >
              <option value="auto">Auto (block → profile)</option>
              <option value="block">Block only (manual segments)</option>
              <option value="profile">Profile only (from API)</option>
            </select>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {String(block.settings.skillsDataSource ?? "auto") === "profile"
                ? "Skills come from your profile only. Segments below are ignored."
                : String(block.settings.skillsDataSource ?? "auto") === "block"
                  ? "Only manual segments below are shown. Profile skills are ignored."
                  : "Auto: use block segments, or profile skills if empty"}
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
                const data = (await res.json()) as { skills?: { name: string; category: string | null }[] };
                const apiSkills = data.skills ?? [];
                if (apiSkills.length === 0) {
                  toast.info("No skills in profile");
                  return;
                }
                const byCategory = new Map<string, string[]>();
                for (const s of apiSkills) {
                  const cat = (s.category ?? "").trim() || "Skills";
                  if (!byCategory.has(cat)) byCategory.set(cat, []);
                  byCategory.get(cat)!.push(s.name);
                }
                const segments = Array.from(byCategory.entries()).map(([name, skills]) => ({
                  name,
                  skills,
                  icon: undefined as string | undefined,
                }));
                updateBlockSettings(block.id, { segments, items: undefined, skillsDataSource: "block" });
                toast.success(`Imported ${apiSkills.length} skills into ${segments.length} segments`);
              } catch {
                toast.error("Failed to import skills");
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
        <InlineExpand label="Title & Subtitle" defaultOpen={!!selectedComponent && (selectedComponent === "title" || selectedComponent === "subtitle")}>
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLASS}>Alignment</label>
              <select
                value={String(block.settings.skillsHeaderAlign ?? "left")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillsHeaderAlign: e.target.value as "left" | "center" | "right",
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
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Title typography</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={LABEL_CLASS}>Font</label>
                  <select
                    value={String(block.settings.skillsTitleFontFamily ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsTitleFontFamily: e.target.value })}
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
                    value={String(block.settings.skillsTitleFontSize ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsTitleFontSize: e.target.value })}
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
                    value={String(block.settings.skillsTitleFontWeight ?? "bold")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsTitleFontWeight: e.target.value })}
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
                    value={String(block.settings.skillsTitleColor ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsTitleColor: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="primary">Primary</option>
                    <option value="accent">Accent</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {String(block.settings.skillsTitleColor ?? "inherit") === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.skillsTitleCustomColor ?? "")) ? String(block.settings.skillsTitleCustomColor) : theme.accent}
                      onChange={(e) => updateBlockSettings(block.id, { skillsTitleCustomColor: e.target.value })}
                      className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                    />
                  </div>
                  <Input
                    value={String(block.settings.skillsTitleCustomColor ?? theme.accent)}
                    onChange={(e) => updateBlockSettings(block.id, { skillsTitleCustomColor: e.target.value })}
                    placeholder="#18181b"
                    className="h-9 flex-1 font-mono text-sm"
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">Subtitle typography</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={LABEL_CLASS}>Weight</label>
                  <select
                    value={String(block.settings.skillsSubtitleFontWeight ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsSubtitleFontWeight: e.target.value })}
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
                    value={String(block.settings.skillsSubtitleFontFamily ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsSubtitleFontFamily: e.target.value })}
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
                    value={String(block.settings.skillsSubtitleFontSize ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsSubtitleFontSize: e.target.value })}
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
                    value={String(block.settings.skillsSubtitleColor ?? "inherit")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsSubtitleColor: e.target.value })}
                    className={SELECT_COMPACT}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="primary">Primary</option>
                    <option value="accent">Accent</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {String(block.settings.skillsSubtitleColor ?? "inherit") === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.skillsSubtitleCustomColor ?? "")) ? String(block.settings.skillsSubtitleCustomColor) : "#52525b"}
                      onChange={(e) => updateBlockSettings(block.id, { skillsSubtitleCustomColor: e.target.value })}
                      className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                    />
                  </div>
                  <Input
                    value={String(block.settings.skillsSubtitleCustomColor ?? "#52525b")}
                    onChange={(e) => updateBlockSettings(block.id, { skillsSubtitleCustomColor: e.target.value })}
                    placeholder="#52525b"
                    className="h-9 flex-1 font-mono text-sm"
                  />
                </div>
              )}
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
              <label className={LABEL_CLASS}>Segment layout</label>
              <select
                value={String(block.settings.segmentLayout ?? "vertical")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentLayout: e.target.value as "vertical" | "horizontal",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="vertical">Vertical (stacked)</option>
                <option value="horizontal">Horizontal (side by side)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Segment grid columns</label>
              <Input
                type="number"
                min={1}
                max={6}
                value={String(block.settings.segmentGridColumns ?? 2)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentGridColumns: Math.min(6, Math.max(1, Number(e.target.value) || 2)),
                  })
                }
                placeholder="1–6"
                className="h-9"
              />
              <p className="mt-0.5 text-[10px] text-zinc-500">When horizontal</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Skills grid columns</label>
              <Input
                type="number"
                min={0}
                max={6}
                value={String(block.settings.skillsGridColumns ?? 0)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillsGridColumns: Math.min(6, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                placeholder="0 = auto"
                className="h-9"
              />
              <p className="mt-0.5 text-[10px] text-zinc-500">0 = flex wrap</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Content alignment</label>
              <select
                value={String(block.settings.segmentAlign ?? "left")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentAlign: e.target.value as "left" | "center" | "right",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              <p className="mt-0.5 text-[10px] text-zinc-500">Segments & skills</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Section ID (anchor)</label>
              <Input
                value={String(block.settings.sectionId ?? "")}
                onChange={(e) => updateBlockSettings(block.id, { sectionId: e.target.value })}
                placeholder="e.g. skills"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Header gap</label>
              <select
                value={String(block.settings.headerGap ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, { headerGap: e.target.value as "none" | "sm" | "md" | "lg" })
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
            <div>
              <label className={LABEL_CLASS}>Segment gap</label>
              <select
                value={String(block.settings.segmentGap ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, { segmentGap: e.target.value as "none" | "sm" | "md" | "lg" })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
              <p className="mt-0.5 text-[10px] text-zinc-500">Between segments</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Skills grid (mobile)</label>
              <Input
                type="number"
                min={0}
                max={6}
                value={String(block.settings.skillsGridColumnsMobile ?? 0)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillsGridColumnsMobile: Math.min(6, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                placeholder="0 = same as desktop"
                className="h-9"
              />
              <p className="mt-0.5 text-[10px] text-zinc-500">Override on small screens</p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Segment columns (mobile)</label>
              <Input
                type="number"
                min={1}
                max={6}
                value={String(block.settings.segmentGridColumnsMobile ?? 1)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentGridColumnsMobile: Math.min(6, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
                placeholder="1"
                className="h-9"
              />
              <p className="mt-0.5 text-[10px] text-zinc-500">When horizontal layout</p>
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
                    value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.sectionBgCustomColor ?? "")) ? String(block.settings.sectionBgCustomColor) : "#fafafa"}
                    onChange={(e) => updateBlockSettings(block.id, { sectionBgCustomColor: e.target.value })}
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.sectionBgCustomColor ?? "#fafafa")}
                  onChange={(e) => updateBlockSettings(block.id, { sectionBgCustomColor: e.target.value })}
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
                  updateBlockSettings(block.id, { sectionPadding: e.target.value as "none" | "sm" | "md" | "lg" })
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
                  updateBlockSettings(block.id, { sectionBorder: e.target.value as "none" | "top" | "full" })
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
      </div>

      {/* 4. Skills & Segment title */}
      <div className="space-y-2">
        <p className={SECTION_TITLE}>Skills & Segment title</p>
        <InlineExpand label="Skill appearance">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Style</label>
              <select
                value={String(block.settings.segmentDesign ?? "badges")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentDesign: e.target.value as "badges" | "pills" | "cards" | "list" | "compact",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="badges">Badges</option>
                <option value="pills">Pills</option>
                <option value="cards">Cards</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Skill color</label>
              <select
                value={String(block.settings.skillColor ?? "accent")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillColor: e.target.value as "primary" | "accent" | "neutral",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="primary">Primary</option>
                <option value="accent">Accent</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Skill size</label>
              <select
                value={String(block.settings.skillSize ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillSize: e.target.value as "sm" | "md" | "lg",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={`${LABEL_CLASS} flex items-center gap-2`}>
                <input
                  type="checkbox"
                  checked={Boolean(block.settings.skillUniformWidth ?? false)}
                  onChange={(e) =>
                    updateBlockSettings(block.id, { skillUniformWidth: e.target.checked })
                  }
                  className="rounded border-zinc-300"
                />
                Uniform width (all skills same size)
              </label>
              <p className="mt-0.5 text-[10px] text-zinc-500">
                Makes each skill badge/pill the same width for a consistent look.
              </p>
            </div>
            <div>
              <label className={LABEL_CLASS}>Font weight</label>
              <select
                value={String(block.settings.skillFontWeight ?? "medium")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillFontWeight: e.target.value as "normal" | "medium" | "semibold" | "bold",
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
              <label className={LABEL_CLASS}>Text color</label>
              <select
                value={String(block.settings.skillTextColor ?? "auto")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillTextColor: e.target.value as "auto" | "white" | "black" | "custom",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="auto">Auto (contrast)</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {String(block.settings.skillTextColor ?? "auto") === "custom" && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.skillTextCustomColor ?? "")) ? String(block.settings.skillTextCustomColor) : "#ffffff"}
                    onChange={(e) => updateBlockSettings(block.id, { skillTextCustomColor: e.target.value })}
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.skillTextCustomColor ?? "#ffffff")}
                  onChange={(e) => updateBlockSettings(block.id, { skillTextCustomColor: e.target.value })}
                  placeholder="#ffffff"
                  className="h-9 flex-1 font-mono text-sm"
                />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>Custom background</label>
              <select
                value={String(block.settings.skillCustomColor ?? "").trim() ? "custom" : "default"}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    updateBlockSettings(block.id, { skillCustomColor: theme.accent });
                  } else {
                    updateBlockSettings(block.id, { skillCustomColor: "" });
                  }
                }}
                className={SELECT_COMPACT}
              >
                <option value="default">Use color preset</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {String(block.settings.skillCustomColor ?? "").trim() && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.skillCustomColor ?? "")) ? String(block.settings.skillCustomColor) : theme.accent}
                    onChange={(e) => updateBlockSettings(block.id, { skillCustomColor: e.target.value })}
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.skillCustomColor ?? theme.accent)}
                  onChange={(e) => updateBlockSettings(block.id, { skillCustomColor: e.target.value })}
                  placeholder="#6366f1"
                  className="h-9 flex-1 font-mono text-sm"
                />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>Border radius</label>
              <select
                value={String(block.settings.skillBorderRadius ?? "md")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillBorderRadius: e.target.value as "none" | "sm" | "md" | "lg" | "full",
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
              <label className={LABEL_CLASS}>Hover effect</label>
              <select
                value={String(block.settings.skillHoverEffect ?? "subtle")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    skillHoverEffect: e.target.value as "none" | "subtle" | "lift" | "glow",
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
              <label className={LABEL_CLASS}>Max skills per segment</label>
              <Input
                type="number"
                min={0}
                value={String(block.settings.maxSkillsPerSegment ?? 0)}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    maxSkillsPerSegment: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                placeholder="0 = no limit"
                className="h-9"
              />
            </div>
          </div>
        </InlineExpand>
        <InlineExpand label="Segment title" defaultOpen={!!selectedComponent && selectedComponent === "segments"}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Font</label>
              <select
                value={String(block.settings.segmentTitleFontFamily ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { segmentTitleFontFamily: e.target.value })}
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
                value={String(block.settings.segmentTitleFontSize ?? "inherit")}
                onChange={(e) => updateBlockSettings(block.id, { segmentTitleFontSize: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="inherit">Inherit</option>
                <option value="sm">Small</option>
                <option value="base">Base</option>
                <option value="lg">Large</option>
                <option value="xl">XL</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight</label>
              <select
                value={String(block.settings.segmentTitleFontWeight ?? "semibold")}
                onChange={(e) => updateBlockSettings(block.id, { segmentTitleFontWeight: e.target.value })}
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
                value={String(block.settings.segmentTitleColor ?? "accent")}
                onChange={(e) => updateBlockSettings(block.id, { segmentTitleColor: e.target.value })}
                className={SELECT_COMPACT}
              >
                <option value="accent">Accent</option>
                <option value="primary">Primary</option>
                <option value="inherit">Inherit</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          {String(block.settings.segmentTitleColor ?? "accent") === "custom" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.segmentTitleCustomColor ?? "")) ? String(block.settings.segmentTitleCustomColor) : theme.accent}
                  onChange={(e) => updateBlockSettings(block.id, { segmentTitleCustomColor: e.target.value })}
                  className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                />
              </div>
              <Input
                value={String(block.settings.segmentTitleCustomColor ?? theme.accent)}
                onChange={(e) => updateBlockSettings(block.id, { segmentTitleCustomColor: e.target.value })}
                placeholder="#6366f1"
                className="h-9 flex-1 font-mono text-sm"
              />
            </div>
          )}
          <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Design</p>
          <div className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Background</label>
              <select
                value={String(block.settings.segmentTitleBgColor ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentTitleBgColor: e.target.value as "none" | "accent" | "primary" | "custom",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="accent">Accent</option>
                <option value="primary">Primary</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {String(block.settings.segmentTitleBgColor ?? "none") === "custom" && (
              <div className="flex items-center gap-2">
                <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.segmentTitleBgCustomColor ?? "")) ? String(block.settings.segmentTitleBgCustomColor) : "#f4f4f5"}
                    onChange={(e) => updateBlockSettings(block.id, { segmentTitleBgCustomColor: e.target.value })}
                    className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                  />
                </div>
                <Input
                  value={String(block.settings.segmentTitleBgCustomColor ?? "#f4f4f5")}
                  onChange={(e) => updateBlockSettings(block.id, { segmentTitleBgCustomColor: e.target.value })}
                  placeholder="#f4f4f5"
                  className="h-9 flex-1 font-mono text-sm"
                />
              </div>
            )}
            <div>
              <label className={LABEL_CLASS}>Padding</label>
              <select
                value={String(block.settings.segmentTitlePadding ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentTitlePadding: e.target.value as "none" | "sm" | "md" | "lg",
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
              <label className={LABEL_CLASS}>Border radius</label>
              <select
                value={String(block.settings.segmentTitleBorderRadius ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentTitleBorderRadius: e.target.value as "none" | "sm" | "md" | "lg" | "full",
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
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLASS}>Border</label>
              <select
                value={String(block.settings.segmentTitleBorder ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentTitleBorder: e.target.value as "none" | "sm" | "md" | "lg",
                  })
                }
                className={SELECT_COMPACT}
              >
                <option value="none">None</option>
                <option value="sm">Thin</option>
                <option value="md">Medium</option>
                <option value="lg">Thick</option>
              </select>
            </div>
            {String(block.settings.segmentTitleBorder ?? "none") !== "none" && (
              <>
                <div>
                  <label className={LABEL_CLASS}>Border color</label>
                  <select
                    value={String(block.settings.segmentTitleBorderColor ?? "accent")}
                    onChange={(e) =>
                      updateBlockSettings(block.id, {
                        segmentTitleBorderColor: e.target.value as "accent" | "primary" | "neutral" | "custom",
                      })
                    }
                    className={SELECT_COMPACT}
                  >
                    <option value="accent">Accent</option>
                    <option value="primary">Primary</option>
                    <option value="neutral">Neutral</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {String(block.settings.segmentTitleBorderColor ?? "accent") === "custom" && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <div className="h-9 w-12 shrink-0 overflow-hidden rounded border border-zinc-300 flex">
                      <input
                        type="color"
                        value={/^#[0-9A-Fa-f]{6}$/.test(String(block.settings.segmentTitleBorderCustomColor ?? "")) ? String(block.settings.segmentTitleBorderCustomColor) : theme.accent}
                        onChange={(e) => updateBlockSettings(block.id, { segmentTitleBorderCustomColor: e.target.value })}
                        className="h-full w-full min-h-0 cursor-pointer border-0 bg-transparent p-0 block"
                      />
                    </div>
                    <Input
                      value={String(block.settings.segmentTitleBorderCustomColor ?? theme.accent)}
                      onChange={(e) => updateBlockSettings(block.id, { segmentTitleBorderCustomColor: e.target.value })}
                      placeholder="#6366f1"
                      className="h-9 flex-1 font-mono text-sm"
                    />
                  </div>
                )}
              </>
            )}
            <div>
              <label className={LABEL_CLASS}>Shadow</label>
              <select
                value={String(block.settings.segmentTitleShadow ?? "none")}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    segmentTitleShadow: e.target.value as "none" | "sm" | "md" | "lg",
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
          </div>
        </InlineExpand>
      </div>

      {/* 5. Segments */}
      {show("segments") && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-600">Segments</p>
            {displaySegments.length > 0 && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                {displaySegments.length} segment{displaySegments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="mb-3 text-[11px] text-zinc-500">
            Preview matches public view. Drag to reorder, click to edit.
          </p>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          {displaySegments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-white py-12 text-center">
              <p className="mb-1 text-sm font-medium text-zinc-600">No segments yet</p>
              <p className="mb-4 text-xs text-zinc-500">Add segments manually or import from your profile</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  onClick={() =>
                    updateBlockSettings(block.id, {
                      segments: [{ name: "", skills: [] }],
                      items: undefined,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add first segment
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
                      const data = (await res.json()) as { skills?: { name: string; category: string | null }[] };
                      const apiSkills = data.skills ?? [];
                      if (apiSkills.length === 0) {
                        toast.info("No skills in profile");
                        return;
                      }
                      const byCategory = new Map<string, string[]>();
                      for (const s of apiSkills) {
                        const cat = (s.category ?? "").trim() || "Skills";
                        if (!byCategory.has(cat)) byCategory.set(cat, []);
                        byCategory.get(cat)!.push(s.name);
                      }
                      const segments = Array.from(byCategory.entries()).map(([name, skills]) => ({
                        name,
                        skills,
                        icon: undefined as string | undefined,
                      }));
                      updateBlockSettings(block.id, { segments, items: undefined, skillsDataSource: "block" });
                      toast.success(`Imported ${apiSkills.length} skills into ${segments.length} segments`);
                    } catch {
                      toast.error("Failed to import skills");
                    } finally {
                      setImportLoading(false);
                    }
                  }}
                >
                  {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Import from profile
                </button>
              </div>
            </div>
          ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSegmentDragEnd}>
            <SortableContext
              items={displaySegments.map((_, i) => `seg-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {displaySegments.map((seg, segIdx) => (
                  <SortableSegmentItem
                    key={`seg-${segIdx}`}
                    id={`seg-${segIdx}`}
                    segment={seg}
                    segIdx={segIdx}
                    displaySegments={displaySegments}
                    blockId={block.id}
                    updateBlockSettings={updateBlockSettings}
                    previewStyle={{
                      segmentDesign: String(block.settings.segmentDesign ?? "badges"),
                      skillColor: String(block.settings.skillColor ?? "accent"),
                      skillSize: String(block.settings.skillSize ?? "md"),
                      skillUniformWidth: Boolean(block.settings.skillUniformWidth ?? false),
                      segmentTitleColor: String(block.settings.segmentTitleColor ?? "accent"),
                      segmentTitleCustomColor: String(block.settings.segmentTitleCustomColor ?? "").trim() || theme.accent,
                      segmentTitleBgColor: String(block.settings.segmentTitleBgColor ?? "none"),
                      segmentTitleBgCustomColor: String(block.settings.segmentTitleBgCustomColor ?? "").trim() || "#f4f4f5",
                      segmentTitlePadding: String(block.settings.segmentTitlePadding ?? "none"),
                      segmentTitleBorderRadius: String(block.settings.segmentTitleBorderRadius ?? "none"),
                      segmentTitleBorder: String(block.settings.segmentTitleBorder ?? "none"),
                      segmentTitleBorderColor: String(block.settings.segmentTitleBorderColor ?? "accent"),
                      segmentTitleBorderCustomColor: String(block.settings.segmentTitleBorderCustomColor ?? "").trim() || theme.accent,
                      segmentTitleShadow: String(block.settings.segmentTitleShadow ?? "none"),
                      segmentTitleFontWeight: String(block.settings.segmentTitleFontWeight ?? "semibold"),
                      skillFontWeight: String(block.settings.skillFontWeight ?? "medium"),
                      skillTextColor: String(block.settings.skillTextColor ?? "auto"),
                      skillTextCustomColor: String(block.settings.skillTextCustomColor ?? "").trim() || "#ffffff",
                      skillCustomColor: String(block.settings.skillCustomColor ?? "").trim(),
                      skillBorderRadius: String(block.settings.skillBorderRadius ?? "md"),
                      theme,
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          )}
          </div>
          {displaySegments.length > 0 && (
          <button
            type="button"
            className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
            onClick={() =>
              updateBlockSettings(block.id, {
                segments: [...displaySegments, { name: "", skills: [] }],
                items: undefined,
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add segment
          </button>
          )}
        </div>
      )}
    </div>
  );
}
