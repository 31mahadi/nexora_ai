import { Badge, Button, Card } from "@nexora/ui";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { AnalyticsScript } from "@/components/AnalyticsScript";
import { ContactFormBlock } from "@/components/ContactFormBlock";
import { NewsletterBlock } from "@/components/NewsletterBlock";
import { HeroScrollAnimation } from "@/components/HeroScrollAnimation";
import { HeroBackground } from "./HeroBackground";
import {
  getBlockSectionStyle,
  getContainerClass,
  getPaddingClass,
  getBlockSpacingClass,
  getBlockVisibilityClass,
  getBlockDividerClass,
  getBlockAnimationClass,
  parsePortfolioSiteConfig,
  SEGMENT_ICON_MAP,
  SERVICE_ICON_MAP,
  type BuilderBlock,
} from "@nexora/portfolio-builder";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";
const BLOG_MS = process.env.BLOG_MS_URL ?? "http://localhost:3007";
const TENANT_MS = process.env.TENANT_MS_URL ?? "http://localhost:3005";
const DEFAULT_PRIMARY = "#0f172a";
const DEFAULT_ACCENT = "#6366f1";

async function fetchPortfolio(tenantId: string) {
  try {
    const res = await fetch(`${API_BASE}/portfolio`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      portfolio: { bio: string | null; tagline: string | null; avatarUrl: string | null } | null;
      skills: { id: string; name: string; category: string | null }[];
      services: { id: string; title: string; description: string | null }[];
    };
  } catch {
    return null;
  }
}

async function fetchTimeline(tenantId: string) {
  try {
    const res = await fetch(`${API_BASE}/timeline`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as {
      id: string;
      type: string;
      title: string;
      description: string | null;
      date: string;
      tags: string[];
    }[];
  } catch {
    return [];
  }
}

async function fetchBlogs(tenantId: string) {
  try {
    const res = await fetch(`${BLOG_MS}/blogs?published=true`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      publishedAt: string | null;
    }[];
  } catch {
    return [];
  }
}

async function fetchTestimonials(tenantId: string) {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as { id: string; quote: string; author: string; role: string | null }[];
  } catch {
    return [];
  }
}

async function fetchProjects(tenantId: string) {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: { "X-Tenant-Id": tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as {
      id: string;
      title: string;
      description: string | null;
      imageUrl: string | null;
      linkUrl: string | null;
      tags: string[] | null;
    }[];
  } catch {
    return [];
  }
}

function parseTheme(themeHeader: string | null): { primary: string; accent: string } {
  if (!themeHeader) return { primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT };
  try {
    const t = JSON.parse(themeHeader) as Record<string, unknown>;
    return {
      primary: (typeof t.primary === "string" ? t.primary : DEFAULT_PRIMARY) || DEFAULT_PRIMARY,
      accent: (typeof t.accent === "string" ? t.accent : DEFAULT_ACCENT) || DEFAULT_ACCENT,
    };
  } catch {
    return { primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT };
  }
}

function toTitleCase(type: string): string {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const FONT_FAMILY_MAP: Record<string, string> = {
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  georgia: "Georgia, serif",
  playfair: "var(--font-playfair), Georgia, serif",
  "source-sans": "var(--font-source-sans), ui-sans-serif, system-ui, sans-serif",
  system: "ui-sans-serif, system-ui, sans-serif",
};

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const settingsHeader = h.get("x-tenant-settings");
  const tenantName = h.get("x-tenant-name");
  if (!settingsHeader) return { title: "Portfolio - Nexora" };
  try {
    const settings = JSON.parse(settingsHeader) as Record<string, unknown>;
    const site = settings.portfolioSite && typeof settings.portfolioSite === "object"
      ? (settings.portfolioSite as Record<string, unknown>)
      : {};
    const metadata = site.metadata && typeof site.metadata === "object"
      ? (site.metadata as Record<string, unknown>)
      : {};
    const title = typeof metadata.title === "string" && metadata.title
      ? metadata.title
      : tenantName
        ? `${tenantName} - Portfolio`
        : "Portfolio - Nexora";
    const description = typeof metadata.description === "string"
      ? metadata.description
      : "Your AI-powered portfolio";
    const ogImage = typeof metadata.ogImage === "string" && metadata.ogImage
      ? metadata.ogImage
      : undefined;
    return {
      title,
      description,
      openGraph: ogImage ? { images: [ogImage] } : undefined,
    };
  } catch {
    return { title: "Portfolio - Nexora" };
  }
}

function sectionId(block: BuilderBlock): string {
  const sid = block.sectionId ?? (block.settings?.sectionId as string | undefined);
  if (sid && /^[a-z0-9-]+$/i.test(sid)) {
    return sid;
  }
  return `block-${block.id}`;
}

