"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ArrowIconType = "chevron" | "arrow" | "arrow-circle" | "caret";

export type CarouselTransitionType = "fade" | "slide" | "zoom" | "instant";

function useScrollPosition(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

interface HeroBackgroundProps {
  /** Image carousel URLs */
  images?: string[];
  /** Video background URL (alternative to images) */
  videoUrl?: string;
  overlayOpacity?: number;
  overlayType?: "solid" | "gradient";
  heroParallax?: boolean;
  heroVideoOverlayType?: "none" | "solid" | "gradient";
  heroVideoOverlayOpacity?: number;
  /** Vertical alignment of content when full-height: top, center, or bottom */
  contentVerticalAlign?: "top" | "center" | "bottom";
  /** Whether video autoplays (default true) */
  heroVideoAutoplay?: boolean;
  heightClassName?: string;
  paddingClassName?: string;
  sectionBorderClass?: string;
  sectionBorderStyle?: React.CSSProperties;
  sectionId?: string;
  duration?: number;
  transitionDuration?: number;
  /** Transition type when switching slides: fade, slide, zoom, or instant */
  transitionType?: CarouselTransitionType;
  showDots?: boolean;
  showArrows?: boolean;
  arrowsColor?: string;
  arrowsCustomColor?: string;
  dotsColor?: string;
  dotsCustomColor?: string;
  accentColor?: string;
  arrowIcon?: ArrowIconType;
  arrowSize?: "sm" | "md" | "lg";
  dotsSize?: "sm" | "md" | "lg";
  children: ReactNode;
}

function ArrowLeft({ icon, className }: { icon: ArrowIconType; className?: string }) {
  const base = "stroke-current";
  if (icon === "arrow") {
    return (
      <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    );
  }
  if (icon === "arrow-circle") {
    return (
      <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M14 16l-4-4 4-4" />
      </svg>
    );
  }
  if (icon === "caret") {
    return (
      <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    );
  }
  return (
    <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRight({ icon, className }: { icon: ArrowIconType; className?: string }) {
  const base = "stroke-current";
  if (icon === "arrow") {
    return (
      <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    );
  }
  if (icon === "arrow-circle") {
    return (
      <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8l4 4-4 4" />
      </svg>
    );
  }
  if (icon === "caret") {
    return (
      <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }
  return (
    <svg className={`${base} ${className ?? ""}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function resolveNavColor(key: string, customVal: string, accentColor: string): string {
  if (key === "custom") return customVal || "#ffffff";
  if (key === "accent") return accentColor || "#6366f1";
  if (key === "light") return "rgba(255,255,255,0.7)";
  return "#ffffff";
}

export function HeroBackground({
  images = [],
  videoUrl,
  overlayOpacity = 55,
  overlayType = "solid",
  heroParallax = false,
  heroVideoOverlayType = "solid",
  heroVideoOverlayOpacity = 55,
  contentVerticalAlign = "center",
  heroVideoAutoplay = true,
  heightClassName = "min-h-[440px]",
  paddingClassName = "px-6 pt-24 pb-16",
  sectionBorderClass = "",
  sectionBorderStyle,
  sectionId,
  duration = 5,
  transitionDuration = 700,
  transitionType = "fade",
  showDots = true,
  showArrows = true,
  arrowsColor = "white",
  arrowsCustomColor = "#ffffff",
  dotsColor = "same",
  dotsCustomColor = "#ffffff",
  accentColor = "#6366f1",
  arrowIcon = "chevron",
  arrowSize = "md",
  dotsSize = "md",
  children,
}: HeroBackgroundProps) {
  const scrollY = useScrollPosition();
  const validImages = useMemo(() => images.map((i) => String(i).trim()).filter(Boolean), [images]);
  const hasVideo = Boolean(videoUrl?.trim());
  const [activeIndex, setActiveIndex] = useState(0);
  const parallaxOffset = heroParallax ? scrollY * 0.3 : 0;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + validImages.length) % validImages.length);
    },
    [validImages.length],
  );

  useEffect(() => {
    if (validImages.length < 2) return;
    const intervalMs = Math.max(1, duration) * 1000;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [validImages, duration]);

  const overlayOpacityVal = Math.min(100, Math.max(0, overlayOpacity)) / 100;
  const videoOverlayOpacityVal = Math.min(100, Math.max(0, heroVideoOverlayOpacity)) / 100;
  const transitionMs = transitionType === "instant" ? 0 : Math.max(0, transitionDuration);
  const hasCarousel = validImages.length > 0;
  const hasMultiple = validImages.length >= 2;

  const arrowsColorVal = resolveNavColor(arrowsColor, arrowsCustomColor, accentColor);
  const dotsColorKey = dotsColor === "same" ? arrowsColor : dotsColor;
  const dotsColorVal = resolveNavColor(dotsColorKey, dotsCustomColor, accentColor);

  const arrowSizeClass = arrowSize === "sm" ? "h-5 w-5" : arrowSize === "lg" ? "h-8 w-8" : "h-6 w-6";
  const arrowBtnClass = arrowSize === "sm" ? "p-1.5" : arrowSize === "lg" ? "p-3" : "p-2";
  const contentAlignClass =
    contentVerticalAlign === "top" ? "justify-start" : contentVerticalAlign === "bottom" ? "justify-end" : "justify-center";

  const getDotSizeClass = (active: boolean) => {
    if (dotsSize === "sm") return active ? "h-1.5 w-4" : "h-1.5 w-1.5";
    if (dotsSize === "lg") return active ? "h-2.5 w-8" : "h-2.5 w-2.5";
    return active ? "h-2 w-6" : "h-2 w-2";
  };

  const renderOverlay = () => {
    if (overlayType === "gradient") {
      return (
        <div
          className="absolute inset-0 z-20"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,${overlayOpacityVal * 0.3}) 50%, rgba(0,0,0,${overlayOpacityVal}) 100%)`,
          }}
          aria-hidden
        />
      );
    }
    return (
      <div
        className="absolute inset-0 z-20 bg-zinc-950"
        style={{ opacity: overlayOpacityVal }}
        aria-hidden
      />
    );
  };

  const renderVideoOverlay = () => {
    if (heroVideoOverlayType === "none") return null;
    if (heroVideoOverlayType === "gradient") {
      return (
        <div
          className="absolute inset-0 z-20"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,${videoOverlayOpacityVal * 0.3}) 50%, rgba(0,0,0,${videoOverlayOpacityVal}) 100%)`,
          }}
          aria-hidden
        />
      );
    }
    return (
      <div
        className="absolute inset-0 z-20 bg-zinc-950"
        style={{ opacity: videoOverlayOpacityVal }}
        aria-hidden
      />
    );
  };

  const hasBackground = hasVideo || hasCarousel;

  if (!hasBackground) {
    return (
      <div
        id={sectionId}
        className={`${paddingClassName} ${heightClassName} ${sectionBorderClass}`}
        style={sectionBorderStyle}
      >
        {children}
      </div>
    );
  }

  return (
    <section
      id={sectionId}
      className={`relative flex min-h-0 flex-col overflow-hidden ${contentAlignClass} ${paddingClassName} ${heightClassName} ${sectionBorderClass}`}
      style={{ ...sectionBorderStyle, backgroundColor: "#0a0a0a" }}
    >
      <div
        className="absolute inset-0 z-0"
        style={
          heroParallax && parallaxOffset
            ? { transform: `translateY(${parallaxOffset * 0.5}px)` }
            : undefined
        }
      >
        {hasVideo ? (
          <div className="absolute inset-0">
            <video
              src={videoUrl}
              autoPlay={heroVideoAutoplay}
              muted
              loop
              playsInline
              className="h-full w-full object-cover object-center"
            />
            {renderVideoOverlay()}
          </div>
        ) : transitionType === "slide" ? (
          <div
            className="absolute inset-0 flex"
            style={{
              width: `${validImages.length * 100}%`,
              transform: `translateX(-${activeIndex * (100 / validImages.length)}%)`,
              transition: `transform ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            {validImages.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="h-full flex-shrink-0"
                style={{ width: `${100 / validImages.length}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        ) : (
          validImages.map((url, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={`${url}-${index}`}
                className={`absolute inset-0 ${isActive ? "z-10" : "z-0"}`}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: transitionType === "zoom" ? (isActive ? "scale(1)" : "scale(1.08)") : undefined,
                  transition:
                    transitionType === "instant"
                      ? "none"
                      : transitionType === "zoom"
                        ? `opacity ${transitionMs}ms ease-out, transform ${transitionMs}ms ease-out`
                        : `opacity ${transitionMs}ms ease-in-out`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })
        )}
        {hasVideo ? null : renderOverlay()}
      </div>

      {hasCarousel && hasMultiple && showArrows && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className={`absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full backdrop-blur-sm transition focus:outline-none focus:ring-2 focus:ring-white/50 md:left-4 ${arrowBtnClass}`}
            style={{ backgroundColor: "rgba(0,0,0,0.25)", color: arrowsColorVal }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.25)"; }}
            aria-label="Previous slide"
          >
            <ArrowLeft icon={arrowIcon} className={arrowSizeClass} />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className={`absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full backdrop-blur-sm transition focus:outline-none focus:ring-2 focus:ring-white/50 md:right-4 ${arrowBtnClass}`}
            style={{ backgroundColor: "rgba(0,0,0,0.25)", color: arrowsColorVal }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.25)"; }}
            aria-label="Next slide"
          >
            <ArrowRight icon={arrowIcon} className={arrowSizeClass} />
          </button>
        </>
      )}

      {hasCarousel && hasMultiple && showDots && (
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center gap-2" role="tablist" aria-label="Carousel navigation">
          {validImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goTo(idx)}
              className={`rounded-full transition-all ${getDotSizeClass(idx === activeIndex)}`}
              style={{
                backgroundColor: idx === activeIndex ? dotsColorVal : (dotsColorVal.startsWith("rgba") ? dotsColorVal.replace(/[\d.]+\)$/, "0.5)") : `${dotsColorVal}80`),
              }}
              onMouseEnter={(e) => {
                if (idx !== activeIndex) e.currentTarget.style.backgroundColor = dotsColorVal.startsWith("rgba") ? dotsColorVal.replace(/[\d.]+\)$/, "0.6)") : `${dotsColorVal}99`;
              }}
              onMouseLeave={(e) => {
                if (idx !== activeIndex) e.currentTarget.style.backgroundColor = dotsColorVal.startsWith("rgba") ? dotsColorVal.replace(/[\d.]+\)$/, "0.5)") : `${dotsColorVal}80`;
              }}
            />
          ))}
        </div>
      )}

      <div className={`relative z-30 ${hasCarousel && hasMultiple && showDots ? "pb-8" : ""}`}>{children}</div>
    </section>
  );
}
