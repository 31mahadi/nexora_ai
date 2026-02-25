"use client";

import { Button } from "@nexora/ui";
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
import { GripVertical } from "lucide-react";
import type { BuilderBlock } from "@nexora/portfolio-builder";

export type HeroComponentType = "badge" | "title" | "subtitle" | "avatar" | "ctas" | "cta1" | "cta2";

const ORDER_KEYS = ["badge", "title", "subtitle", "avatar", "ctas"] as const;
const DEFAULT_ORDER: readonly string[] = ["badge", "title", "subtitle", "avatar", "ctas"];

const COMPONENT_LABELS: Record<string, string> = {
  badge: "Badge",
  title: "Title",
  subtitle: "Subtitle",
  avatar: "Avatar",
  ctas: "CTAs",
  cta1: "Primary CTA",
  cta2: "Secondary CTA",
};

export interface HeroDesignCanvasProps {
  block: BuilderBlock;
  selectedComponent: HeroComponentType | null;
  onSelectComponent: (component: HeroComponentType | null) => void;
  onOrderChange: (order: string[]) => void;
  theme: { primary: string; accent: string };
}

function getOrder(block: BuilderBlock): string[] {
  const raw = block.settings.heroComponentOrder;
  if (!Array.isArray(raw)) return [...DEFAULT_ORDER];
  const valid = new Set(ORDER_KEYS);
  const filtered = raw.filter((v) => typeof v === "string" && valid.has(v as (typeof ORDER_KEYS)[number]));
  const missing = DEFAULT_ORDER.filter((c) => !filtered.includes(c));
  return [...filtered, ...missing].slice(0, 5);
}

function SortableItem({
  id,
  selected,
  onClick,
}: {
  id: string;
  selected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border-2 transition-colors ${
        selected
          ? "border-indigo-500 bg-indigo-50"
          : "border-transparent hover:border-zinc-300 hover:bg-zinc-50"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 p-2 text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onClick}
        className="flex-1 py-2.5 pl-1 pr-3 text-left text-sm font-medium text-zinc-700"
      >
        {COMPONENT_LABELS[id] ?? id}
      </button>
    </div>
  );
}

export function HeroDesignCanvas({
  block,
  selectedComponent,
  onSelectComponent,
  onOrderChange,
  theme,
}: HeroDesignCanvasProps) {
  const order = getOrder(block);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(order, oldIndex, newIndex);
    onOrderChange(next);
  };

  const isOrderItemSelected = (id: string) =>
    selectedComponent === id || (id === "ctas" && (selectedComponent === "cta1" || selectedComponent === "cta2"));

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        Click to select · Drag to reorder
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {order.map((id) => (
              <SortableItem
                key={id}
                id={id}
                selected={isOrderItemSelected(id)}
                onClick={() =>
                  onSelectComponent(
                    isOrderItemSelected(id) ? null : (id === "ctas" ? "cta1" : (id as HeroComponentType))
                  )
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
