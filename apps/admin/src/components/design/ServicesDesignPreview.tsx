"use client";

import { Card } from "@nexora/ui";
import { useCallback, useRef, useState } from "react";
import type { BuilderBlock } from "@nexora/portfolio-builder";
import { SERVICE_ICON_MAP } from "@nexora/portfolio-builder";

export type ServicesComponentType = "title" | "subtitle" | "services";

const COMPONENT_LABELS: Record<ServicesComponentType, string> = {
  title: "Title",
  subtitle: "Subtitle",
  services: "Services",
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

export interface ServicesDesignPreviewProps {
  block: BuilderBlock;
  selectedComponent: ServicesComponentType | null;
  onSelectComponent: (c: ServicesComponentType | null) => void;
  updateBlockSettings: (blockId: string, patch: Record<string, unknown>) => void;
  theme?: { primary: string; accent: string };
  viewportWidth?: number;
}

interface ServiceDisplayItem {
  id: string;
  title: string;
  description: string | null;
  icon?: string;
}

export function ServicesDesignPreview({
  block,
  selectedComponent,
  onSelectComponent,
  theme = { primary: "#0f172a", accent: "#6366f1" },
  viewportWidth = 375,
}: ServicesDesignPreviewProps) {
  const [floatingPanelPos, setFloatingPanelPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const title = String(block.settings.title ?? "Services");
  const subtitle = String(block.settings.subtitle ?? "");
  const columns = Math.min(6, Math.max(1, Number(block.settings.columns ?? 2)));
  const columnsMobile = Math.max(0, Number(block.settings.columnsMobile ?? 0));
  const serviceLayout = String(block.settings.serviceLayout ?? "grid");
  const serviceCardStyle = String(block.settings.serviceCardStyle ?? "bordered");
  const serviceAlignment = String(block.settings.serviceAlignment ?? "left");
  const serviceGap = String(block.settings.serviceGap ?? "md");
  const serviceHoverEffect = String(block.settings.serviceHoverEffect ?? "subtle");
  const serviceTitleFontSize = String(block.settings.serviceTitleFontSize ?? "base");
  const serviceTitleFontWeight = String(block.settings.serviceTitleFontWeight ?? "semibold");
  const serviceDescriptionFontSize = String(block.settings.serviceDescriptionFontSize ?? "sm");
  const serviceDescriptionColor = String(block.settings.serviceDescriptionColor ?? "muted");
  const serviceDescriptionCustomColor = String(block.settings.serviceDescriptionCustomColor ?? "#52525b").trim() || "#52525b";
  const serviceCardBorderRadius = String(block.settings.serviceCardBorderRadius ?? "md");
  const serviceCardBorder = String(block.settings.serviceCardBorder ?? "default");
  const serviceCardBorderColor = String(block.settings.serviceCardBorderColor ?? "neutral");
  const serviceCardBorderCustomColor = String(block.settings.serviceCardBorderCustomColor ?? "#d4d4d8").trim() || "#d4d4d8";
  const serviceCardBgColor = String(block.settings.serviceCardBgColor ?? "default");
  const serviceCardBgCustomColor = String(block.settings.serviceCardBgCustomColor ?? "#ffffff").trim() || "#ffffff";
  const serviceIconPosition = String(block.settings.serviceIconPosition ?? "top");
  const serviceIconAlign = String(block.settings.serviceIconAlign ?? "left");
  const serviceIconSize = String(block.settings.serviceIconSize ?? "md");
  const maxServices = Math.max(0, Number(block.settings.maxServices ?? 0));

  const blockItems = Array.isArray(block.settings.items)
    ? (block.settings.items as Array<{ title?: string; description?: string; icon?: string }>).filter((i) =>
        (i.title ?? "").trim()
      )
    : [];
  const displayItems: ServiceDisplayItem[] = blockItems.map((i, idx) => ({
    id: `block-${idx}`,
    title: i.title ?? "",
    description: i.description ?? null,
    icon: i.icon,
  }));
  const itemsToShow =
    maxServices > 0 ? displayItems.slice(0, maxServices) : displayItems;

  const colClass =
    columns >= 6
      ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      : columns >= 5
        ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        : columns >= 4
          ? "md:grid-cols-2 lg:grid-cols-4"
          : columns >= 3
            ? "md:grid-cols-3"
            : columns <= 1
              ? "md:grid-cols-1"
              : "md:grid-cols-2";
  const baseColClass =
    columnsMobile > 0
      ? columnsMobile <= 1
        ? "grid-cols-1"
        : "grid-cols-1 sm:grid-cols-2"
      : columns <= 1
        ? "grid-cols-1"
        : "grid-cols-1 sm:grid-cols-2";

  const gapClass =
    serviceGap === "none" ? "gap-0" : serviceGap === "sm" ? "gap-2" : serviceGap === "lg" ? "gap-6" : "gap-4";

  const cardClass =
    serviceCardStyle === "elevated"
      ? "border-zinc-200 bg-white shadow-md"
      : serviceCardStyle === "minimal"
        ? "border-0 bg-zinc-50/80"
        : "border-zinc-200 bg-white/80";

  const cardRadiusClass =
    serviceCardBorderRadius === "none"
      ? ""
      : serviceCardBorderRadius === "sm"
        ? "rounded"
        : serviceCardBorderRadius === "lg"
          ? "rounded-lg"
          : serviceCardBorderRadius === "full"
            ? "rounded-full"
            : "rounded-md";

  const cardBgStyle =
    serviceCardBgColor === "custom"
      ? { backgroundColor: serviceCardBgCustomColor }
      : serviceCardBgColor === "subtle"
        ? { backgroundColor: "#f4f4f5" }
        : undefined;

  const cardBorderColorStyle =
    serviceCardBorder !== "none"
      ? serviceCardBorderColor === "custom"
        ? { borderColor: serviceCardBorderCustomColor }
        : serviceCardBorderColor === "primary"
          ? { borderColor: theme.primary }
          : serviceCardBorderColor === "accent"
            ? { borderColor: theme.accent }
            : undefined
      : undefined;

  const iconSizeClass =
    serviceIconSize === "sm" ? "text-lg" : serviceIconSize === "lg" ? "text-3xl" : "text-2xl";
  const iconAlignClass =
    serviceIconAlign === "center" ? "text-center" : serviceIconAlign === "right" ? "text-right" : "text-left";
  const cardStyle = { ...cardBgStyle, ...cardBorderColorStyle };

  const hoverClass =
    serviceHoverEffect === "none"
      ? ""
      : serviceHoverEffect === "lift"
        ? "transition-transform hover:-translate-y-0.5"
        : serviceHoverEffect === "glow"
          ? "transition-shadow hover:shadow-lg"
          : "transition-opacity hover:opacity-90";

  const alignClass =
    serviceAlignment === "center" ? "text-center" : serviceAlignment === "right" ? "text-right" : "text-left";

  const serviceTitleSizeClass =
    serviceTitleFontSize === "sm" ? "text-sm" : serviceTitleFontSize === "lg" ? "text-lg" : "text-base";
  const serviceTitleWeightClass =
    serviceTitleFontWeight === "normal"
      ? "font-normal"
      : serviceTitleFontWeight === "medium"
        ? "font-medium"
        : serviceTitleFontWeight === "bold"
          ? "font-bold"
          : "font-semibold";
  const serviceDescSizeClass =
    serviceDescriptionFontSize === "xs" ? "text-xs" : serviceDescriptionFontSize === "base" ? "text-base" : "text-sm";
  const serviceDescColorStyle =
    serviceDescriptionColor === "custom"
      ? { color: serviceDescriptionCustomColor }
      : serviceDescriptionColor === "muted"
        ? { color: "#52525b" }
        : undefined;

  const titleColor =
    getColor(block, "servicesTitleColor", "servicesTitleCustomColor", theme) || undefined;
  const subtitleColor =
    getColor(block, "servicesSubtitleColor", "servicesSubtitleCustomColor", theme) || undefined;
  const headerAlign = String(block.settings.servicesHeaderAlign ?? "left");
  const headerAlignClass =
    headerAlign === "center" ? "text-center" : headerAlign === "right" ? "text-right" : "text-left";
  const headerGap = String(block.settings.headerGap ?? "md");
  const headerGapClass = headerGap === "none" ? "" : headerGap === "sm" ? "mt-1" : headerGap === "lg" ? "mt-3" : "mt-2";

  const handleElementClick = useCallback(
    (e: React.MouseEvent, component: ServicesComponentType) => {
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
    component: ServicesComponentType;
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

  const renderServiceCard = (service: ServiceDisplayItem) => {
    const iconEmoji = service.icon ? SERVICE_ICON_MAP[service.icon] : null;

    const renderIcon = () =>
      iconEmoji ? (
        <span className={`${iconSizeClass} shrink-0`} aria-hidden>
          {iconEmoji}
        </span>
      ) : null;

    const renderContent = () => (
      <div className={`min-w-0 flex-1 ${alignClass}`}>
        {serviceIconPosition === "top" && iconEmoji && (
          <span className={`mb-2 block ${iconSizeClass} ${iconAlignClass}`} aria-hidden>
            {iconEmoji}
          </span>
        )}
        {serviceIconPosition === "inline" && iconEmoji && (
          <span className={`inline-flex items-center gap-2 ${iconAlignClass}`}>
            {renderIcon()}
            <h3 className={`${serviceTitleSizeClass} ${serviceTitleWeightClass}`}>{service.title}</h3>
          </span>
        )}
        {serviceIconPosition !== "inline" && (
          <h3 className={`${serviceTitleSizeClass} ${serviceTitleWeightClass}`}>{service.title}</h3>
        )}
        {service.description && (
          <p
            className={`mt-2 ${serviceDescSizeClass} ${alignClass}`}
            style={serviceDescColorStyle ?? { color: "#52525b" }}
          >
            {service.description}
          </p>
        )}
      </div>
    );

    return (
      <Card
        key={service.id}
        variant="outlined"
        className={`${cardClass} ${cardRadiusClass} ${hoverClass}`}
        style={cardStyle}
      >
        {serviceIconPosition === "left" && iconEmoji ? (
          <div className="flex gap-3 items-start">
            {renderIcon()}
            {renderContent()}
          </div>
        ) : (
          renderContent()
        )}
      </Card>
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
                className={`text-sm ${headerGapClass}`}
                style={subtitleColor ? { color: subtitleColor } : { color: "#52525b" }}
              >
                {subtitle}
              </p>
            </Selectable>
          )}
        </div>
        {itemsToShow.length > 0 ? (
          serviceLayout === "list" ? (
            <div className={`flex flex-col ${gapClass}`}>
              {itemsToShow.map((service) => (
                <Selectable key={service.id} component="services">
                  {renderServiceCard(service)}
                </Selectable>
              ))}
            </div>
          ) : serviceLayout === "compact" ? (
            <div className={`flex flex-wrap ${gapClass}`}>
              {itemsToShow.map((service) => (
                <Selectable key={service.id} component="services">
                  <Card
                    variant="outlined"
                    className={`px-4 py-2 ${cardClass} ${cardRadiusClass} ${hoverClass}`}
                    style={cardStyle}
                  >
                    <span className={`${serviceTitleSizeClass} ${serviceTitleWeightClass} ${alignClass}`}>
                      {service.icon && SERVICE_ICON_MAP[service.icon] && (
                        <span className={`mr-2 ${iconSizeClass}`}>{SERVICE_ICON_MAP[service.icon]}</span>
                      )}
                      {service.title}
                    </span>
                    {service.description && (
                      <span
                        className={`ml-2 ${serviceDescSizeClass} ${alignClass}`}
                        style={serviceDescColorStyle ?? { color: "#71717a" }}
                      >
                        — {service.description}
                      </span>
                    )}
                  </Card>
                </Selectable>
              ))}
            </div>
          ) : (
            <div className={`grid ${baseColClass} ${gapClass} ${colClass}`}>
              {itemsToShow.map((service) => (
                <Selectable key={service.id} component="services">
                  {renderServiceCard(service)}
                </Selectable>
              ))}
            </div>
          )
        ) : (
          <Selectable component="services">
            <Card variant="outlined" className={cardClass}>
              <p className="text-zinc-600">
                {String(block.settings.emptyMessage ?? "Add services in the settings panel.")}
              </p>
            </Card>
          </Selectable>
        )}
      </div>

      {selectedComponent && floatingPanelPos && (
        <div
          className="absolute z-50 min-w-[200px] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
          style={{ left: floatingPanelPos.x, top: floatingPanelPos.y, transform: "translateX(-50%)" }}
        >
          <p className="mb-2 text-xs font-semibold text-zinc-700">
            {COMPONENT_LABELS[selectedComponent]}
          </p>
          <p className="text-[10px] text-zinc-500">Edit in the settings panel on the left.</p>
        </div>
      )}
    </div>
  );
}