async function fetchSiteConfig(tenantId: string): Promise<{ theme?: unknown; settings?: unknown } | null> {
  try {
    const res = await fetch(`${TENANT_MS}/tenants/site-config`, {
      headers: { "X-Tenant-Id": tenantId },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { theme?: unknown; settings?: unknown };
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  const tenantName = h.get("x-tenant-name");
  const themeHeader = h.get("x-tenant-theme");
  const settingsHeader = h.get("x-tenant-settings");
  const resolveStatus = h.get("x-tenant-resolve-status");

  let siteConfig = parsePortfolioSiteConfig(settingsHeader);
  let theme = parseTheme(themeHeader);

  if (tenantId) {
    const fetched = await fetchSiteConfig(tenantId);
    if (fetched) {
      siteConfig = parsePortfolioSiteConfig(
        fetched.settings ? JSON.stringify(fetched.settings) : null,
      );
      if (fetched.theme && typeof fetched.theme === "object") {
        const t = fetched.theme as { primary?: string; accent?: string };
        theme = {
          primary: t.primary ?? "#0f172a",
          accent: t.accent ?? "#6366f1",
        };
      }
    }
  }

  let portfolioData: Awaited<ReturnType<typeof fetchPortfolio>> = null;
  let timeline: Awaited<ReturnType<typeof fetchTimeline>> = [];
  let blogs: Awaited<ReturnType<typeof fetchBlogs>> = [];
  let testimonials: Awaited<ReturnType<typeof fetchTestimonials>> = [];
  let projects: Awaited<ReturnType<typeof fetchProjects>> = [];
  if (tenantId) {
    [portfolioData, timeline, blogs, testimonials, projects] = await Promise.all([
      fetchPortfolio(tenantId),
      fetchTimeline(tenantId),
      fetchBlogs(tenantId),
      fetchTestimonials(tenantId),
      fetchProjects(tenantId),
    ]);
  }

  const portfolio = portfolioData?.portfolio;
  const skills = portfolioData?.skills ?? [];
  const services = portfolioData?.services ?? [];
  const enabledBlocks = siteConfig.blocks.filter(
    (block) => block.enabled && !block.hidden,
  );

  const fontFamily = siteConfig.fontFamily && FONT_FAMILY_MAP[siteConfig.fontFamily]
    ? FONT_FAMILY_MAP[siteConfig.fontFamily]
    : undefined;
  const themeStyle = {
    "--portfolio-primary": theme.primary,
    "--portfolio-accent": theme.accent,
    fontFamily,
  } as CSSProperties;

  const navItems = enabledBlocks
    .filter((block) => block.type !== "hero" && block.type !== "separator")
    .map((block) => ({
      href: `#${sectionId(block)}`,
      label:
        (typeof block.settings.title === "string" && block.settings.title.trim()) ||
        toTitleCase(block.type),
    }));

  const renderBlock = (block: BuilderBlock) => {
    const style = {
      color: block.style.textColor,
      "--block-accent": block.style.accentColor,
    } as CSSProperties;
    const paddingClass = block.style.blockSpacing
      ? getBlockSpacingClass(block.style.blockSpacing)
      : getPaddingClass(block.style.padding);
    const visibilityClass = getBlockVisibilityClass(block.style.blockVisibility);
    const dividerClass =
      block.style.blockDivider === "line" || block.style.blockDivider === "wave"
        ? getBlockDividerClass(block.style.blockDivider)
        : "border-t border-zinc-200";
    const animationClass = getBlockAnimationClass(block.style.blockAnimation);
    const sectionClass = `${paddingClass} px-6 ${dividerClass} ${visibilityClass} ${animationClass}`.trim();
    const containerClass = getContainerClass(block.style.container);

    if (block.type === "hero") {
      const title = String(block.settings.title ?? portfolio?.tagline ?? `Hello, I'm ${tenantName ?? "your host"}`);
      const subtitle = String(
        block.settings.subtitle ??
          portfolio?.bio ??
          "Connect your subdomain to manage your professional portfolio.",
      );
      const avatarUrl = String(block.settings.avatarUrl ?? portfolio?.avatarUrl ?? "").trim() || null;
      const ctaText = String(block.settings.ctaText ?? "Explore");
      const ctaHref = String(block.settings.ctaHref ?? "#");
      const cta2Text = String(block.settings.cta2Text ?? "").trim();
      const cta2Href = String(block.settings.cta2Href ?? "#");
      const heroBackgroundType = String(block.settings.heroBackgroundType ?? "carousel");
      const heroVideoUrl = String(block.settings.heroVideoUrl ?? "").trim() || undefined;
      const carouselEnabled = Boolean(block.settings.carouselEnabled);
      const carouselImages = Array.isArray(block.settings.carouselImages)
        ? (block.settings.carouselImages as unknown[]).filter((v): v is string => typeof v === "string")
        : [];
      const carouselOverlayOpacity = Math.min(70, Math.max(30, Number(block.settings.carouselOverlayOpacity ?? 55)));
      const carouselOverlayType = String(block.settings.carouselOverlayType ?? "solid") as "solid" | "gradient";
      const carouselDuration = Math.max(1, Number(block.settings.carouselDuration ?? 5));
      const carouselTransitionDuration = Math.max(0, Number(block.settings.carouselTransitionDuration ?? 700));
      const carouselTransitionType = String(block.settings.carouselTransitionType ?? "fade") as "fade" | "slide" | "zoom" | "instant";
      const carouselShowDots = Boolean(block.settings.carouselShowDots ?? true);
      const carouselShowArrows = Boolean(block.settings.carouselShowArrows ?? true);
      const carouselArrowsColor = String(block.settings.carouselArrowsColor ?? "white");
      const carouselArrowsCustomColor = String(block.settings.carouselArrowsCustomColor ?? "").trim() || "#ffffff";
      const carouselDotsColor = String(block.settings.carouselDotsColor ?? "same");
      const carouselDotsCustomColor = String(block.settings.carouselDotsCustomColor ?? "").trim() || "#ffffff";
      const carouselArrowIcon = String(block.settings.carouselArrowIcon ?? "chevron") as "chevron" | "arrow" | "arrow-circle" | "caret";
      const carouselArrowSize = String(block.settings.carouselArrowSize ?? "md") as "sm" | "md" | "lg";
      const carouselDotsSize = String(block.settings.carouselDotsSize ?? "md") as "sm" | "md" | "lg";

      const heroSectionMode = String(block.settings.heroSectionMode ?? "standard");
      const heroNavHeight = String(block.settings.heroNavHeight ?? "4rem");
      const heroScrollIndicator = Boolean(block.settings.heroScrollIndicator ?? false);
      const heroContentSpacing = String(block.settings.heroContentSpacing ?? "normal");
      const heroLayout = String(block.settings.heroLayout ?? "centered");
      const heroSize = String(block.settings.heroSize ?? "normal");
      const heroHeight = String(block.settings.heroHeight ?? "normal");
      const avatarSize = String(block.settings.avatarSize ?? "md");
      const avatarPosition = String(block.settings.avatarPosition ?? "top");
      const badgeVisible = Boolean(block.settings.badgeVisible ?? true);
      const badgeText = String(block.settings.badgeText ?? "").trim();
      const badgeColor = String(block.settings.badgeColor ?? "accent");
      const badgeCustomColor = String(block.settings.badgeCustomColor ?? "").trim() || theme.accent;
      const ctaStyle = String(block.settings.ctaStyle ?? "primary");
      const subtitleMaxWidth = String(block.settings.subtitleMaxWidth ?? "medium");
      const subtitleAlign = String(block.settings.subtitleAlign ?? "inherit");
      const titleAlign = String(block.settings.titleAlign ?? "inherit");
      const titleUseHtml = Boolean(block.settings.titleUseHtml ?? false);
      const ctaPosition = String(block.settings.ctaPosition ?? "left");
      const ctaIcon = String(block.settings.ctaIcon ?? "none") as "none" | "arrow" | "arrow-right" | "external";
      const cta2Icon = String(block.settings.cta2Icon ?? "same") as "same" | "none" | "arrow" | "arrow-right" | "external";
      const ctaOpenNewTab = Boolean(block.settings.ctaOpenNewTab ?? false);
      const cta2OpenNewTabVal = block.settings.cta2OpenNewTab;
      const cta2OpenNewTab = cta2OpenNewTabVal === "same" || cta2OpenNewTabVal === undefined
        ? ctaOpenNewTab
        : Boolean(cta2OpenNewTabVal);
      const ctaLayout = String(block.settings.ctaLayout ?? "horizontal");
      const ctaSpacing = String(block.settings.ctaSpacing ?? "normal");
      const ctaPositionVertical = String(block.settings.ctaPositionVertical ?? "below-subtitle");
      const ctaColor = String(block.settings.ctaColor ?? "accent");
      const ctaCustomColor = String(block.settings.ctaCustomColor ?? "").trim() || theme.accent;
      const cta2Color = String(block.settings.cta2Color ?? "same");
      const cta2CustomColor = String(block.settings.cta2CustomColor ?? "").trim() || theme.accent;
      const avatarBorderColor = String(block.settings.avatarBorderColor ?? "accent");
      const avatarCustomColor = String(block.settings.avatarCustomColor ?? "").trim() || theme.accent;
      const avatarBorderWidth = String(block.settings.avatarBorderWidth ?? "medium");
      const heroSectionBorder = String(block.settings.heroSectionBorder ?? "none");
      const heroSectionBorderColor = String(block.settings.heroSectionBorderColor ?? "neutral");
      const heroSectionBorderCustomColor = String(block.settings.heroSectionBorderCustomColor ?? "").trim() || "#e4e4e7";
      const ctaTextColor = String(block.settings.ctaTextColor ?? "auto");
      const ctaTextCustomColor = String(block.settings.ctaTextCustomColor ?? "").trim() || "#ffffff";
      const ctaBorderWidth = String(block.settings.ctaBorderWidth ?? "medium");
      const ctaBorderRadius = String(block.settings.ctaBorderRadius ?? "md");
      const ctaBorderColor = String(block.settings.ctaBorderColor ?? "same");
      const ctaBorderCustomColor = String(block.settings.ctaBorderCustomColor ?? "").trim() || theme.accent;
      const cta2Style = String(block.settings.cta2Style ?? "same");
      const cta2BorderWidth = String(block.settings.cta2BorderWidth ?? "same");
      const cta2BorderRadius = String(block.settings.cta2BorderRadius ?? "same");
      const cta2BorderColor = String(block.settings.cta2BorderColor ?? "same");
      const cta2BorderCustomColor = String(block.settings.cta2BorderCustomColor ?? "").trim() || theme.accent;
      const cta2TextColor = String(block.settings.cta2TextColor ?? "same");
      const cta2TextCustomColor = String(block.settings.cta2TextCustomColor ?? "").trim() || "#ffffff";
      const ctaSize = String(block.settings.ctaSize ?? "normal");
      const ctaFontSize = String(block.settings.ctaFontSize ?? "md");
      const cta2Size = String(block.settings.cta2Size ?? "same");
      const cta2FontSize = String(block.settings.cta2FontSize ?? "same");
      const avatarBorderRadius = String(block.settings.avatarBorderRadius ?? block.settings.avatarShape ?? "full");
      const titleLineHeight = String(block.settings.titleLineHeight ?? "normal");
      const subtitleLineHeight = String(block.settings.subtitleLineHeight ?? "normal");
      const titleLetterSpacing = String(block.settings.titleLetterSpacing ?? "normal");
      const badgeSize = String(block.settings.badgeSize ?? "md");
      const titleMaxWidth = String(block.settings.titleMaxWidth ?? "none");
      const heroParallax = Boolean(block.settings.heroParallax ?? false);
      const heroVideoOverlayType = String(block.settings.heroVideoOverlayType ?? "solid") as "none" | "solid" | "gradient";
      const heroVideoOverlayOpacity = Math.min(100, Math.max(0, Number(block.settings.heroVideoOverlayOpacity ?? 55)));
      const heroScrollAnimation = String(block.settings.heroScrollAnimation ?? "none") as "none" | "fade" | "slide-up";
      const subtitleLineClamp = String(block.settings.subtitleLineClamp ?? "none") as "none" | "1" | "2" | "3";
      const heroContentVerticalAlign = String(block.settings.heroContentVerticalAlign ?? "center") as "top" | "center" | "bottom";
      const titleTextShadow = Boolean(block.settings.titleTextShadow ?? false);
      const subtitleTextShadow = Boolean(block.settings.subtitleTextShadow ?? false);
      const heroScrollAnimationStagger = Boolean(block.settings.heroScrollAnimationStagger ?? false);
      const titleDecorativeAccent = String(block.settings.titleDecorativeAccent ?? "none") as "none" | "underline" | "accent-line";
      const badgeIcon = String(block.settings.badgeIcon ?? "none") as "none" | "star" | "check" | "sparkles";
      const subtitleLetterSpacing = String(block.settings.subtitleLetterSpacing ?? "normal") as "tight" | "normal" | "wide";
      const ctaFullWidthMobile = Boolean(block.settings.ctaFullWidthMobile ?? false);
      const heroContentMaxWidth = String(block.settings.heroContentMaxWidth ?? "medium") as "narrow" | "medium" | "wide" | "full";
      const titleSubtitleDivider = Boolean(block.settings.titleSubtitleDivider ?? false);
      const badgeBorderRadius = String(block.settings.badgeBorderRadius ?? "pill") as "pill" | "rounded" | "square";
      const heroVideoAutoplay = Boolean(block.settings.heroVideoAutoplay ?? true);
      const subtitleDropCap = Boolean(block.settings.subtitleDropCap ?? false);

      const heroFontFamily = String(block.settings.heroFontFamily ?? "inherit");
      const heroFontSize = String(block.settings.heroFontSize ?? "normal");
      const heroFontWeight = String(block.settings.heroFontWeight ?? "normal");
      const heroFontFamilyClass =
        heroFontFamily !== "inherit" ? `font-hero-${heroFontFamily}` : "";
      const heroFontSizeClass =
        heroFontSize === "small" ? "text-[87.5%]" : heroFontSize === "large" ? "text-[112.5%]" : "";
      const heroFontWeightClass =
        heroFontWeight === "medium"
          ? "font-medium"
          : heroFontWeight === "semibold"
            ? "font-semibold"
            : heroFontWeight === "bold"
              ? "font-bold"
              : "font-normal";
      const heroTypographyClass = [heroFontFamilyClass, heroFontSizeClass, heroFontWeightClass]
        .filter(Boolean)
        .join(" ");

      const blockFallback = {
        fontFamily: heroFontFamily,
        fontSize: heroFontSize,
        fontWeight: heroFontWeight,
      };
      const getElementTypographyClass = (
        elFontFamily: string,
        elFontSize: string,
        elFontWeight: string,
      ) => {
        const ff = elFontFamily === "inherit" ? blockFallback.fontFamily : elFontFamily;
        const fs = elFontSize === "inherit" ? blockFallback.fontSize : elFontSize;
        const fw = elFontWeight === "inherit" ? blockFallback.fontWeight : elFontWeight;
        const parts: string[] = [];
        if (ff && ff !== "inherit") parts.push(`font-hero-${ff}`);
        if (fs === "small") parts.push("text-[87.5%]");
        else if (fs === "large") parts.push("text-[112.5%]");
        parts.push(
          fw === "medium" ? "font-medium"
            : fw === "semibold" ? "font-semibold"
            : fw === "bold" ? "font-bold"
            : "font-normal",
        );
        return parts.filter(Boolean).join(" ");
      };

      const titleFontSizePresetMap: Record<string, string> = {
        "2xl": "2.5rem", "3xl": "3rem", "4xl": "3.75rem", "5xl": "4.5rem",
        "6xl": "5rem", "7xl": "6rem", "8xl": "7rem", "9xl": "8rem",
      };
      const subtitleFontSizePresetMap: Record<string, string> = {
        sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem",
        "2xl": "1.5rem", "3xl": "1.875rem",
      };
      const ctaFontSizePresetMap: Record<string, string> = {
        sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem",
        "2xl": "1.5rem", "3xl": "1.875rem",
      };

      const badgeFontFamily = String(block.settings.badgeFontFamily ?? "inherit");
      const badgeFontSize = String(block.settings.badgeFontSize ?? "inherit");
      const badgeFontWeight = String(block.settings.badgeFontWeight ?? "inherit");
      const titleFontFamily = String(block.settings.titleFontFamily ?? "inherit");
      const titleFontSize = String(block.settings.titleFontSize ?? "inherit");
      const titleFontSizeCustom = String(block.settings.titleFontSizeCustom ?? "4").trim();
      const titleFontWeight = String(block.settings.titleFontWeight ?? "inherit");
      const subtitleFontFamily = String(block.settings.subtitleFontFamily ?? "inherit");
      const subtitleFontSize = String(block.settings.subtitleFontSize ?? "inherit");
      const subtitleFontSizeCustom = String(block.settings.subtitleFontSizeCustom ?? "1.25").trim();
      const subtitleFontWeight = String(block.settings.subtitleFontWeight ?? "inherit");
      const ctaFontFamily = String(block.settings.ctaFontFamily ?? "inherit");
      const ctaFontSizeTypo = String(block.settings.ctaFontSizeTypo ?? "inherit");
      const ctaFontSizeTypoCustom = String(block.settings.ctaFontSizeTypoCustom ?? "1").trim();
      const ctaFontWeight = String(block.settings.ctaFontWeight ?? "inherit");
      const cta2FontFamilyVal = String(block.settings.cta2FontFamily ?? "same");
      const cta2FontSizeTypoVal = String(block.settings.cta2FontSizeTypo ?? "same");
      const cta2FontSizeTypoCustom = String(block.settings.cta2FontSizeTypoCustom ?? "1").trim();
      const cta2FontWeightVal = String(block.settings.cta2FontWeight ?? "same");
      const cta2FontFamily = cta2FontFamilyVal === "same" ? ctaFontFamily : cta2FontFamilyVal;
      const cta2FontSizeTypo = cta2FontSizeTypoVal === "same" ? ctaFontSizeTypo : cta2FontSizeTypoVal;
      const cta2FontWeight = cta2FontWeightVal === "same" ? ctaFontWeight : cta2FontWeightVal;

      const badgeTypoClass = getElementTypographyClass(badgeFontFamily, badgeFontSize, badgeFontWeight);
      const titleTypoClass = getElementTypographyClass(titleFontFamily, "inherit", titleFontWeight);
      const subtitleTypoClass = getElementTypographyClass(subtitleFontFamily, "inherit", subtitleFontWeight);

      const getTitleFontSizeStyle = (): CSSProperties | undefined => {
        if (titleFontSize === "inherit") return undefined;
        if (titleFontSize === "custom") {
          const n = parseFloat(titleFontSizeCustom);
          return isFinite(n) && n > 0 ? { fontSize: `${n}rem` } : undefined;
        }
        const preset = titleFontSizePresetMap[titleFontSize];
        return preset ? { fontSize: preset } : undefined;
      };
      const getSubtitleFontSizeStyle = (): CSSProperties | undefined => {
        if (subtitleFontSize === "inherit") return undefined;
        if (subtitleFontSize === "custom") {
          const n = parseFloat(subtitleFontSizeCustom);
          return isFinite(n) && n > 0 ? { fontSize: `${n}rem` } : undefined;
        }
        const preset = subtitleFontSizePresetMap[subtitleFontSize];
        return preset ? { fontSize: preset } : undefined;
      };
      const getCtaFontSizeTypoStyle = (isSecondary: boolean): CSSProperties | undefined => {
        const sz = isSecondary ? cta2FontSizeTypo : ctaFontSizeTypo;
        const customVal = isSecondary ? cta2FontSizeTypoCustom : ctaFontSizeTypoCustom;
        if (sz === "inherit") return undefined;
        if (sz === "custom") {
          const n = parseFloat(customVal);
          return isFinite(n) && n > 0 ? { fontSize: `${n}rem` } : undefined;
        }
        const preset = ctaFontSizePresetMap[sz];
        return preset ? { fontSize: preset } : undefined;
      };
      const ctaTypoClass = getElementTypographyClass(ctaFontFamily, "normal", ctaFontWeight);
      const cta2TypoClass = getElementTypographyClass(cta2FontFamily, "normal", cta2FontWeight);

      const showAvatar = avatarUrl && avatarPosition !== "hidden";
      const isSplit = heroLayout === "split-left" || heroLayout === "split-right";
      const layoutAlign =
        heroLayout === "center" || heroLayout === "centered" || heroLayout === "split-left" || heroLayout === "split-right"
          ? isSplit
            ? heroLayout === "split-left"
              ? "text-left"
              : "text-right"
            : heroLayout === "center" || heroLayout === "centered"
              ? "text-center"
              : "text-right"
          : heroLayout === "right"
            ? "text-right"
            : "text-left";
      const titleSizeClass =
        heroSize === "compact"
          ? "text-3xl"
          : heroSize === "large"
            ? "text-6xl md:text-7xl"
            : "text-5xl";
      const titleSizeClassResolved =
        titleFontSize === "inherit" ? titleSizeClass : "";
      const avatarSizeMap = { sm: 64, md: 96, lg: 128 };
      const avatarPx = avatarSizeMap[avatarSize as keyof typeof avatarSizeMap] ?? 96;
      const avatarRadiusClass =
        avatarBorderRadius === "full" || avatarBorderRadius === "round"
          ? "rounded-full"
          : avatarBorderRadius === "xl" || avatarBorderRadius === "rounded-square"
            ? "rounded-2xl"
            : avatarBorderRadius === "lg"
              ? "rounded-xl"
              : avatarBorderRadius === "md"
                ? "rounded-lg"
                : "rounded-none";

      const heightMap = {
        compact: "min-h-[320px] pt-16 pb-12",
        normal: "min-h-[440px] pt-24 pb-16",
        tall: "min-h-[560px] pt-32 pb-24",
      };
      const fullPageHeightClassMap = {
        "3rem": "min-h-[calc(100dvh-3rem)] min-h-[calc(100vh-3rem)] pt-20 pb-16 md:pt-24 md:pb-20",
        "4rem": "min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] pt-20 pb-16 md:pt-24 md:pb-20",
        "5rem": "min-h-[calc(100dvh-5rem)] min-h-[calc(100vh-5rem)] pt-20 pb-16 md:pt-24 md:pb-20",
      } as const;
      const navHeightVal = heroNavHeight === "3rem" ? "3rem" : heroNavHeight === "5rem" ? "5rem" : "4rem";
      const fullPageHeightClass = fullPageHeightClassMap[navHeightVal];
      const heroHeightClass =
        heroSectionMode === "full-page"
          ? fullPageHeightClass
          : (heightMap[heroHeight as keyof typeof heightMap] ?? heightMap.normal);
      const sectionPaddingClass =
        heroSectionMode === "full-page"
          ? "pt-20 md:pt-24"
          : heroHeight === "compact"
            ? "pt-16"
            : heroHeight === "tall"
              ? "pt-32"
              : "pt-24";

      const subtitleWidthClass =
        subtitleMaxWidth === "none"
          ? ""
          : subtitleMaxWidth === "narrow"
            ? "max-w-xl"
            : subtitleMaxWidth === "wide"
              ? "max-w-4xl"
              : "max-w-3xl";
      const titleLineHeightClass =
        titleLineHeight === "tight" ? "leading-tight" : titleLineHeight === "relaxed" ? "leading-relaxed" : "leading-normal";
      const subtitleLineHeightClass =
        subtitleLineHeight === "tight" ? "leading-tight" : subtitleLineHeight === "relaxed" ? "leading-relaxed" : "leading-normal";
      const titleLetterSpacingClass =
        titleLetterSpacing === "tight" ? "tracking-tighter" : titleLetterSpacing === "wide" ? "tracking-wider" : "tracking-normal";
      const subtitleLetterSpacingClass =
        subtitleLetterSpacing === "tight" ? "tracking-tighter" : subtitleLetterSpacing === "wide" ? "tracking-wider" : "tracking-normal";
      const subtitleLineClampClass =
        subtitleLineClamp === "1" ? "line-clamp-1" : subtitleLineClamp === "2" ? "line-clamp-2" : subtitleLineClamp === "3" ? "line-clamp-3" : "";
      const heroContentVerticalAlignClass =
        heroContentVerticalAlign === "top" ? "justify-start" : heroContentVerticalAlign === "bottom" ? "justify-end" : "justify-center";
      const heroContentMaxWidthClass =
        heroContentMaxWidth === "narrow" ? "max-w-xl" : heroContentMaxWidth === "wide" ? "max-w-4xl" : heroContentMaxWidth === "full" ? "max-w-none" : "max-w-3xl";
      const badgeBorderRadiusClass =
        badgeBorderRadius === "pill" ? "rounded-full" : badgeBorderRadius === "rounded" ? "rounded-lg" : "rounded-none";
      const titleMaxWidthClass =
        titleMaxWidth === "none"
          ? "max-w-none"
          : titleMaxWidth === "narrow"
            ? "max-w-xl"
            : titleMaxWidth === "medium"
              ? "max-w-3xl"
              : titleMaxWidth === "wide"
                ? "max-w-4xl"
                : "max-w-none";
      const badgeSizeClass = badgeSize === "sm" ? "text-xs" : badgeSize === "lg" ? "text-base" : "text-sm";
      const titleAlignClass =
        titleAlign === "inherit"
          ? (heroLayout === "centered" || heroLayout === "center" ? "w-full justify-center text-center" : heroLayout === "right" ? "w-full justify-end text-right" : "w-full justify-start text-left")
          : titleAlign === "center"
            ? "w-full justify-center text-center"
            : titleAlign === "right"
              ? "w-full justify-end text-right"
              : "w-full justify-start text-left";
      const subtitleAlignClass =
        subtitleAlign === "inherit"
          ? (heroLayout === "centered" || heroLayout === "center" ? "mx-auto" : "")
          : subtitleAlign === "center"
            ? "mx-auto text-center"
            : subtitleAlign === "right"
              ? "ml-auto text-right"
              : "text-left";

      const defaultBadgeText = tenantId ? "Subdomain portfolio" : "Portfolio";
      const displayBadgeText = badgeText || defaultBadgeText;

      const contentSpacingMap = {
        tight: { badge: "mb-4", title: "mb-4", subtitle: "mb-6", cta: "mb-4" },
        normal: { badge: "mb-6", title: "mb-6", subtitle: "mb-8", cta: "mb-6" },
        loose: { badge: "mb-8", title: "mb-8", subtitle: "mb-10", cta: "mb-8" },
      };
      const spacing = contentSpacingMap[heroContentSpacing as keyof typeof contentSpacingMap] ?? contentSpacingMap.normal;

      const getBadgeStyle = () => {
        const color = badgeColor === "custom" ? badgeCustomColor : badgeColor === "primary" ? "var(--portfolio-primary)" : badgeColor === "neutral" ? "#71717a" : theme.accent;
        return { backgroundColor: `${color}20`, color, borderColor: `${color}40` };
      };

      const getCtaIcon = (isSecondary: boolean) => {
        const icon = isSecondary && cta2Icon === "same" ? ctaIcon : isSecondary ? cta2Icon : ctaIcon;
        if (icon === "none") return null;
        if (icon === "arrow-right") {
          return (
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          );
        }
        if (icon === "external") {
          return (
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          );
        }
        if (icon === "arrow") {
          return (
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          );
        }
        return null;
      };

      const getCtaColor = (colorKey: string, customVal: string) => {
        if (colorKey === "custom") return customVal;
        if (colorKey === "primary") return "var(--portfolio-primary)";
        if (colorKey === "block") return block.style.accentColor || theme.accent;
        return theme.accent;
      };
      const primaryCtaColor = getCtaColor(ctaColor, ctaCustomColor);
      const secondaryCtaColor = cta2Color === "same" ? primaryCtaColor : getCtaColor(cta2Color, cta2CustomColor);

      const getCtaBorderColorFor = (borderColorKey: string, borderCustom: string, bgColor: string) => {
        if (borderColorKey === "custom") return borderCustom;
        if (borderColorKey === "primary") return "var(--portfolio-primary)";
        if (borderColorKey === "accent") return theme.accent;
        return bgColor;
      };
      const getCtaTextColorFor = (textColorKey: string, textCustom: string) => {
        if (textColorKey === "custom") return textCustom;
        if (textColorKey === "white") return "#ffffff";
        if (textColorKey === "primary") return "var(--portfolio-primary)";
        return "#ffffff";
      };
      const getCtaBorderWidthPx = (w: string) =>
        w === "none" ? 0 : w === "thin" ? 1 : w === "thick" ? 4 : 2;
      const getCtaRadiusPx = (r: string) =>
        r === "none" ? 0 : r === "sm" ? 4 : r === "lg" ? 8 : r === "full" ? 9999 : 6;
      const getCtaSizeClass = (s: string) =>
        s === "compact" ? "px-4 py-2" : s === "large" ? "px-8 py-4" : "px-6 py-3";
      const getCtaFontSizeClass = (f: string) =>
        f === "sm" ? "text-sm" : f === "lg" ? "text-lg" : "text-base";

      const getCtaButtonStyle = (color: string, style: string, isSecondary: boolean) => {
        const st = isSecondary && cta2Style === "same" ? ctaStyle : isSecondary ? cta2Style : ctaStyle;
        const borderColKey = isSecondary && cta2BorderColor === "same" ? ctaBorderColor : isSecondary ? cta2BorderColor : ctaBorderColor;
        const borderCustom = isSecondary && cta2BorderColor === "same" ? ctaBorderCustomColor : isSecondary ? cta2BorderCustomColor : ctaBorderCustomColor;
        const textColKey = isSecondary && cta2TextColor === "same" ? ctaTextColor : isSecondary ? cta2TextColor : ctaTextColor;
        const textCustom = isSecondary && cta2TextColor === "same" ? ctaTextCustomColor : isSecondary ? cta2TextCustomColor : ctaTextCustomColor;
        const borderW = getCtaBorderWidthPx(isSecondary && cta2BorderWidth === "same" ? ctaBorderWidth : isSecondary ? cta2BorderWidth : ctaBorderWidth);
        const radiusPx = getCtaRadiusPx(isSecondary && cta2BorderRadius === "same" ? ctaBorderRadius : isSecondary ? cta2BorderRadius : ctaBorderRadius);
        const textCol = getCtaTextColorFor(textColKey, textCustom);
        const borderCol = getCtaBorderColorFor(borderColKey, borderCustom, color);

        const base = {
          borderWidth: borderW,
          borderRadius: radiusPx,
        } as CSSProperties;
        if (st === "primary") {
          return {
            ...base,
            backgroundColor: color,
            borderColor: borderCol,
            color: textCol,
          } as CSSProperties;
        }
        if (st === "outline") {
          return {
            ...base,
            borderColor: color,
            color,
          } as CSSProperties;
        }
        if (st === "ghost") {
          return { ...base, color } as CSSProperties;
        }
        return undefined;
      };
      const getCtaButtonClass = (isSecondary: boolean) => {
        const size = isSecondary && cta2Size === "same" ? ctaSize : isSecondary ? cta2Size : ctaSize;
        const fontSizeTypo = isSecondary ? cta2FontSizeTypo : ctaFontSizeTypo;
        const fontSize = isSecondary && cta2FontSize === "same" ? ctaFontSize : isSecondary ? cta2FontSize : ctaFontSize;
        const sizeClass = fontSizeTypo === "inherit" ? getCtaFontSizeClass(fontSize) : "";
        return `${getCtaSizeClass(size)} ${sizeClass}`;
      };
      const getCtaVariant = (isSecondary: boolean): "primary" | "secondary" | "ghost" => {
        const st = isSecondary && cta2Style === "same" ? ctaStyle : isSecondary ? cta2Style : ctaStyle;
        return st === "outline" ? "secondary" : st === "ghost" ? "ghost" : "primary";
      };

      const ctaPositionClass =
        ctaLayout === "vertical"
          ? (ctaPosition === "center" ? "items-center" : ctaPosition === "right" ? "items-end" : "items-start")
          : (ctaPosition === "center" ? "justify-center" : ctaPosition === "right" ? "justify-end" : "justify-start");
      const ctaLayoutClass = ctaLayout === "vertical" ? "flex-col" : "flex-wrap";
      const ctaSpacingClass =
        ctaSpacing === "tight" ? "gap-2" : ctaSpacing === "loose" ? "gap-4" : "gap-3";

      const getAvatarBorderColor = () => {
        if (avatarBorderColor === "custom") return avatarCustomColor;
        if (avatarBorderColor === "primary") return "var(--portfolio-primary)";
        return theme.accent;
      };
      const avatarBorderWidthClass =
        avatarBorderWidth === "none"
          ? "border-0"
          : avatarBorderWidth === "thin"
            ? "border"
            : avatarBorderWidth === "thick"
              ? "border-4"
              : "border-2";

      const getHeroSectionBorderColor = () => {
        if (heroSectionBorderColor === "custom") return heroSectionBorderCustomColor;
        if (heroSectionBorderColor === "accent") return theme.accent;
        if (heroSectionBorderColor === "primary") return "var(--portfolio-primary)";
        return "#e4e4e7";
      };
      const heroSectionBorderClass =
        heroSectionBorder === "none"
          ? ""
          : heroSectionBorder === "thin"
            ? "border"
            : heroSectionBorder === "thick"
              ? "border-4"
              : "border-2";

      const getBadgeIcon = () => {
        if (badgeIcon === "none") return null;
        const cls = "h-3.5 w-3.5 shrink-0";
        if (badgeIcon === "star") {
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
        }
        if (badgeIcon === "check") {
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          );
        }
        if (badgeIcon === "sparkles") {
          return (
            <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0L14.59 9.41L24 12l-9.41 2.59L12 24l-2.59-9.41L0 12l9.41-2.59L12 0z" />
            </svg>
          );
        }
        return null;
      };

      const heroComponentOrder = (Array.isArray(block.settings.heroComponentOrder)
        ? block.settings.heroComponentOrder
        : ["badge", "title", "subtitle", "avatar", "ctas"]
      ).filter((id): id is string => typeof id === "string" && ["badge", "title", "subtitle", "avatar", "ctas"].includes(id)) as string[];
      const effectiveOrder = heroComponentOrder.length > 0 ? heroComponentOrder : ["badge", "title", "subtitle", "avatar", "ctas"];

      const renderHeroContent = (hasDarkBg = false) => {
        const textColor = hasDarkBg ? "text-white" : "";
        const subtitleColor = hasDarkBg ? "text-zinc-100" : "text-zinc-600";
        const avatarBorderStyle = avatarBorderWidth !== "none"
          ? { borderColor: hasDarkBg ? "rgba(255,255,255,0.5)" : getAvatarBorderColor() }
          : undefined;
        const ctaLinkProps = (openNewTab: boolean) => openNewTab ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
        const titleShadowStyle = hasDarkBg && titleTextShadow ? { textShadow: "0 2px 8px rgba(0,0,0,0.5)" } : undefined;
        const subtitleShadowStyle = hasDarkBg && subtitleTextShadow ? { textShadow: "0 2px 8px rgba(0,0,0,0.5)" } : undefined;
        const ctaWrapperClass = `flex ${ctaLayoutClass} ${ctaSpacingClass} ${ctaPositionClass} ${ctaFullWidthMobile ? "w-full flex-col sm:flex-row sm:w-auto [&>a]:w-full [&>a]:sm:w-auto" : ""}`;

        const avatarEl = showAvatar && !isSplit && (
          <div
            key="avatar"
            className={`${spacing.badge} overflow-hidden shadow-lg ${avatarRadiusClass} ${avatarBorderWidth === "none" ? "" : avatarBorderWidthClass}`}
            style={{
              ...avatarBorderStyle,
              width: avatarPx,
              height: avatarPx,
              marginLeft: heroLayout === "centered" || heroLayout === "center" ? "auto" : undefined,
              marginRight: heroLayout === "centered" || heroLayout === "center" ? "auto" : undefined,
            }}
          >
            <Image
              src={avatarUrl!}
              alt=""
              width={avatarPx}
              height={avatarPx}
              className="h-full w-full object-cover"
              unoptimized={avatarUrl!.startsWith("data:")}
            />
          </div>
        );
        const badgeEl = badgeVisible && (
          <Badge
            key="badge"
            variant="success"
            className={`${spacing.badge} ${badgeTypoClass} ${badgeSizeClass} ${badgeBorderRadiusClass} inline-flex items-center gap-1.5`}
            style={getBadgeStyle()}
          >
            {badgeIcon !== "none" && getBadgeIcon()}
            {displayBadgeText}
          </Badge>
        );
        const titleEl = (
          <div key="title" className={spacing.title}>
            <h1
              className={`${titleSizeClassResolved} ${titleTypoClass} ${titleLineHeightClass} ${titleLetterSpacingClass} ${titleMaxWidthClass} ${textColor} flex flex-wrap items-baseline gap-x-2 ${titleAlignClass}`}
              style={{
                ...(!hasDarkBg ? { color: "var(--portfolio-primary)" } : {}),
                ...getTitleFontSizeStyle(),
                ...titleShadowStyle,
              }}
            >
              {titleUseHtml ? (
                <span dangerouslySetInnerHTML={{ __html: title }} />
              ) : (
                title
              )}
            </h1>
            {titleDecorativeAccent === "underline" && (
              <div className="mt-2 h-px w-24 bg-current opacity-40" aria-hidden />
            )}
            {titleDecorativeAccent === "accent-line" && (
              <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: hasDarkBg ? "rgba(255,255,255,0.8)" : theme.accent }} aria-hidden />
            )}
          </div>
        );
        const subtitleEl = (
          <p
            key="subtitle"
            className={`${subtitleFontSize === "inherit" ? "text-xl" : ""} ${subtitleTypoClass} ${subtitleLineHeightClass} ${subtitleLetterSpacingClass} ${subtitleColor} ${subtitleWidthClass} ${subtitleAlignClass} ${subtitleLineClampClass} ${spacing.subtitle} ${subtitleDropCap ? "first-letter:float-left first-letter:mr-2 first-letter:text-4xl first-letter:font-bold first-letter:leading-none" : ""}`}
            style={{
              ...(heroLayout === "left" || heroLayout === "right" ? { marginLeft: 0, marginRight: 0 } : {}),
              ...getSubtitleFontSizeStyle(),
              ...subtitleShadowStyle,
            }}
          >
            {subtitle}
          </p>
        );
        const ctasEl = (
          <div key="ctas" className={`${spacing.cta} ${ctaWrapperClass}`}>
            <a href={ctaHref} {...ctaLinkProps(ctaOpenNewTab)}>
              <Button
                variant={getCtaVariant(false)}
                className={`${getCtaButtonClass(false)} ${ctaTypoClass} inline-flex items-center`}
                style={{ ...getCtaButtonStyle(primaryCtaColor, ctaStyle, false), ...getCtaFontSizeTypoStyle(false) }}
              >
                {ctaText}
                {getCtaIcon(false)}
              </Button>
            </a>
            {cta2Text && (
              <a href={cta2Href} {...ctaLinkProps(cta2OpenNewTab)}>
                <Button
                  variant={getCtaVariant(true)}
                  className={`${getCtaButtonClass(true)} ${cta2TypoClass} inline-flex items-center`}
                  style={{ ...getCtaButtonStyle(secondaryCtaColor, cta2Style, true), ...getCtaFontSizeTypoStyle(true) }}
                >
                  {cta2Text}
                  {getCtaIcon(true)}
                </Button>
              </a>
            )}
          </div>
        );

        const dividerEl = titleSubtitleDivider && (
          <hr key="divider" className="my-4 w-16 border-current opacity-30" aria-hidden />
        );

        const orderForSplit = effectiveOrder.filter((id) => id !== "avatar");
        const orderToUse = isSplit ? orderForSplit : effectiveOrder;

        const elements: Record<string, ReactNode> = {
          badge: badgeEl,
          title: titleEl,
          subtitle: subtitleEl,
          avatar: avatarEl,
          ctas: ctasEl,
        };

        const result: ReactNode[] = [];
        for (let i = 0; i < orderToUse.length; i++) {
          const id = orderToUse[i];
          const el = elements[id];
          if (el) result.push(el);
          if (id === "title" && dividerEl) result.push(dividerEl);
        }
        return <>{result}</>;
      };

      const heroContainerStyle = style;
      const heroContainerClass = `${containerClass} ${layoutAlign} ${heroTypographyClass}`.trim();
      const heroContentInnerClass =
        `${heroContentMaxWidthClass} w-full ${
          heroLayout === "centered" || heroLayout === "center" || heroLayout === "split-left" || heroLayout === "split-right"
            ? "mx-auto"
            : heroLayout === "right"
              ? "ml-auto"
              : ""
        }`.trim();

      const renderAvatarBlock = (isCarousel: boolean) =>
        showAvatar && (
          <div
            className={`shrink-0 overflow-hidden shadow-lg ${avatarRadiusClass} ${avatarBorderWidth === "none" ? "" : avatarBorderWidthClass}`}
            style={{
              ...(avatarBorderWidth !== "none"
                ? { borderColor: isCarousel ? "rgba(255,255,255,0.5)" : getAvatarBorderColor() }
                : {}),
              width: avatarPx,
              height: avatarPx,
            }}
          >
            <Image
              src={avatarUrl!}
              alt=""
              width={avatarPx}
              height={avatarPx}
              className="h-full w-full object-cover"
              unoptimized={avatarUrl!.startsWith("data:")}
            />
          </div>
        );

      const hasCarouselBg = heroBackgroundType === "carousel" && carouselEnabled && carouselImages.length > 0;
      const hasVideoBg = heroBackgroundType === "video" && heroVideoUrl;
      const hasMediaBg = hasCarouselBg || hasVideoBg;

      const heroBlockPadding = block.style.blockSpacing
        ? getBlockSpacingClass(block.style.blockSpacing)
        : getPaddingClass(block.style.padding);
      const heroContentPadding = `${heroBlockPadding} px-6`;
      const heroBgHeightClass =
        heroSectionMode === "full-page"
          ? fullPageHeightClass
          : `min-h-[${heroHeight === "compact" ? "320" : heroHeight === "tall" ? "560" : "440"}px]`;

      if (hasMediaBg) {
        return (
          <HeroBackground
            images={hasCarouselBg ? carouselImages : []}
            videoUrl={hasVideoBg ? heroVideoUrl : undefined}
            overlayOpacity={carouselOverlayOpacity}
            overlayType={carouselOverlayType}
            heroParallax={heroParallax}
            heroVideoOverlayType={heroVideoOverlayType}
            heroVideoOverlayOpacity={heroVideoOverlayOpacity}
            contentVerticalAlign={heroSectionMode === "full-page" ? heroContentVerticalAlign : "center"}
            heroVideoAutoplay={heroVideoAutoplay}
            heightClassName={heroBgHeightClass}
            paddingClassName={heroContentPadding}
            sectionBorderClass={heroSectionBorderClass}
            sectionBorderStyle={
              heroSectionBorder !== "none"
                ? { borderColor: getHeroSectionBorderColor() }
                : undefined
            }
            sectionId={sectionId(block)}
            duration={carouselDuration}
            transitionDuration={carouselTransitionDuration}
            transitionType={carouselTransitionType}
            showDots={carouselShowDots}
            showArrows={carouselShowArrows}
            arrowsColor={carouselArrowsColor}
            arrowsCustomColor={carouselArrowsCustomColor}
            dotsColor={carouselDotsColor}
            dotsCustomColor={carouselDotsCustomColor}
            accentColor={block.style.accentColor || theme.accent}
            arrowIcon={carouselArrowIcon}
            arrowSize={carouselArrowSize}
            dotsSize={carouselDotsSize}
          >
            <div className={heroContainerClass} style={heroContainerStyle}>
              <div className={heroContentInnerClass}>
                {isSplit ? (
                  <div
                    className={`flex items-center gap-8 ${
                      heroLayout === "split-right" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="flex-1">
                      <HeroScrollAnimation animation={heroScrollAnimation} stagger={heroScrollAnimationStagger}>
                        {renderHeroContent(true)}
                      </HeroScrollAnimation>
                    </div>
                    {renderAvatarBlock(true)}
                  </div>
                ) : (
                  <HeroScrollAnimation animation={heroScrollAnimation} stagger={heroScrollAnimationStagger}>
                    {renderHeroContent(true)}
                  </HeroScrollAnimation>
                )}
              </div>
            </div>
            {heroSectionMode === "full-page" && heroScrollIndicator && (
              <a
                href="#main-content"
                className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 animate-bounce text-white/80 transition hover:text-white"
                aria-label="Scroll down"
              >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </a>
            )}
          </HeroBackground>
        );
      }

      const nonCarouselSectionClass =
        heroSectionMode === "full-page"
          ? `relative flex ${fullPageHeightClass} flex-col ${heroContentVerticalAlignClass} ${sectionClass} ${sectionPaddingClass} ${heroSectionBorderClass}`
          : `${sectionClass} ${sectionPaddingClass} ${heroSectionBorderClass}`;

      return (
        <section
          id={sectionId(block)}
          className={nonCarouselSectionClass}
          style={{
            ...getBlockSectionStyle(block.style),
            ...(heroSectionBorder !== "none"
              ? { borderColor: getHeroSectionBorderColor() }
              : {}),
          }}
        >
          <div className={heroContainerClass} style={heroContainerStyle}>
            <div className={heroContentInnerClass}>
              {isSplit ? (
                <div
                  className={`flex items-center gap-8 ${
                    heroLayout === "split-right" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-1">
                    <HeroScrollAnimation animation={heroScrollAnimation} stagger={heroScrollAnimationStagger}>
                      {renderHeroContent(false)}
                    </HeroScrollAnimation>
                  </div>
                  {renderAvatarBlock(false)}
                </div>
              ) : (
                <HeroScrollAnimation animation={heroScrollAnimation} stagger={heroScrollAnimationStagger}>
                  {renderHeroContent(false)}
                </HeroScrollAnimation>
              )}
            </div>
          </div>
          {heroSectionMode === "full-page" && heroScrollIndicator && (
            <a
              href="#main-content"
              className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-bounce text-zinc-500 transition hover:text-zinc-700"
              aria-label="Scroll down"
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </a>
          )}
        </section>
      );
    }

    if (block.type === "separator") {
      const sepStyle = String(block.settings.separatorStyle ?? "solid");
      const sepThickness = String(block.settings.separatorThickness ?? "medium");
      const sepWidth = String(block.settings.separatorWidth ?? "full");
      const thicknessClass =
        sepThickness === "thin" ? "border-t" : sepThickness === "thick" ? "border-t-4" : "border-t-2";
      const styleClass =
        sepStyle === "dashed"
          ? "border-dashed"
          : sepStyle === "dotted"
            ? "border-dotted"
            : sepStyle === "double"
              ? "border-double"
              : "border-solid";
      const widthClass =
        sepWidth === "narrow"
          ? "max-w-2xl mx-auto"
          : sepWidth === "wide"
            ? "max-w-4xl mx-auto"
            : "w-full";
      const visibilityClass = getBlockVisibilityClass(block.style.blockVisibility);
      return (
        <div
          className={`px-6 py-4 ${visibilityClass}`}
          style={getBlockSectionStyle(block.style)}
          aria-hidden
        >
          <div className={`${widthClass}`}>
            {sepStyle === "gradient" ? (
              <div
                style={{
                  background: `linear-gradient(90deg, transparent, var(--portfolio-accent, ${theme.accent}), transparent)`,
                  height: sepThickness === "thin" ? 1 : sepThickness === "thick" ? 4 : 2,
                }}
              />
            ) : (
              <hr
                className={`${thicknessClass} ${styleClass} border-zinc-200`}
                style={{ borderColor: block.style.accentColor || undefined }}
              />
            )}
          </div>
        </div>
      );
    }

    if (block.type === "text") {
      const subtitle = String(block.settings.subtitle ?? "");
      const subtitleVisible = Boolean(block.settings.subtitleVisible ?? true);
      const subtitleUseHtml = Boolean(block.settings.subtitleUseHtml ?? false);
      const subtitlePosition = String(block.settings.subtitlePosition ?? "below");
      const titleUseHtml = Boolean(block.settings.titleUseHtml ?? false);
      const titleHeadingLevel = String(block.settings.titleHeadingLevel ?? "h2");
      const titleTextTransform = String(block.settings.titleTextTransform ?? "none");
      const body = String(block.settings.body ?? "Add your content from the admin builder.");
      const isHtml = body.startsWith("<");
      const textLayout = String(block.settings.textLayout ?? "left");
      const textLayoutColumns = String(block.settings.textLayoutColumns ?? "single");
      const titleAlign = String(block.settings.titleAlign ?? "inherit");
      const subtitleAlign = String(block.settings.subtitleAlign ?? "inherit");
      const textContentMaxWidth = String(block.settings.textContentMaxWidth ?? "medium");
      const textCardStyle = String(block.settings.textCardStyle ?? "bordered");
      const textContentPadding = String(block.settings.textContentPadding ?? "md");
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

      const textFontFamily = String(block.settings.textFontFamily ?? "inherit");
      const textFontSize = String(block.settings.textFontSize ?? "normal");
      const textFontWeight = String(block.settings.textFontWeight ?? "normal");
      const blockFontClass =
        textFontFamily !== "inherit" ? `font-hero-${textFontFamily}` : "";
      const blockSizeClass =
        textFontSize === "small" ? "text-[87.5%]" : textFontSize === "large" ? "text-[112.5%]" : "";
      const blockWeightClass =
        textFontWeight === "medium"
          ? "font-medium"
          : textFontWeight === "semibold"
            ? "font-semibold"
            : textFontWeight === "bold"
              ? "font-bold"
              : "font-normal";
      const blockTypoClass = [blockFontClass, blockSizeClass, blockWeightClass].filter(Boolean).join(" ");

      const titleFontFamily = String(block.settings.titleFontFamily ?? "inherit");
      const titleFontSize = String(block.settings.titleFontSize ?? "inherit");
      const titleFontWeight = String(block.settings.titleFontWeight ?? "inherit");
      const titleColor = String(block.settings.titleColor ?? "inherit");
      const titleCustomColor = String(block.settings.titleCustomColor ?? "#18181b");
      const titleLineHeight = String(block.settings.titleLineHeight ?? "normal");
      const titleLetterSpacing = String(block.settings.titleLetterSpacing ?? "normal");
      const titleFontClass =
        (titleFontFamily === "inherit" ? textFontFamily : titleFontFamily) !== "inherit"
          ? `font-hero-${titleFontFamily === "inherit" ? textFontFamily : titleFontFamily}`
          : "";
      const titleSizeMap: Record<string, string> = {
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl",
        "5xl": "text-5xl",
      };
      const titleFontSizeCustom = String(block.settings.titleFontSizeCustom ?? "3");
      const titleSizeClass =
        titleFontSize === "inherit" ? "" : titleFontSize === "custom" ? "" : titleSizeMap[titleFontSize] ?? "text-3xl";
      const titleSizeStyle =
        titleFontSize === "custom"
          ? ({ fontSize: `${Math.max(0.5, Math.min(8, parseFloat(titleFontSizeCustom) || 3))}rem` } as CSSProperties)
          : undefined;
      const titleWeightClass =
        (titleFontWeight === "inherit" ? textFontWeight : titleFontWeight) === "medium"
          ? "font-medium"
          : (titleFontWeight === "inherit" ? textFontWeight : titleFontWeight) === "semibold"
            ? "font-semibold"
            : (titleFontWeight === "inherit" ? textFontWeight : titleFontWeight) === "bold"
              ? "font-bold"
              : "font-normal";
      const titleLineClass =
        titleLineHeight === "tight" ? "leading-tight" : titleLineHeight === "relaxed" ? "leading-relaxed" : "leading-normal";
      const titleLetterClass =
        titleLetterSpacing === "tight" ? "tracking-tight" : titleLetterSpacing === "wide" ? "tracking-wide" : "tracking-normal";
      const titleColorStyle =
        titleColor === "inherit"
          ? undefined
          : titleColor === "primary"
            ? ({ color: theme.primary } as CSSProperties)
            : titleColor === "accent"
              ? ({ color: theme.accent } as CSSProperties)
              : titleColor === "custom"
                ? ({ color: /^#[0-9A-Fa-f]{6}$/.test(titleCustomColor) ? titleCustomColor : "#18181b" } as CSSProperties)
                : undefined;

      const subtitleFontFamily = String(block.settings.subtitleFontFamily ?? "inherit");
      const subtitleFontSize = String(block.settings.subtitleFontSize ?? "inherit");
      const subtitleFontWeight = String(block.settings.subtitleFontWeight ?? "inherit");
      const subtitleColor = String(block.settings.subtitleColor ?? "inherit");
      const subtitleCustomColor = String(block.settings.subtitleCustomColor ?? "#52525b");
      const subtitleLineHeight = String(block.settings.subtitleLineHeight ?? "normal");
      const subtitleLetterSpacing = String(block.settings.subtitleLetterSpacing ?? "normal");
      const subtitleFontClass =
        (subtitleFontFamily === "inherit" ? textFontFamily : subtitleFontFamily) !== "inherit"
          ? `font-hero-${subtitleFontFamily === "inherit" ? textFontFamily : subtitleFontFamily}`
          : "";
      const subtitleSizeMap: Record<string, string> = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      };
      const subtitleFontSizeCustom = String(block.settings.subtitleFontSizeCustom ?? "1.25");
      const subtitleSizeClass =
        subtitleFontSize === "inherit" ? "text-xl" : subtitleFontSize === "custom" ? "" : subtitleSizeMap[subtitleFontSize] ?? "text-xl";
      const subtitleSizeStyle =
        subtitleFontSize === "custom"
          ? ({ fontSize: `${Math.max(0.5, Math.min(4, parseFloat(subtitleFontSizeCustom) || 1.25))}rem` } as CSSProperties)
          : undefined;
      const subtitleWeightClass =
        (subtitleFontWeight === "inherit" ? textFontWeight : subtitleFontWeight) === "medium"
          ? "font-medium"
          : (subtitleFontWeight === "inherit" ? textFontWeight : subtitleFontWeight) === "semibold"
            ? "font-semibold"
            : (subtitleFontWeight === "inherit" ? textFontWeight : subtitleFontWeight) === "bold"
              ? "font-bold"
              : "font-normal";
      const subtitleLineClass =
        subtitleLineHeight === "tight" ? "leading-tight" : subtitleLineHeight === "relaxed" ? "leading-relaxed" : "leading-normal";
      const subtitleLetterClass =
        subtitleLetterSpacing === "tight" ? "tracking-tight" : subtitleLetterSpacing === "wide" ? "tracking-wide" : "tracking-normal";
      const subtitleColorStyle =
        subtitleColor === "inherit"
          ? undefined
          : subtitleColor === "primary"
            ? ({ color: theme.primary } as CSSProperties)
            : subtitleColor === "accent"
              ? ({ color: theme.accent } as CSSProperties)
              : subtitleColor === "custom"
                ? ({ color: /^#[0-9A-Fa-f]{6}$/.test(subtitleCustomColor) ? subtitleCustomColor : "#52525b" } as CSSProperties)
                : undefined;

      const bodyFontFamily = String(block.settings.bodyFontFamily ?? "inherit");
      const bodyFontSize = String(block.settings.bodyFontSize ?? "inherit");
      const bodyFontWeight = String(block.settings.bodyFontWeight ?? "inherit");
      const bodyColor = String(block.settings.bodyColor ?? "inherit");
      const bodyCustomColor = String(block.settings.bodyCustomColor ?? "#3f3f46");
      const bodyLineHeight = String(block.settings.bodyLineHeight ?? "normal");
      const bodyLetterSpacing = String(block.settings.bodyLetterSpacing ?? "normal");
      const bodyLetterClass =
        bodyLetterSpacing === "tight" ? "tracking-tight" : bodyLetterSpacing === "wide" ? "tracking-wide" : "tracking-normal";
      const bodyFontClass =
        (bodyFontFamily === "inherit" ? textFontFamily : bodyFontFamily) !== "inherit"
          ? `font-hero-${bodyFontFamily === "inherit" ? textFontFamily : bodyFontFamily}`
          : "";
      const bodySizeMap: Record<string, string> = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
      };
      const bodyFontSizeCustom = String(block.settings.bodyFontSizeCustom ?? "1");
      const bodySizeClass =
        bodyFontSize === "inherit" ? "text-base" : bodyFontSize === "custom" ? "" : bodySizeMap[bodyFontSize] ?? "text-base";
      const bodySizeStyle =
        bodyFontSize === "custom"
          ? ({ fontSize: `${Math.max(0.5, Math.min(2, parseFloat(bodyFontSizeCustom) || 1))}rem` } as CSSProperties)
          : undefined;
      const bodyProseSize = String(block.settings.bodyProseSize ?? "sm");
      const bodyLinkColor = String(block.settings.bodyLinkColor ?? "accent");
      const bodyLinkCustomColor = String(block.settings.bodyLinkCustomColor ?? "#6366f1");
      const proseSizeClass =
        bodyProseSize === "base" ? "prose" : bodyProseSize === "lg" ? "prose-lg" : "prose-sm";
      const proseLinkColor =
        bodyLinkColor === "inherit"
          ? "currentColor"
          : bodyLinkColor === "primary"
            ? theme.primary
            : bodyLinkColor === "custom" && /^#[0-9A-Fa-f]{6}$/.test(bodyLinkCustomColor)
              ? bodyLinkCustomColor
              : theme.accent;
      const bodyWeightClass =
        (bodyFontWeight === "inherit" ? textFontWeight : bodyFontWeight) === "medium"
          ? "font-medium"
          : (bodyFontWeight === "inherit" ? textFontWeight : bodyFontWeight) === "semibold"
            ? "font-semibold"
            : (bodyFontWeight === "inherit" ? textFontWeight : bodyFontWeight) === "bold"
              ? "font-bold"
              : "font-normal";
      const bodyLineClass =
        bodyLineHeight === "tight" ? "leading-tight" : bodyLineHeight === "relaxed" ? "leading-relaxed" : "leading-normal";
      const titleTransformClass =
        titleTextTransform === "uppercase" ? "uppercase" : titleTextTransform === "lowercase" ? "lowercase" : titleTextTransform === "capitalize" ? "capitalize" : "";
      const bodyColorStyle =
        bodyColor === "inherit"
          ? undefined
          : bodyColor === "primary"
            ? ({ color: theme.primary } as CSSProperties)
            : bodyColor === "accent"
              ? ({ color: theme.accent } as CSSProperties)
              : bodyColor === "custom"
                ? ({ color: /^#[0-9A-Fa-f]{6}$/.test(bodyCustomColor) ? bodyCustomColor : "#3f3f46" } as CSSProperties)
                : undefined;

      const layoutClass =
        textLayout === "center"
          ? "text-center"
          : textLayout === "right"
            ? "text-right"
            : "text-left";
      const titleAlignClass =
        titleAlign === "inherit"
          ? ""
          : titleAlign === "center"
            ? "text-center"
            : titleAlign === "right"
              ? "text-right"
              : "text-left";
      const subtitleAlignClass =
        subtitleAlign === "inherit"
          ? ""
          : subtitleAlign === "center"
            ? "text-center"
            : subtitleAlign === "right"
              ? "text-right"
              : "text-left";
      const maxWidthClass =
        textContentMaxWidth === "narrow"
          ? "max-w-2xl"
          : textContentMaxWidth === "wide"
            ? "max-w-4xl"
            : textContentMaxWidth === "full"
              ? "max-w-none"
              : "max-w-3xl";
      const cardVariant =
        textCardStyle === "none"
          ? "none"
          : textCardStyle === "elevated"
            ? "elevated"
            : textCardStyle === "filled"
              ? "filled"
              : "outlined";
      const cardPaddingClass =
        textContentPadding === "sm"
          ? "p-4"
          : textContentPadding === "lg"
            ? "p-8"
            : "p-6";

      const TitleTag = titleHeadingLevel === "h1" ? "h1" : titleHeadingLevel === "h3" ? "h3" : "h2";
      const dividerColor =
        titleSubtitleDividerColor === "primary"
          ? theme.primary
          : titleSubtitleDividerColor === "accent"
            ? theme.accent
            : "currentColor";
      const dividerOpacity = titleSubtitleDividerColor === "inherit" ? 0.3 : 1;
      const dividerEl =
        titleSubtitleDivider !== "none" ? (
          titleSubtitleDivider === "dot" ? (
            <div
              key="divider"
              className={`my-4 h-1.5 w-1.5 rounded-full ${layoutClass === "text-center" ? "mx-auto" : layoutClass === "text-right" ? "ml-auto" : ""}`}
              style={{ backgroundColor: dividerColor, opacity: dividerOpacity }}
              aria-hidden
            />
          ) : (
            <div
              key="divider"
              className={`my-4 ${
                titleSubtitleDividerWidth === "full"
                  ? "w-full"
                  : titleSubtitleDividerWidth === "medium"
                    ? "w-24"
                    : "w-16"
              } ${layoutClass === "text-center" ? "mx-auto" : layoutClass === "text-right" ? "ml-auto" : ""}`}
              style={{
                borderColor: dividerColor,
                borderTopWidth: 2,
                borderTopStyle:
                  titleSubtitleDividerStyle === "dotted"
                    ? "dotted"
                    : titleSubtitleDividerStyle === "dashed"
                      ? "dashed"
                      : "solid",
                opacity: dividerOpacity,
              }}
              aria-hidden
            />
          )
        ) : null;

      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={`${containerClass} ${layoutClass} ${blockTypoClass}`} style={style}>
            {subtitlePosition === "above" && subtitleVisible && subtitle && (
              <p
                className={`mb-2 ${subtitleSizeClass || "text-xl"} ${subtitleWeightClass} ${subtitleFontClass} ${subtitleLineClass} ${subtitleLetterClass} ${subtitleColor === "inherit" ? "text-zinc-600" : ""} ${subtitleAlignClass || layoutClass}`}
                style={{ ...subtitleColorStyle, ...subtitleSizeStyle }}
              >
                {subtitleUseHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: subtitle }} />
                ) : (
                  subtitle
                )}
              </p>
            )}
            <TitleTag
              className={`mb-4 ${titleSizeClass || "text-3xl"} ${titleWeightClass} ${titleFontClass} ${titleLineClass} ${titleLetterClass} ${titleTransformClass} ${titleAlignClass || layoutClass}`}
              style={{ ...titleColorStyle, ...titleSizeStyle }}
            >
              {titleUseHtml ? (
                <span dangerouslySetInnerHTML={{ __html: String(block.settings.title ?? "Section") }} />
              ) : (
                String(block.settings.title ?? "Section")
              )}
            </TitleTag>
            {dividerEl}
            {subtitlePosition === "below" && subtitleVisible && subtitle && (
              <p
                className={`mb-4 ${subtitleSizeClass || "text-xl"} ${subtitleWeightClass} ${subtitleFontClass} ${subtitleLineClass} ${subtitleLetterClass} ${subtitleColor === "inherit" ? "text-zinc-600" : ""} ${subtitleAlignClass || layoutClass}`}
                style={{ ...subtitleColorStyle, ...subtitleSizeStyle }}
              >
                {subtitleUseHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: subtitle }} />
                ) : (
                  subtitle
                )}
              </p>
            )}
            <div className={`mx-auto w-full ${maxWidthClass}`}>
              <Card
                variant={cardVariant as "outlined" | "elevated" | "filled" | "none"}
                className={`${cardVariant !== "none" ? "border-zinc-200 bg-white/70" : ""} ${cardPaddingClass}`}
              >
                <div className={textLayoutColumns === "two" ? "columns-1 md:columns-2 gap-6" : ""}>
                  {isHtml ? (
                    <div
                      className={`prose max-w-none text-zinc-700 ${proseSizeClass} ${bodyFontClass} ${bodySizeClass || "text-base"} ${bodyWeightClass} ${bodyLineClass} ${bodyLetterClass} ${textLayoutColumns === "two" ? "break-inside-avoid" : ""}`}
                      style={{ ...bodyColorStyle, ...bodySizeStyle, ["--link-color" as string]: proseLinkColor } as CSSProperties}
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  ) : (
                    <p
                      className={`whitespace-pre-wrap ${bodyFontClass} ${bodySizeClass || "text-base"} ${bodyWeightClass} ${bodyLineClass} ${bodyLetterClass} ${bodyColor === "inherit" ? "text-zinc-700" : ""}`}
                      style={{ ...bodyColorStyle, ...bodySizeStyle }}
                    >
                      {body}
                    </p>
                  )}
                  {ctaText && (() => {
                    const bgColor = ctaColor === "primary" ? theme.primary : ctaColor === "custom" && /^#[0-9A-Fa-f]{6}$/.test(ctaCustomColor) ? ctaCustomColor : theme.accent;
                    const textCol = ctaTextColor === "custom" && /^#[0-9A-Fa-f]{6}$/.test(ctaTextCustomColor) ? ctaTextCustomColor : ctaTextColor === "white" ? "#ffffff" : ctaTextColor === "primary" ? theme.primary : "#ffffff";
                    const borderW = ctaBorderWidth === "none" ? 0 : ctaBorderWidth === "thin" ? 1 : ctaBorderWidth === "thick" ? 4 : 2;
                    const radius = ctaBorderRadius === "none" ? 0 : ctaBorderRadius === "sm" ? 4 : ctaBorderRadius === "lg" ? 8 : ctaBorderRadius === "full" ? 9999 : 6;
                    const sizeClass = ctaSize === "compact" ? "px-4 py-2" : ctaSize === "large" ? "px-8 py-4" : "px-6 py-3";
                    const fontSizeClass = ctaFontSize === "sm" ? "text-sm" : ctaFontSize === "lg" ? "text-lg" : "text-base";
                    const style: CSSProperties = ctaStyle === "primary"
                      ? { backgroundColor: bgColor, color: textCol, borderWidth: borderW, borderRadius: radius }
                      : ctaStyle === "outline"
                        ? { borderColor: bgColor, color: bgColor, borderWidth: borderW, borderRadius: radius }
                        : { color: bgColor };
                    return (
                      <Link
                        href={ctaHref || "#"}
                        className={`mt-4 inline-flex ${sizeClass} ${fontSizeClass} font-medium transition hover:opacity-90 ${ctaStyle === "outline" ? "border" : ""}`}
                        style={style}
                      >
                        {ctaText}
                      </Link>
                    );
                  })()}
                </div>
              </Card>
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "skills") {
      const subtitle = String(block.settings.subtitle ?? "");
      const dataSource = String(block.settings.skillsDataSource ?? "auto");
      const blockSegments = Array.isArray(block.settings.segments)
        ? (block.settings.segments as Array<{ name?: string; skills?: string[]; skillUrls?: string[]; icon?: string }>).filter(
            (s) => (s.name ?? "").trim() || (s.skills ?? []).some((sk) => (sk ?? "").trim()),
          )
        : [];
      const legacyItems = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ name?: string; category?: string }>).filter((i) => (i.name ?? "").trim())
        : [];
      const apiItems = skills.slice(0, 50);
      const useBlock = dataSource === "block" || (dataSource === "auto" && blockSegments.length > 0);
      const useLegacy = !useBlock && (dataSource === "auto" && legacyItems.length > 0);
      const useApi = !useBlock && !useLegacy && (dataSource === "profile" || (dataSource === "auto" && apiItems.length > 0));
      const hasBlockSegments = useBlock && blockSegments.length > 0;
      const hasLegacy = useLegacy && legacyItems.length > 0;
      const hasApi = useApi && apiItems.length > 0;
      const emptyMessage = String(
        block.settings.emptyMessage ?? "Add segments below or from your admin profile.",
      );
      const maxPerSeg = Math.max(0, Number(block.settings.maxSkillsPerSegment ?? 0));

      const segmentsToRender = hasBlockSegments
        ? blockSegments.map((s) => ({
            name: (s.name ?? "").trim() || "Skills",
            icon: (s as { icon?: string }).icon,
            skills: (s.skills ?? [])
              .filter((sk) => (sk ?? "").trim())
              .slice(0, maxPerSeg > 0 ? maxPerSeg : undefined),
            skillUrls: s.skillUrls ?? [],
          }))
        : hasLegacy
          ? (() => {
              const byCategory = new Map<string, string[]>();
              for (const i of legacyItems) {
                const cat = (i.category ?? "").trim() || "Skills";
                if (!byCategory.has(cat)) byCategory.set(cat, []);
                byCategory.get(cat)!.push(i.name!.trim());
              }
              return Array.from(byCategory.entries()).map(([name, skills]) => ({
                name,
                icon: undefined as string | undefined,
                skills: maxPerSeg > 0 ? skills.slice(0, maxPerSeg) : skills,
                skillUrls: [] as string[],
              }));
            })()
          : hasApi
            ? (() => {
                const byCategory = new Map<string, string[]>();
                for (const s of apiItems) {
                  const cat = s.category?.trim() || "Skills";
                  if (!byCategory.has(cat)) byCategory.set(cat, []);
                  byCategory.get(cat)!.push(s.name);
                }
                return Array.from(byCategory.entries()).map(([name, skills]) => ({
                  name,
                  icon: undefined as string | undefined,
                  skills: maxPerSeg > 0 ? skills.slice(0, maxPerSeg) : skills,
                  skillUrls: [] as string[],
                }));
              })()
            : [];

      const align = String(block.settings.segmentAlign ?? "left");
      const alignClass =
        align === "center" ? "text-center items-center" : align === "right" ? "text-right items-end" : "text-left items-start";
      const headerAlign = String(block.settings.skillsHeaderAlign ?? "left");
      const headerAlignClass =
        headerAlign === "center" ? "text-center" : headerAlign === "right" ? "text-right" : "text-left";
      const design = String(block.settings.segmentDesign ?? "badges");
      const layout = String(block.settings.segmentLayout ?? "vertical");
      const segmentCols = Math.min(6, Math.max(1, Number(block.settings.segmentGridColumns ?? 2)));
      const segmentColsMobile = Math.min(6, Math.max(1, Number(block.settings.segmentGridColumnsMobile ?? 1)));
      const skillsCols = Math.min(6, Math.max(0, Number(block.settings.skillsGridColumns ?? 0)));
      const skillsColsMobile = Math.min(6, Math.max(0, Number(block.settings.skillsGridColumnsMobile ?? 0)));
      const skillColor = String(block.settings.skillColor ?? "accent");
      const skillSize = String(block.settings.skillSize ?? "md");
      const skillUniformWidth = Boolean(block.settings.skillUniformWidth ?? false);

      const segmentGap = String(block.settings.segmentGap ?? "md");
      const segmentGapClass = segmentGap === "none" ? "gap-0" : segmentGap === "sm" ? "gap-4" : segmentGap === "lg" ? "gap-8" : "gap-6";
      const headerGap = String(block.settings.headerGap ?? "md");
      const headerGapClass = headerGap === "none" ? "" : headerGap === "sm" ? "mt-1" : headerGap === "lg" ? "mt-3" : "mt-2";
      const SEGMENT_GRID_CLASS: Record<number, string> = {
        1: "grid grid-cols-1",
        2: "grid md:grid-cols-2",
        3: "grid md:grid-cols-2 lg:grid-cols-3",
        4: "grid md:grid-cols-2 lg:grid-cols-4",
        5: "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        6: "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
      };
      const segmentGridClass =
        layout === "horizontal"
          ? `${SEGMENT_GRID_CLASS[segmentCols] ?? SEGMENT_GRID_CLASS[2]} ${segmentGapClass}`
          : "";

      const SKILLS_GRID_CLASS: Record<number, string> = {
        1: "grid grid-cols-1 gap-2",
        2: "grid grid-cols-2 gap-2",
        3: "grid grid-cols-2 md:grid-cols-3 gap-2",
        4: "grid grid-cols-2 md:grid-cols-4 gap-2",
        5: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2",
        6: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2",
      };
      const skillsGridClass = skillsCols > 0 ? SKILLS_GRID_CLASS[skillsCols] ?? "" : "";

      const getSkillColorStyle = (): CSSProperties => {
        const bg = skillCustomColor
          ? skillCustomColor
          : skillColor === "primary"
            ? "var(--portfolio-primary)"
            : skillColor === "neutral"
              ? "#e4e4e7"
              : "var(--portfolio-accent)";
        let textColor: string;
        if (skillTextColor === "white") textColor = "white";
        else if (skillTextColor === "black") textColor = "#18181b";
        else if (skillTextColor === "custom") textColor = skillTextCustomColor;
        else if (skillColor === "neutral") textColor = "#18181b";
        else textColor = "white";
        return { backgroundColor: bg, color: textColor };
      };
      const sizeClass = skillSize === "sm" ? "text-xs px-2 py-0.5" : skillSize === "lg" ? "text-base px-5 py-2" : "text-sm px-3 py-1";

      const siteFont = String(siteConfig.fontFamily ?? "inherit");
      const skillsTitleFontFamily = String(block.settings.skillsTitleFontFamily ?? "inherit");
      const skillsTitleFontSize = String(block.settings.skillsTitleFontSize ?? "inherit");
      const skillsTitleFontWeight = String(block.settings.skillsTitleFontWeight ?? "bold");
      const skillsTitleColor = String(block.settings.skillsTitleColor ?? "inherit");
      const skillsTitleCustomColor = String(block.settings.skillsTitleCustomColor ?? "").trim() || theme.primary;
      const skillsSubtitleFontFamily = String(block.settings.skillsSubtitleFontFamily ?? "inherit");
      const skillsSubtitleFontSize = String(block.settings.skillsSubtitleFontSize ?? "inherit");
      const skillsSubtitleColor = String(block.settings.skillsSubtitleColor ?? "inherit");
      const skillsSubtitleCustomColor = String(block.settings.skillsSubtitleCustomColor ?? "").trim() || "#52525b";

      const skillsTitleFontClass =
        (skillsTitleFontFamily === "inherit" ? siteFont : skillsTitleFontFamily) !== "inherit"
          ? `font-hero-${skillsTitleFontFamily === "inherit" ? siteFont : skillsTitleFontFamily}`
          : "";
      const skillsTitleSizeMap: Record<string, string> = { "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl" };
      const skillsTitleSizeClass =
        skillsTitleFontSize === "inherit" ? "text-3xl" : skillsTitleSizeMap[skillsTitleFontSize] ?? "text-3xl";
      const skillsTitleWeightClass =
        skillsTitleFontWeight === "inherit"
          ? "font-bold"
          : skillsTitleFontWeight === "medium"
            ? "font-medium"
            : skillsTitleFontWeight === "semibold"
              ? "font-semibold"
              : skillsTitleFontWeight === "normal"
                ? "font-normal"
                : "font-bold";
      const skillsTitleColorStyle = (): CSSProperties | undefined => {
        if (skillsTitleColor === "inherit") return undefined;
        if (skillsTitleColor === "primary") return { color: "var(--portfolio-primary)" };
        if (skillsTitleColor === "accent") return { color: "var(--portfolio-accent)" };
        if (skillsTitleColor === "custom") return { color: skillsTitleCustomColor };
        return undefined;
      };

      const skillsSubtitleFontWeight = String(block.settings.skillsSubtitleFontWeight ?? "inherit");
      const skillsSubtitleWeightClass =
        skillsSubtitleFontWeight === "inherit"
          ? ""
          : skillsSubtitleFontWeight === "medium"
            ? "font-medium"
            : skillsSubtitleFontWeight === "semibold"
              ? "font-semibold"
              : skillsSubtitleFontWeight === "bold"
                ? "font-bold"
                : skillsSubtitleFontWeight === "normal"
                  ? "font-normal"
                  : "";
      const skillsSubtitleFontClass =
        (skillsSubtitleFontFamily === "inherit" ? siteFont : skillsSubtitleFontFamily) !== "inherit"
          ? `font-hero-${skillsSubtitleFontFamily === "inherit" ? siteFont : skillsSubtitleFontFamily}`
          : "";
      const skillsSubtitleSizeMap: Record<string, string> = { sm: "text-sm", base: "text-base", lg: "text-lg" };
      const skillsSubtitleSizeClass =
        skillsSubtitleFontSize === "inherit" ? "text-base" : skillsSubtitleSizeMap[skillsSubtitleFontSize] ?? "text-base";
      const skillsSubtitleColorStyle = (): CSSProperties | undefined => {
        if (skillsSubtitleColor === "inherit") return undefined;
        if (skillsSubtitleColor === "primary") return { color: "var(--portfolio-primary)" };
        if (skillsSubtitleColor === "accent") return { color: "var(--portfolio-accent)" };
        if (skillsSubtitleColor === "custom") return { color: skillsSubtitleCustomColor };
        return undefined;
      };

      const segmentTitleFontFamily = String(block.settings.segmentTitleFontFamily ?? "inherit");
      const segmentTitleFontSize = String(block.settings.segmentTitleFontSize ?? "inherit");
      const segmentTitleFontWeight = String(block.settings.segmentTitleFontWeight ?? "semibold");
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
      const segmentTitleFontClass =
        (segmentTitleFontFamily === "inherit" ? siteFont : segmentTitleFontFamily) !== "inherit"
          ? `font-hero-${segmentTitleFontFamily === "inherit" ? siteFont : segmentTitleFontFamily}`
          : "";
      const segmentTitleSizeMap: Record<string, string> = { sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl" };
      const segmentTitleSizeClass =
        segmentTitleFontSize === "inherit" ? "text-lg" : segmentTitleSizeMap[segmentTitleFontSize] ?? "text-lg";
      const segmentTitleWeightClass =
        segmentTitleFontWeight === "inherit"
          ? "font-semibold"
          : segmentTitleFontWeight === "medium"
            ? "font-medium"
            : segmentTitleFontWeight === "bold"
              ? "font-bold"
              : segmentTitleFontWeight === "normal"
                ? "font-normal"
                : "font-semibold";
      const segmentTitleColorStyle = (): CSSProperties | undefined => {
        if (segmentTitleColor === "inherit") return undefined;
        if (segmentTitleColor === "primary") return { color: "var(--portfolio-primary)" };
        if (segmentTitleColor === "accent") return { color: "var(--portfolio-accent)" };
        if (segmentTitleColor === "custom") return { color: segmentTitleCustomColor };
        return { color: "var(--portfolio-accent)" };
      };
      const segmentTitleBgStyle = (): CSSProperties | undefined => {
        if (segmentTitleBgColor === "none") return undefined;
        if (segmentTitleBgColor === "custom") return { backgroundColor: segmentTitleBgCustomColor };
        if (segmentTitleBgColor === "accent") return { backgroundColor: "var(--portfolio-accent)", color: "white" };
        if (segmentTitleBgColor === "primary") return { backgroundColor: "var(--portfolio-primary)", color: "white" };
        return undefined;
      };
      const segmentTitlePaddingClass =
        segmentTitlePadding === "sm" ? "px-2 py-0.5" : segmentTitlePadding === "md" ? "px-3 py-1" : segmentTitlePadding === "lg" ? "px-4 py-2" : "";
      const segmentTitleRadiusClass =
        segmentTitleBorderRadius === "sm" ? "rounded" : segmentTitleBorderRadius === "md" ? "rounded-md" : segmentTitleBorderRadius === "lg" ? "rounded-lg" : segmentTitleBorderRadius === "full" ? "rounded-full" : "";
      const segmentTitleBorderClass =
        segmentTitleBorder === "none" ? "border-0" : segmentTitleBorder === "sm" ? "border" : segmentTitleBorder === "md" ? "border-2" : segmentTitleBorder === "lg" ? "border-[3px]" : "border-0";
      const segmentTitleBorderColorStyle = (): CSSProperties | undefined => {
        if (segmentTitleBorder === "none") return undefined;
        if (segmentTitleBorderColor === "accent") return { borderColor: "var(--portfolio-accent)" };
        if (segmentTitleBorderColor === "primary") return { borderColor: "var(--portfolio-primary)" };
        if (segmentTitleBorderColor === "custom") return { borderColor: segmentTitleBorderCustomColor };
        return { borderColor: "#d4d4d8" };
      };
      const segmentTitleShadowClass =
        segmentTitleShadow === "sm" ? "shadow-sm" : segmentTitleShadow === "md" ? "shadow-md" : segmentTitleShadow === "lg" ? "shadow-lg" : "";

      const skillFontWeight = String(block.settings.skillFontWeight ?? "medium");
      const skillTextColor = String(block.settings.skillTextColor ?? "auto");
      const skillTextCustomColor = String(block.settings.skillTextCustomColor ?? "").trim() || "#ffffff";
      const skillCustomColor = String(block.settings.skillCustomColor ?? "").trim();
      const skillBorderRadius = String(block.settings.skillBorderRadius ?? "md");
      const skillHoverEffect = String(block.settings.skillHoverEffect ?? "subtle");
      const skillHoverClass =
        skillHoverEffect === "none"
          ? ""
          : skillHoverEffect === "subtle"
            ? "transition-opacity hover:opacity-90"
            : skillHoverEffect === "lift"
              ? "transition-transform hover:scale-105"
              : skillHoverEffect === "glow"
                ? "transition-shadow hover:shadow-md"
                : "";
      const skillWeightClass =
        skillFontWeight === "normal" ? "font-normal" : skillFontWeight === "semibold" ? "font-semibold" : skillFontWeight === "bold" ? "font-bold" : "font-medium";
      const skillRadiusClass =
        skillBorderRadius === "none" ? "" : skillBorderRadius === "sm" ? "rounded" : skillBorderRadius === "lg" ? "rounded-lg" : skillBorderRadius === "full" ? "rounded-full" : "rounded-md";

      const uniformGridBase =
        skillUniformWidth
          ? skillsCols > 0
            ? (SKILLS_GRID_CLASS[skillsCols] ?? "grid grid-cols-2 gap-2")
            : "grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2"
          : "";
      const uniformItemClass = skillUniformWidth ? "flex justify-center items-center w-full min-w-0" : "";

      const renderSkillContent = (skill: string, url?: string) => {
        const content = <>{skill}</>;
        if (url && url.trim().startsWith("http")) {
          return (
            <a href={url.trim()} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:underline">
              {content}
            </a>
          );
        }
        return content;
      };

      const renderSkills = (segSkills: string[], segSkillUrls?: string[]) => {
        const urls = segSkillUrls ?? [];
        const colorStyle = getSkillColorStyle();
        const justifyClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "";
        const gridAlignClass =
          (skillsGridClass || uniformGridBase) && align === "center"
            ? " justify-items-center"
            : (skillsGridClass || uniformGridBase) && align === "right"
              ? " justify-items-end"
              : "";
        const baseLayoutClass = skillsGridClass
          ? `${skillsGridClass}${gridAlignClass}`
          : `flex flex-wrap gap-2 ${justifyClass}`;
        const layoutClass = skillUniformWidth
          ? `${uniformGridBase}${gridAlignClass}`
          : baseLayoutClass;
        if (design === "badges") {
          return (
            <div className={layoutClass}>
              {segSkills.map((skill, i) => (
                <span
                  key={i}
                  className={`${skillWeightClass} ${skillRadiusClass || "rounded-md"} ${sizeClass} ${uniformItemClass} ${skillHoverClass} ${
                    skillColor === "neutral" && !skillCustomColor ? "border border-zinc-300 bg-zinc-100 text-zinc-700" : ""
                  }`}
                  style={skillColor === "neutral" && !skillCustomColor ? undefined : colorStyle}
                >
                  {renderSkillContent(skill, urls[i])}
                </span>
              ))}
            </div>
          );
        }
        if (design === "pills") {
          return (
            <div className={layoutClass}>
              {segSkills.map((skill, i) => (
                <span
                  key={i}
                  className={`${skillWeightClass} ${skillRadiusClass || "rounded-full"} ${sizeClass} ${uniformItemClass} ${skillHoverClass}`}
                  style={colorStyle}
                >
                  {renderSkillContent(skill, urls[i])}
                </span>
              ))}
            </div>
          );
        }
        if (design === "cards") {
          return (
            <div className={layoutClass}>
              {segSkills.map((skill, i) => (
                <Card
                  key={i}
                  variant="outlined"
                  className={`px-4 py-2 ${skillWeightClass} ${skillHoverClass} ${skillSize === "sm" ? "text-xs" : skillSize === "lg" ? "text-base" : "text-sm"} ${uniformItemClass} text-center`}
                  style={
                    skillColor !== "neutral" || skillCustomColor
                      ? { backgroundColor: colorStyle.backgroundColor, color: colorStyle.color, borderColor: colorStyle.backgroundColor }
                      : undefined
                  }
                >
                  {renderSkillContent(skill, urls[i])}
                </Card>
              ))}
            </div>
          );
        }
        if (design === "list") {
          return (
            <ul className={`list-inside list-disc space-y-1 ${alignClass}`}>
              {segSkills.map((skill, i) => (
                <li key={i} className={`text-zinc-700 ${skillWeightClass}`}>
                  {renderSkillContent(skill, urls[i])}
                </li>
              ))}
            </ul>
          );
        }
        if (design === "compact") {
          return (
            <div className={layoutClass}>
              {segSkills.map((skill, i) => (
                <span
                  key={i}
                  className={`border border-zinc-300 bg-zinc-50 text-zinc-700 ${skillWeightClass} ${skillRadiusClass || "rounded"} ${sizeClass} ${uniformItemClass} ${skillHoverClass}`}
                  style={
                    skillCustomColor
                      ? { backgroundColor: skillCustomColor, color: skillTextColor === "custom" ? skillTextCustomColor : "white", borderColor: "transparent" }
                      : undefined
                  }
                >
                  {renderSkillContent(skill, urls[i])}
                </span>
              ))}
            </div>
          );
        }
        return null;
      };

      const sectionBgColor = String(block.settings.sectionBgColor ?? "none");
      const sectionBgStyle =
        sectionBgColor === "custom"
          ? { backgroundColor: String(block.settings.sectionBgCustomColor ?? "#fafafa") }
          : sectionBgColor === "light"
            ? { backgroundColor: "#f4f4f5" }
            : undefined;
      const sectionPadding = String(block.settings.sectionPadding ?? "md");
      const sectionPaddingClass =
        sectionPadding === "none" ? "" : sectionPadding === "sm" ? "py-4" : sectionPadding === "lg" ? "py-12" : "py-8";
      const sectionBorder = String(block.settings.sectionBorder ?? "none");
      const sectionBorderClass =
        sectionBorder === "top" ? "border-t border-zinc-200" : sectionBorder === "full" ? "border border-zinc-200" : "";

      return (
        <section
          id={sectionId(block)}
          className={`${sectionClass} ${sectionPaddingClass} ${sectionBorderClass}`}
          style={{ ...getBlockSectionStyle(block.style), ...sectionBgStyle }}
        >
          <div className={containerClass} style={style}>
            <div className={`mb-6 ${headerAlignClass}`}>
              <h2
                className={`${skillsTitleFontClass} ${skillsTitleSizeClass} ${skillsTitleWeightClass}`}
                style={skillsTitleColorStyle()}
              >
                {String(block.settings.title ?? "Skills")}
              </h2>
              {subtitle && (
                <p
                  className={`text-zinc-600 ${skillsSubtitleFontClass} ${skillsSubtitleSizeClass} ${skillsSubtitleWeightClass} ${headerGapClass}`}
                  style={skillsSubtitleColorStyle()}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {segmentsToRender.length > 0 ? (
              <div
                className={
                  layout === "horizontal"
                    ? `${segmentGridClass} ${alignClass}`
                    : `flex flex-col ${segmentGapClass} ${alignClass}`
                }
              >
                {segmentsToRender.map((seg, idx) => (
                  <div key={idx} className={layout === "horizontal" ? "" : "w-full"}>
                    <h3
                      className={`mb-3 border-solid ${segmentTitleFontClass} ${segmentTitleSizeClass} ${segmentTitleWeightClass} ${segmentTitlePaddingClass} ${segmentTitleRadiusClass} ${segmentTitleBorderClass} ${segmentTitleShadowClass}`}
                      style={{
                        ...(segmentTitleBgColor === "custom" || !segmentTitleBgColor || segmentTitleBgColor === "none"
                          ? segmentTitleColorStyle()
                          : {}),
                        ...(segmentTitleBgStyle() ?? {}),
                        ...(segmentTitleBorderColorStyle() ?? {}),
                      }}
                    >
                      {seg.icon && SEGMENT_ICON_MAP[seg.icon] && (
                        <span className="mr-2" aria-hidden>
                          {SEGMENT_ICON_MAP[seg.icon]}
                        </span>
                      )}
                      {seg.name}
                    </h3>
                    {renderSkills(seg.skills ?? [], seg.skillUrls)}
                  </div>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="w-full border-zinc-200 bg-white/80">
                <p className="text-zinc-600">{emptyMessage}</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "services") {
      const dataSource = String(block.settings.servicesDataSource ?? "auto");
      const blockItems = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ title?: string; description?: string; icon?: string }>).filter((i) => (i.title ?? "").trim())
        : [];
      const apiItems = services;
      const useBlock = dataSource === "block" || (dataSource === "auto" && blockItems.length > 0);
      const useApi = !useBlock && (dataSource === "profile" || (dataSource === "auto" && apiItems.length > 0));
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
      const serviceDescriptionCustomColor = String(block.settings.serviceDescriptionCustomColor ?? "").trim() || "#52525b";
      const serviceCardBorderRadius = String(block.settings.serviceCardBorderRadius ?? "md");
      const serviceCardBorder = String(block.settings.serviceCardBorder ?? "default");
      const serviceCardBorderColor = String(block.settings.serviceCardBorderColor ?? "neutral");
      const serviceCardBorderCustomColor = String(block.settings.serviceCardBorderCustomColor ?? "").trim() || "#d4d4d8";
      const serviceCardBgColor = String(block.settings.serviceCardBgColor ?? "default");
      const serviceCardBgCustomColor = String(block.settings.serviceCardBgCustomColor ?? "").trim() || "#ffffff";
      const serviceIconPosition = String(block.settings.serviceIconPosition ?? "top");
      const serviceIconAlign = String(block.settings.serviceIconAlign ?? "left");
      const serviceIconSize = String(block.settings.serviceIconSize ?? "md");
      const maxServices = Math.max(0, Number(block.settings.maxServices ?? 0));

      let items: { id: string; title: string; description: string | null; icon?: string }[] =
        useBlock && blockItems.length > 0
          ? blockItems.map((i, idx) => ({
              id: `block-${idx}`,
              title: i.title ?? "",
              description: i.description ?? null,
              icon: i.icon,
            }))
          : useApi
            ? apiItems.map((a) => ({ id: a.id, title: a.title, description: a.description, icon: undefined }))
            : [];
      if (maxServices > 0) items = items.slice(0, maxServices);

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
      const hoverClass =
        serviceHoverEffect === "none"
          ? ""
          : serviceHoverEffect === "lift"
            ? "transition-transform hover:-translate-y-0.5"
            : serviceHoverEffect === "glow"
              ? "transition-shadow hover:shadow-lg"
              : "transition-opacity hover:opacity-90";
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
      const cardBgStyle: CSSProperties | undefined =
        serviceCardBgColor === "custom"
          ? { backgroundColor: serviceCardBgCustomColor }
          : serviceCardBgColor === "subtle"
            ? { backgroundColor: "#f4f4f5" }
            : undefined;
      const cardBorderColorStyle: CSSProperties | undefined =
        serviceCardBorder !== "none"
          ? serviceCardBorderColor === "custom"
            ? { borderColor: serviceCardBorderCustomColor }
            : serviceCardBorderColor === "primary"
              ? { borderColor: "var(--portfolio-primary)" }
              : serviceCardBorderColor === "accent"
                ? { borderColor: "var(--portfolio-accent)" }
                : undefined
          : undefined;
      const cardStyle: CSSProperties = { ...cardBgStyle, ...cardBorderColorStyle };
      const iconSizeClass =
        serviceIconSize === "sm" ? "text-lg" : serviceIconSize === "lg" ? "text-3xl" : "text-2xl";
      const iconAlignClass =
        serviceIconAlign === "center" ? "text-center" : serviceIconAlign === "right" ? "text-right" : "text-left";
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
      const serviceDescColorStyle: CSSProperties | undefined =
        serviceDescriptionColor === "custom"
          ? { color: serviceDescriptionCustomColor }
          : serviceDescriptionColor === "muted"
            ? { color: "#52525b" }
            : undefined;

      const emptyMessage = String(block.settings.emptyMessage ?? "Add services below or from your admin profile.");

      const cardClass =
        serviceCardStyle === "elevated"
          ? "border-zinc-200 bg-white shadow-md"
          : serviceCardStyle === "minimal"
            ? "border-0 bg-zinc-50/80"
            : "border-zinc-200 bg-white/80";

      const alignClass =
        serviceAlignment === "center" ? "text-center" : serviceAlignment === "right" ? "text-right" : "text-left";

      const siteFont = String(siteConfig.fontFamily ?? "inherit");
      const servicesTitleFontFamily = String(block.settings.servicesTitleFontFamily ?? "inherit");
      const servicesTitleFontSize = String(block.settings.servicesTitleFontSize ?? "inherit");
      const servicesTitleFontWeight = String(block.settings.servicesTitleFontWeight ?? "bold");
      const servicesTitleColor = String(block.settings.servicesTitleColor ?? "inherit");
      const servicesTitleCustomColor = String(block.settings.servicesTitleCustomColor ?? "").trim() || theme.primary;
      const servicesSubtitleFontFamily = String(block.settings.servicesSubtitleFontFamily ?? "inherit");
      const servicesSubtitleFontSize = String(block.settings.servicesSubtitleFontSize ?? "inherit");
      const servicesSubtitleFontWeight = String(block.settings.servicesSubtitleFontWeight ?? "inherit");
      const servicesSubtitleColor = String(block.settings.servicesSubtitleColor ?? "inherit");
      const servicesSubtitleCustomColor = String(block.settings.servicesSubtitleCustomColor ?? "").trim() || "#52525b";

      const servicesTitleFontClass =
        (servicesTitleFontFamily === "inherit" ? siteFont : servicesTitleFontFamily) !== "inherit"
          ? `font-hero-${servicesTitleFontFamily === "inherit" ? siteFont : servicesTitleFontFamily}`
          : "";
      const servicesTitleSizeMap: Record<string, string> = { "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl" };
      const servicesTitleSizeClass =
        servicesTitleFontSize === "inherit" ? "text-3xl" : servicesTitleSizeMap[servicesTitleFontSize] ?? "text-3xl";
      const servicesTitleWeightClass =
        servicesTitleFontWeight === "inherit"
          ? "font-bold"
          : servicesTitleFontWeight === "medium"
            ? "font-medium"
            : servicesTitleFontWeight === "semibold"
              ? "font-semibold"
              : servicesTitleFontWeight === "normal"
                ? "font-normal"
                : "font-bold";
      const servicesTitleColorStyle = (): CSSProperties | undefined => {
        if (servicesTitleColor === "inherit") return undefined;
        if (servicesTitleColor === "primary") return { color: "var(--portfolio-primary)" };
        if (servicesTitleColor === "accent") return { color: "var(--portfolio-accent)" };
        if (servicesTitleColor === "custom") return { color: servicesTitleCustomColor };
        return undefined;
      };

      const servicesSubtitleFontClass =
        (servicesSubtitleFontFamily === "inherit" ? siteFont : servicesSubtitleFontFamily) !== "inherit"
          ? `font-hero-${servicesSubtitleFontFamily === "inherit" ? siteFont : servicesSubtitleFontFamily}`
          : "";
      const servicesSubtitleSizeMap: Record<string, string> = { sm: "text-sm", base: "text-base", lg: "text-lg" };
      const servicesSubtitleSizeClass =
        servicesSubtitleFontSize === "inherit" ? "text-base" : servicesSubtitleSizeMap[servicesSubtitleFontSize] ?? "text-base";
      const servicesSubtitleWeightClass =
        servicesSubtitleFontWeight === "inherit"
          ? ""
          : servicesSubtitleFontWeight === "normal"
            ? "font-normal"
            : servicesSubtitleFontWeight === "medium"
              ? "font-medium"
              : servicesSubtitleFontWeight === "semibold"
                ? "font-semibold"
                : servicesSubtitleFontWeight === "bold"
                  ? "font-bold"
                  : "";
      const servicesSubtitleColorStyle = (): CSSProperties | undefined => {
        if (servicesSubtitleColor === "inherit") return undefined;
        if (servicesSubtitleColor === "primary") return { color: "var(--portfolio-primary)" };
        if (servicesSubtitleColor === "accent") return { color: "var(--portfolio-accent)" };
        if (servicesSubtitleColor === "custom") return { color: servicesSubtitleCustomColor };
        return undefined;
      };

      const headerAlign = String(block.settings.servicesHeaderAlign ?? "left");
      const headerAlignClass =
        headerAlign === "center" ? "text-center" : headerAlign === "right" ? "text-right" : "text-left";
      const headerGap = String(block.settings.headerGap ?? "md");
      const headerGapClass = headerGap === "none" ? "" : headerGap === "sm" ? "mt-1" : headerGap === "lg" ? "mt-3" : "mt-2";

      const sectionBgColor = String(block.settings.sectionBgColor ?? "none");
      const sectionBgStyle =
        sectionBgColor === "custom"
          ? { backgroundColor: String(block.settings.sectionBgCustomColor ?? "#fafafa") }
          : sectionBgColor === "light"
            ? { backgroundColor: "#f4f4f5" }
            : undefined;
      const sectionPadding = String(block.settings.sectionPadding ?? "md");
      const sectionPaddingClass =
        sectionPadding === "none" ? "" : sectionPadding === "sm" ? "py-4" : sectionPadding === "lg" ? "py-12" : "py-8";
      const sectionBorder = String(block.settings.sectionBorder ?? "none");
      const sectionBorderClass =
        sectionBorder === "top" ? "border-t border-zinc-200" : sectionBorder === "full" ? "border border-zinc-200" : "";

      const renderServiceCard = (service: { id: string; title: string; description: string | null; icon?: string }) => {
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
        <section
          id={sectionId(block)}
          className={`${sectionClass} ${sectionPaddingClass} ${sectionBorderClass}`}
          style={{ ...getBlockSectionStyle(block.style), ...sectionBgStyle }}
        >
          <div className={containerClass} style={style}>
            <div className={`mb-6 ${headerAlignClass}`}>
              <h2
                className={`${servicesTitleFontClass} ${servicesTitleSizeClass} ${servicesTitleWeightClass}`}
                style={servicesTitleColorStyle()}
              >
                {String(block.settings.title ?? "Services")}
              </h2>
              {subtitle && (
                <p
                  className={`${servicesSubtitleFontClass} ${servicesSubtitleSizeClass} ${servicesSubtitleWeightClass} ${headerGapClass}`}
                  style={servicesSubtitleColorStyle()}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {items.length > 0 ? (
              serviceLayout === "list" ? (
                <div className={`flex flex-col ${gapClass}`}>
                  {items.map((service) => renderServiceCard(service))}
                </div>
              ) : serviceLayout === "compact" ? (
                <div className={`flex flex-wrap ${gapClass}`}>
                  {items.map((service) => (
                    <Card
                      key={service.id}
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
                  ))}
                </div>
              ) : (
                <div className={`grid ${baseColClass} ${gapClass} ${colClass}`}>
                  {items.map((service) => renderServiceCard(service))}
                </div>
              )
            ) : (
              <Card variant="outlined" className={cardClass}>
                <p className="text-zinc-600">{emptyMessage}</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "timeline") {
      const subtitle = String(block.settings.subtitle ?? "");
      const blockItems = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ type?: string; title?: string; description?: string; date?: string; tags?: string[] }>).filter(
            (i) => (i.title ?? "").trim()
          )
        : [];
      const apiItems = timeline.slice(0, 50);
      const items =
        blockItems.length > 0
          ? blockItems.map((i, idx) => ({
              id: `block-${idx}`,
              type: i.type ?? "Entry",
              title: i.title ?? "",
              description: i.description ?? null,
              date: i.date ?? new Date().toISOString().slice(0, 10),
              tags: i.tags ?? [],
            }))
          : apiItems;
      const emptyMessage = String(
        block.settings.emptyMessage ?? "Add entries below or from admin to populate this block.",
      );
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Timeline")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} variant="outlined" className="flex gap-4 border-zinc-200 bg-white/80">
                    <span className="shrink-0 text-sm font-medium" style={{ color: "var(--portfolio-accent)" }}>
                      {item.date && !Number.isNaN(Date.parse(item.date))
                        ? new Date(item.date).toLocaleDateString()
                        : item.date || ""}
                    </span>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                      )}
                      <Badge variant="default" className="mt-2">
                        {item.type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">{emptyMessage}</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "testimonials") {
      const items = testimonials.length > 0
        ? testimonials
        : Array.isArray(block.settings.items)
          ? (block.settings.items as Array<{ quote?: string; author?: string; role?: string }>).map((i) => ({
              id: "",
              quote: i.quote ?? "",
              author: i.author ?? "Client",
              role: i.role ?? null,
            }))
          : [];
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Testimonials")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            <div className="grid gap-4 md:grid-cols-2">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <Card key={item.id || `legacy-${index}`} variant="outlined" className="border-zinc-200 bg-white/80">
                    <p className="text-zinc-700">"{item.quote}"</p>
                    <p className="mt-3 font-medium">{item.author}</p>
                    <p className="text-xs text-zinc-500">{item.role ?? ""}</p>
                  </Card>
                ))
              ) : (
                <Card variant="outlined" className="border-zinc-200 bg-white/80">
                  <p className="text-zinc-600">Add testimonials from the admin dashboard.</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "cta") {
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <Card variant="outlined" className="border-zinc-200 bg-white/80">
              <h2 className="text-2xl font-bold">{String(block.settings.title ?? "Call to action")}</h2>
              <p className="mt-2 text-zinc-600">{String(block.settings.body ?? "")}</p>
              <a href={String(block.settings.buttonHref ?? "#")} className="mt-4 inline-block">
                <Button
                  style={{
                    backgroundColor: block.style.accentColor || theme.accent,
                    borderColor: block.style.accentColor || theme.accent,
                  } as CSSProperties}
                >
                  {String(block.settings.buttonText ?? "Contact")}
                </Button>
              </a>
            </Card>
          </div>
        </section>
      );
    }

    if (block.type === "contact") {
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Get in touch")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            <ContactFormBlock
              title={String(block.settings.title ?? "Get in touch")}
              subtitle={subtitle}
              submitButtonText={String(block.settings.submitButtonText ?? "Send message")}
              successMessage={String(block.settings.successMessage ?? "Thanks! Your message has been sent.")}
              accentColor={block.style.accentColor || theme.accent}
            />
          </div>
        </section>
      );
    }

    if (block.type === "blog-feed") {
      const limit = Number(block.settings.limit ?? 3);
      const items = blogs.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 3);
      const columns = Number(block.settings.columns ?? 2);
      const colClass =
        columns >= 3 ? "md:grid-cols-3" : columns <= 1 ? "md:grid-cols-1" : "md:grid-cols-2";
      const subtitle = String(block.settings.subtitle ?? "");
      const emptyMessage = String(block.settings.emptyMessage ?? "No published posts yet.");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Latest posts")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            <div className={`grid gap-4 ${colClass}`}>
              {items.length > 0 ? (
                items.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`}>
                    <Card variant="outlined" className="h-full border-zinc-200 bg-white/80 transition hover:border-zinc-300">
                      <h3 className="font-semibold">{blog.title}</h3>
                      {blog.excerpt && <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{blog.excerpt}</p>}
                      {blog.publishedAt && (
                        <Badge variant="default" className="mt-3">
                          {new Date(blog.publishedAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </Card>
                  </Link>
                ))
              ) : (
                <Card variant="outlined" className="border-zinc-200 bg-white/80">
                  <p className="text-zinc-600">{emptyMessage}</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "gallery") {
      const images = Array.isArray(block.settings.images)
        ? (block.settings.images as unknown[]).filter((v): v is string => typeof v === "string")
        : [];
      const columns = Number(block.settings.columns ?? 3);
      const colClass =
        columns >= 4
          ? "md:grid-cols-4"
          : columns >= 3
            ? "md:grid-cols-3"
            : columns <= 1
              ? "md:grid-cols-1"
              : "md:grid-cols-2";
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Gallery")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {images.length > 0 ? (
              <div className={`grid gap-4 sm:grid-cols-2 ${colClass}`}>
                {images.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white/80 aspect-[4/3]"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={url.startsWith("data:")}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">No gallery images configured.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "projects") {
      const dbItems = projects.length > 0
        ? projects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description ?? "",
            image: p.imageUrl ?? "",
            link: p.linkUrl ?? "",
            tags: p.tags ?? [],
          }))
        : [];
      const configItems = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ title?: string; description?: string; image?: string; link?: string; tags?: string[] }>)
        : [];
      const items = dbItems.length > 0 ? dbItems : configItems;
      const columns = Number(block.settings.columns ?? 2);
      const colClass = columns >= 3 ? "md:grid-cols-3" : columns <= 1 ? "md:grid-cols-1" : "md:grid-cols-2";
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Projects")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {items.length > 0 ? (
              <div className={`grid gap-6 sm:grid-cols-2 ${colClass}`}>
                {items.map((item, idx) => (
                  <Card key={idx} variant="outlined" className="overflow-hidden border-zinc-200 bg-white/80">
                    {item.image && (
                      <div className="relative aspect-video">
                        <Image src={item.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized={item.image.startsWith("data:")} />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{item.title ?? "Project"}</h3>
                      {item.description && <p className="mt-2 text-sm text-zinc-600">{item.description}</p>}
                      {(item.tags ?? []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(item.tags ?? []).map((tag, i) => (
                            <span key={i} className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{tag}</span>
                          ))}
                        </div>
                      )}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium" style={{ color: theme.accent }}>
                          View project →
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add projects in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "client-logos") {
      const logos = Array.isArray(block.settings.logos) ? (block.settings.logos as unknown[]).filter((l): l is string => typeof l === "string") : [];
      const subtitle = String(block.settings.subtitle ?? "");
      const isValidImageUrl = (s: string) => s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:image");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Trusted by")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {logos.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-8 grayscale opacity-70">
                {logos.map((url, idx) => (
                  <div key={idx} className="relative h-12 w-24 flex items-center justify-center">
                    {url.trim().startsWith("<svg") || url.trim().startsWith("<") ? (
                      <div className="h-10 w-16 [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain" dangerouslySetInnerHTML={{ __html: url }} />
                    ) : isValidImageUrl(url) ? (
                      <Image src={url} alt="" fill className="object-contain" sizes="96px" unoptimized={url.startsWith("data:")} />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add logo URLs in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "pricing") {
      const items = Array.isArray(block.settings.items)
        ? (block.settings.items as Array<{ name?: string; price?: string; description?: string; features?: string[]; ctaText?: string; ctaHref?: string; highlighted?: boolean }>)
        : [];
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Pricing")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {items.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item, idx) => (
                  <Card
                    key={idx}
                    variant="outlined"
                    className={`border-zinc-200 bg-white/80 ${item.highlighted ? "ring-2" : ""}`}
                    style={item.highlighted ? ({ "--tw-ring-color": block.style.accentColor || theme.accent } as CSSProperties) : undefined}
                  >
                    <h3 className="font-semibold">{item.name ?? "Plan"}</h3>
                    <p className="mt-2 text-2xl font-bold" style={{ color: block.style.accentColor || theme.accent }}>{item.price ?? ""}</p>
                    {item.description && <p className="mt-1 text-sm text-zinc-600">{item.description}</p>}
                    <ul className="mt-4 space-y-2">
                      {(item.features ?? []).map((f, i) => (
                        <li key={i} className="text-sm text-zinc-700">• {f}</li>
                      ))}
                    </ul>
                    <a href={item.ctaHref ?? "#"} className="mt-4 inline-block">
                      <Button style={{ backgroundColor: block.style.accentColor || theme.accent, borderColor: block.style.accentColor || theme.accent } as CSSProperties}>
                        {item.ctaText ?? "Get started"}
                      </Button>
                    </a>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add pricing plans in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "faq") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ question?: string; answer?: string }>) : [];
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "FAQ")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {items.length > 0 ? (
              <div className="mx-auto max-w-2xl space-y-4">
                {items.map((item, idx) => (
                  <details key={idx} className="rounded-lg border border-zinc-200 bg-white/80 px-4 py-3">
                    <summary className="cursor-pointer font-medium">{item.question ?? "Question"}</summary>
                    <p className="mt-2 text-zinc-600">{item.answer ?? ""}</p>
                  </details>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add FAQ items in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "video") {
      const videoUrl = String(block.settings.videoUrl ?? "").trim();
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Video")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {videoUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  src={
                    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
                      ? videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
                      : videoUrl
                  }
                  title="Video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add a video URL (YouTube or Vimeo embed) in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "process") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ step?: number; title?: string; description?: string }>) : [];
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "How I work")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {items.length > 0 ? (
              <div className="space-y-6">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold"
                      style={{ backgroundColor: block.style.accentColor || theme.accent }}
                    >
                      {item.step ?? idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title ?? "Step"}</h3>
                      <p className="mt-1 text-zinc-600">{item.description ?? ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add process steps in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "certifications") {
      const items = Array.isArray(block.settings.items) ? (block.settings.items as Array<{ name?: string; issuer?: string; url?: string; image?: string }>) : [];
      const subtitle = String(block.settings.subtitle ?? "");
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Certifications")}</h2>
            {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
            {items.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {items.map((item, idx) => (
                  <Card key={idx} variant="outlined" className="flex items-center gap-4 border-zinc-200 bg-white/80 p-4">
                    {item.image && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden">
                        <Image src={item.image} alt="" fill className="object-contain" sizes="48px" unoptimized={item.image.startsWith("data:")} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.name ?? "Certification"}</p>
                      {item.issuer && <p className="text-sm text-zinc-600">{item.issuer}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm" style={{ color: theme.accent }}>
                          Verify →
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">Add certifications in the admin builder.</p>
              </Card>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "newsletter") {
      return (
        <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
          <div className={containerClass} style={style}>
            <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Stay updated")}</h2>
            <p className="mb-6 text-zinc-600">{String(block.settings.subtitle ?? "")}</p>
            <NewsletterBlock
              buttonText={String(block.settings.buttonText ?? "Subscribe")}
              successMessage={String(block.settings.successMessage ?? "Thanks for subscribing!")}
              accentColor={block.style.accentColor || theme.accent}
            />
          </div>
        </section>
      );
    }

    const stats = Array.isArray(block.settings.items)
      ? (block.settings.items as Array<{ label?: string; value?: string }>)
      : [];
    const subtitle = String(block.settings.subtitle ?? "");
    return (
      <section id={sectionId(block)} className={sectionClass} style={getBlockSectionStyle(block.style)}>
        <div className={containerClass} style={style}>
          <h2 className="mb-6 text-3xl font-bold">{String(block.settings.title ?? "Stats")}</h2>
          {subtitle && <p className="mb-6 text-zinc-600">{subtitle}</p>}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {stats.length > 0 ? (
              stats.map((item, idx) => (
                <Card key={`${item.label}-${idx}`} variant="outlined" className="border-zinc-200 bg-white/80">
                  <p className="text-3xl font-bold" style={{ color: block.style.accentColor || theme.accent }}>
                    {item.value ?? ""}
                  </p>
                  <p className="mt-1 text-zinc-600">{item.label ?? ""}</p>
                </Card>
              ))
            ) : (
              <Card variant="outlined" className="border-zinc-200 bg-white/80">
                <p className="text-zinc-600">No stats configured.</p>
              </Card>
            )}
          </div>
        </div>
      </section>
    );
  };

  const host = h.get("host") ?? h.get("x-forwarded-host");
  const proto = h.get("x-forwarded-proto");
  const scheme = proto === "https" ? "https" : "http";
  const baseUrl = host ? `${scheme}://${host}` : undefined;
  const heroBlock = enabledBlocks.find((b) => b.type === "hero");
  const schemaName = heroBlock?.settings?.title ?? tenantName ?? portfolio?.tagline ?? "Portfolio";
  const schemaDesc = heroBlock?.settings?.subtitle ?? portfolio?.bio ?? "Professional portfolio";
  const schemaImage = (heroBlock?.settings?.avatarUrl ?? portfolio?.avatarUrl) as string | undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: String(schemaName ?? "Portfolio"),
      description: String(schemaDesc ?? "Professional portfolio"),
      ...(schemaImage && { image: schemaImage }),
      ...(baseUrl && { url: baseUrl }),
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50" style={themeStyle}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {siteConfig.analyticsScript && (
        <AnalyticsScript script={siteConfig.analyticsScript} />
      )}
      <nav
        className="sticky top-0 z-50 border-b border-zinc-200 bg-white"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold" style={{ color: "var(--portfolio-primary)" }}>
            {tenantName ?? "Portfolio"}
          </span>
          <div className="flex flex-wrap gap-4">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-zinc-600 transition hover:text-zinc-900">
                {item.label}
              </a>
            ))}
            {siteConfig.showBlogLink && (
              <Link href="/blog" className="text-sm text-zinc-600 transition hover:text-zinc-900">
                Blog
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main id="main-content" aria-label="Main content">
      {enabledBlocks.length > 0 ? (
        enabledBlocks.map((block) => <div key={block.id}>{renderBlock(block)}</div>)
      ) : (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-zinc-900">
              {resolveStatus === "404" || !tenantId ? "Subdomain not found" : "Blank portfolio page"}
            </h1>
            <p className="mt-4 text-zinc-600">
              {resolveStatus === "404" || !tenantId
                ? "This subdomain is not registered. Check your URL or contact support."
                : "Add blocks in the admin design page and click Save to publish your portfolio."}
            </p>
          </div>
        </section>
      )}
      </main>

      <footer className="border-t border-zinc-200 px-6 py-8" role="contentinfo">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {siteConfig.socialLinks && siteConfig.socialLinks.length > 0 && (
              <div className="flex gap-4">
                {siteConfig.socialLinks.map((link, idx) => (
                  <a
                    key={`social-${idx}-${link.label}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition hover:text-zinc-900"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            <p className="text-sm text-zinc-500">
              {siteConfig.footerText || "Powered by Nexora"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
