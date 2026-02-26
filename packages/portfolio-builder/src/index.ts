import type { CSSProperties } from "react";

export type BlockType =
  | "hero"
  | "text"
  | "skills"
  | "services"
  | "timeline"
  | "testimonials"
  | "cta"
  | "contact"
  | "blog-feed"
  | "gallery"
  | "stats"
  | "projects"
  | "client-logos"
  | "pricing"
  | "faq"
  | "video"
  | "process"
  | "certifications"
  | "newsletter"
  | "separator";

export type BlockBackgroundType = "none" | "color" | "image";
export type BlockPadding = "sm" | "md" | "lg";
export type BlockContainer = "narrow" | "normal" | "wide" | "full";
export type BlockSpacing = "tight" | "normal" | "loose";
export type BlockVisibility = "all" | "desktop-only" | "mobile-only";
export type BlockDivider = "none" | "line" | "wave";
export type BlockAnimation = "none" | "fade" | "slide-up";

export interface BlockStyle {
  backgroundType: BlockBackgroundType;
  backgroundColor: string;
  backgroundImage: string;
  textColor: string;
  accentColor: string;
  padding: BlockPadding;
  container: BlockContainer;
  blockSpacing?: BlockSpacing;
  blockVisibility?: BlockVisibility;
  blockDivider?: BlockDivider;
  blockAnimation?: BlockAnimation;
}

export interface BuilderBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  locked?: boolean;
  hidden?: boolean;
  sectionId?: string;
  settings: Record<string, unknown>;
  style: BlockStyle;
}

export interface SiteMetadata {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface PortfolioSiteConfig {
  schemaVersion: number;
  showBlogLink: boolean;
  metadata?: SiteMetadata;
  fontFamily?: string;
  socialLinks?: SocialLink[];
  footerText?: string;
  analyticsScript?: string;
  blocks: BuilderBlock[];
}

export const BLOCK_LIBRARY: { type: BlockType; label: string; description: string; icon: string }[] = [
  { type: "hero", label: "Hero", description: "Main banner with heading and CTA", icon: "Layout" },
  { type: "text", label: "Text", description: "Rich text content section", icon: "Type" },
  { type: "skills", label: "Skills", description: "Skills from profile", icon: "Award" },
  { type: "services", label: "Services", description: "Services from profile", icon: "Briefcase" },
  { type: "timeline", label: "Timeline", description: "Timeline entries", icon: "GitBranch" },
  { type: "testimonials", label: "Testimonials", description: "Client testimonials", icon: "Quote" },
  { type: "cta", label: "Call to Action", description: "Conversion banner", icon: "Zap" },
  { type: "contact", label: "Contact Form", description: "Contact form for visitors", icon: "Mail" },
  { type: "blog-feed", label: "Blog Feed", description: "Latest posts", icon: "FileText" },
  { type: "gallery", label: "Gallery", description: "Image grid", icon: "Image" },
  { type: "stats", label: "Stats", description: "Key metrics", icon: "BarChart2" },
  { type: "projects", label: "Projects", description: "Project showcase with links", icon: "FolderOpen" },
  { type: "client-logos", label: "Client Logos", description: "Logo strip for social proof", icon: "Building2" },
  { type: "pricing", label: "Pricing", description: "Packages and tiers", icon: "CreditCard" },
  { type: "faq", label: "FAQ", description: "Accordion Q&A", icon: "HelpCircle" },
  { type: "video", label: "Video", description: "Embed video or reel", icon: "Video" },
  { type: "process", label: "Process", description: "How you work", icon: "ListOrdered" },
  { type: "certifications", label: "Certifications", description: "Badges and credentials", icon: "BadgeCheck" },
  { type: "newsletter", label: "Newsletter", description: "Email signup", icon: "Send" },
  { type: "separator", label: "Separator", description: "Styled divider between sections", icon: "Minus" },
];

const DEFAULT_STYLE: BlockStyle = {
  backgroundType: "none",
  backgroundColor: "#ffffff",
  backgroundImage: "",
  textColor: "#18181b",
  accentColor: "#6366f1",
  padding: "md",
  container: "normal",
  blockSpacing: "normal",
  blockVisibility: "all",
  blockDivider: "none",
  blockAnimation: "none",
};

export const DEFAULT_SITE_CONFIG: PortfolioSiteConfig = {
  schemaVersion: 2,
  showBlogLink: true,
  metadata: { title: "", description: "", ogImage: "" },
  fontFamily: "inter",
  socialLinks: [],
  footerText: "Powered by Nexora",
  blocks: [],
};

export const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "georgia", label: "Georgia" },
  { value: "playfair", label: "Playfair Display" },
  { value: "source-sans", label: "Source Sans Pro" },
  { value: "system", label: "System" },
];

/** Segment icons for skills block. Key = icon id, value = emoji/symbol for display. */
export const SEGMENT_ICONS: { value: string; label: string; emoji: string; group: string }[] = [
  { value: "", label: "None", emoji: "", group: "" },
  // Development
  { value: "code", label: "Code", emoji: "⌨", group: "Development" },
  { value: "terminal", label: "CLI", emoji: "💻", group: "Development" },
  { value: "layout", label: "Layout", emoji: "▦", group: "Development" },
  { value: "api", label: "API", emoji: "🔌", group: "Development" },
  { value: "brackets", label: "Syntax", emoji: "⟨⟩", group: "Development" },
  { value: "git", label: "Git", emoji: "⎇", group: "Development" },
  { value: "branch", label: "Branch", emoji: "〘〙", group: "Development" },
  { value: "bug", label: "Debug", emoji: "🐛", group: "Development" },
  { value: "package", label: "Package", emoji: "📦", group: "Development" },
  { value: "component", label: "Component", emoji: "⊞", group: "Development" },
  // Languages & Frameworks
  { value: "react", label: "React", emoji: "⚛", group: "Languages & Frameworks" },
  { value: "node", label: "Node.js", emoji: "⬢", group: "Languages & Frameworks" },
  { value: "javascript", label: "JavaScript", emoji: "🟨", group: "Languages & Frameworks" },
  { value: "typescript", label: "TypeScript", emoji: "🔷", group: "Languages & Frameworks" },
  { value: "python", label: "Python", emoji: "🐍", group: "Languages & Frameworks" },
  { value: "java", label: "Java", emoji: "☕", group: "Languages & Frameworks" },
  { value: "html", label: "HTML", emoji: "📄", group: "Languages & Frameworks" },
  { value: "css", label: "CSS", emoji: "🎨", group: "Languages & Frameworks" },
  { value: "vue", label: "Vue", emoji: "💚", group: "Languages & Frameworks" },
  { value: "nextjs", label: "Next.js", emoji: "▲", group: "Languages & Frameworks" },
  { value: "angular", label: "Angular", emoji: "🅰", group: "Languages & Frameworks" },
  { value: "go", label: "Go", emoji: "🔵", group: "Languages & Frameworks" },
  { value: "rust", label: "Rust", emoji: "🦀", group: "Languages & Frameworks" },
  { value: "php", label: "PHP", emoji: "🐘", group: "Languages & Frameworks" },
  { value: "ruby", label: "Ruby", emoji: "💎", group: "Languages & Frameworks" },
  { value: "swift", label: "Swift", emoji: "🐦", group: "Languages & Frameworks" },
  { value: "csharp", label: "C#", emoji: "🟣", group: "Languages & Frameworks" },
  { value: "kotlin", label: "Kotlin", emoji: "🟠", group: "Languages & Frameworks" },
  { value: "docker", label: "Docker", emoji: "🐳", group: "Languages & Frameworks" },
  { value: "kubernetes", label: "Kubernetes", emoji: "☸", group: "Languages & Frameworks" },
  { value: "aws", label: "AWS", emoji: "☁", group: "Languages & Frameworks" },
  { value: "graphql", label: "GraphQL", emoji: "◈", group: "Languages & Frameworks" },
  { value: "firebase", label: "Firebase", emoji: "🔥", group: "Languages & Frameworks" },
  { value: "tailwind", label: "Tailwind", emoji: "💨", group: "Languages & Frameworks" },
  { value: "postgresql", label: "PostgreSQL", emoji: "🗄", group: "Languages & Frameworks" },
  { value: "mongodb", label: "MongoDB", emoji: "🍃", group: "Languages & Frameworks" },
  { value: "redis", label: "Redis", emoji: "🔴", group: "Languages & Frameworks" },
  { value: "supabase", label: "Supabase", emoji: "◎", group: "Languages & Frameworks" },
  { value: "prisma", label: "Prisma", emoji: "◉", group: "Languages & Frameworks" },
  { value: "svelte", label: "Svelte", emoji: "⚡", group: "Languages & Frameworks" },
  { value: "nuxt", label: "Nuxt", emoji: "🔷", group: "Languages & Frameworks" },
  // Backend & Infra
  { value: "server", label: "Server", emoji: "🖥", group: "Backend & Infra" },
  { value: "database", label: "Database", emoji: "🗄", group: "Backend & Infra" },
  { value: "cloud", label: "Cloud", emoji: "☁", group: "Backend & Infra" },
  { value: "rocket", label: "DevOps", emoji: "🚀", group: "Backend & Infra" },
  { value: "container", label: "Container", emoji: "▢", group: "Backend & Infra" },
  { value: "network", label: "Network", emoji: "⊠", group: "Backend & Infra" },
  { value: "lock", label: "Auth", emoji: "🔐", group: "Backend & Infra" },
  { value: "shield", label: "Security", emoji: "🛡", group: "Backend & Infra" },
  { value: "cog", label: "Config", emoji: "⚙", group: "Backend & Infra" },
  { value: "database-2", label: "Storage", emoji: "💾", group: "Backend & Infra" },
  // Design
  { value: "palette", label: "Design", emoji: "🎨", group: "Design" },
  { value: "layers", label: "Stack", emoji: "◫", group: "Design" },
  { value: "brush", label: "Brush", emoji: "🖌", group: "Design" },
  { value: "ruler", label: "Layout", emoji: "📐", group: "Design" },
  { value: "eye", label: "UX", emoji: "👁", group: "Design" },
  { value: "image", label: "Image", emoji: "🖼", group: "Design" },
  { value: "type", label: "Typography", emoji: "𝖠", group: "Design" },
  { value: "color", label: "Color", emoji: "🎨", group: "Design" },
  { value: "grid", label: "Grid", emoji: "▦", group: "Design" },
  { value: "pen", label: "Sketch", emoji: "✏", group: "Design" },
  // Data & Analytics
  { value: "chart", label: "Data", emoji: "📊", group: "Data & Analytics" },
  { value: "chart-bar", label: "Analytics", emoji: "📈", group: "Data & Analytics" },
  { value: "chart-pie", label: "Reports", emoji: "📉", group: "Data & Analytics" },
  { value: "table", label: "Tables", emoji: "⊟", group: "Data & Analytics" },
  { value: "search", label: "Search", emoji: "🔍", group: "Data & Analytics" },
  { value: "filter", label: "Filter", emoji: "⚡", group: "Data & Analytics" },
  { value: "ai", label: "AI/ML", emoji: "🤖", group: "Data & Analytics" },
  { value: "brain", label: "Intelligence", emoji: "🧠", group: "Data & Analytics" },
  { value: "sparkles", label: "Automation", emoji: "✨", group: "Data & Analytics" },
  { value: "pipeline", label: "Pipeline", emoji: "▸", group: "Data & Analytics" },
  // Web & Mobile
  { value: "globe", label: "Web", emoji: "🌐", group: "Web & Mobile" },
  { value: "smartphone", label: "Mobile", emoji: "📱", group: "Web & Mobile" },
  { value: "monitor", label: "Desktop", emoji: "🖥", group: "Web & Mobile" },
  { value: "responsive", label: "Responsive", emoji: "↔", group: "Web & Mobile" },
  { value: "link", label: "Links", emoji: "🔗", group: "Web & Mobile" },
  { value: "browser", label: "Browser", emoji: "🌐", group: "Web & Mobile" },
  { value: "wifi", label: "Connectivity", emoji: "📶", group: "Web & Mobile" },
  { value: "accessibility", label: "A11y", emoji: "♿", group: "Web & Mobile" },
  { value: "seo", label: "SEO", emoji: "🔎", group: "Web & Mobile" },
  { value: "performance", label: "Performance", emoji: "⚡", group: "Web & Mobile" },
  // Tools & Testing
  { value: "wrench", label: "Tools", emoji: "🔧", group: "Tools & Testing" },
  { value: "target", label: "Testing", emoji: "🎯", group: "Tools & Testing" },
  { value: "puzzle", label: "Integration", emoji: "🧩", group: "Tools & Testing" },
  { value: "zap", label: "Performance", emoji: "⚡", group: "Tools & Testing" },
  { value: "check", label: "Quality", emoji: "✓", group: "Tools & Testing" },
  { value: "flask", label: "Experiments", emoji: "🧪", group: "Tools & Testing" },
  { value: "clock", label: "CI/CD", emoji: "⏱", group: "Tools & Testing" },
  { value: "document", label: "Docs", emoji: "📄", group: "Tools & Testing" },
  { value: "book", label: "Learning", emoji: "📖", group: "Tools & Testing" },
  { value: "lightbulb", label: "Ideas", emoji: "💡", group: "Tools & Testing" },
  // Business & Other
  { value: "briefcase", label: "Business", emoji: "💼", group: "Business & Other" },
  { value: "users", label: "Team", emoji: "👥", group: "Business & Other" },
  { value: "message", label: "Communication", emoji: "💬", group: "Business & Other" },
  { value: "star", label: "Featured", emoji: "⭐", group: "Business & Other" },
  { value: "heart", label: "Favorite", emoji: "❤", group: "Business & Other" },
  { value: "trophy", label: "Achievement", emoji: "🏆", group: "Business & Other" },
  { value: "certificate", label: "Certification", emoji: "📜", group: "Business & Other" },
  { value: "flag", label: "Goal", emoji: "🚩", group: "Business & Other" },
  { value: "compass", label: "Strategy", emoji: "🧭", group: "Business & Other" },
  { value: "sparkles-2", label: "Special", emoji: "✨", group: "Business & Other" },
];

export const SEGMENT_ICON_MAP: Record<string, string> = Object.fromEntries(
  SEGMENT_ICONS.filter((i) => i.value).map((i) => [i.value, i.emoji])
);

export const SEGMENT_ICON_GROUPS: string[] = [
  "Development",
  "Languages & Frameworks",
  "Backend & Infra",
  "Design",
  "Data & Analytics",
  "Web & Mobile",
  "Tools & Testing",
  "Business & Other",
];

export interface MasterTheme {
  id: string;
  name: string;
  description: string;
  theme: { primary: string; accent: string };
  siteConfig: PortfolioSiteConfig;
}

export const BLOCK_PRESETS: Record<string, Partial<BuilderBlock>> = {
  "hero-dark": {
    type: "hero",
    style: {
      ...DEFAULT_STYLE,
      backgroundType: "color",
      backgroundColor: "#0f172a",
      textColor: "#f8fafc",
      accentColor: "#22c55e",
    },
    settings: {
      title: "Crafting digital experiences",
      subtitle: "Design and development that makes an impact.",
      ctaText: "Get started",
      ctaHref: "#services",
      carouselEnabled: false,
      carouselImages: [],
    },
  },
  "stats-minimal": {
    type: "stats",
    style: { ...DEFAULT_STYLE, padding: "sm" },
    settings: {
      title: "By the numbers",
      subtitle: "",
      items: [
        { label: "Projects", value: "50+" },
        { label: "Clients", value: "30+" },
        { label: "Years", value: "10+" },
      ],
    },
  },
  "cta-gradient": {
    type: "cta",
    style: {
      ...DEFAULT_STYLE,
      backgroundType: "color",
      backgroundColor: "#6366f1",
      textColor: "#ffffff",
      accentColor: "#ffffff",
    },
    settings: {
      title: "Let's build something great",
      body: "Ready to start your project?",
      buttonText: "Contact me",
      buttonHref: "#contact",
    },
  },
};

function themeBlock(type: BlockType, overrides: Partial<BuilderBlock>): BuilderBlock {
  const block = createBlock(type);
  return {
    ...block,
    ...overrides,
    id: block.id,
    type: block.type,
    style: { ...block.style, ...(overrides.style ?? {}) },
    settings: { ...block.settings, ...(overrides.settings ?? {}) },
  };
}

export const MASTER_THEMES: MasterTheme[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean, corporate layout with hero, about, services, and CTA",
    theme: { primary: "#0f172a", accent: "#2563eb" },
    siteConfig: {
      schemaVersion: 2,
      showBlogLink: true,
      metadata: { title: "My Portfolio", description: "Professional portfolio", ogImage: "" },
      fontFamily: "inter",
      socialLinks: [],
      footerText: "Powered by Nexora",
      blocks: [
        themeBlock("hero", {
          style: { ...DEFAULT_STYLE, backgroundType: "color", backgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#60a5fa" },
          settings: { title: "Hello, I'm a Professional", subtitle: "Design & development that delivers results.", ctaText: "View my work", ctaHref: "#services" },
          sectionId: "hero",
        }),
        themeBlock("text", { settings: { title: "About me", body: "I help businesses grow through thoughtful design and robust development." }, sectionId: "about" }),
        themeBlock("services", { settings: { title: "Services", subtitle: "What I offer" }, sectionId: "services" }),
        themeBlock("stats", BLOCK_PRESETS["stats-minimal"]),
        themeBlock("cta", { settings: { title: "Let's work together", body: "Have a project in mind?", buttonText: "Get in touch", buttonHref: "#contact" }, sectionId: "contact" }),
      ],
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold, artistic layout with dark hero and accent colors",
    theme: { primary: "#1e1b4b", accent: "#a855f7" },
    siteConfig: {
      schemaVersion: 2,
      showBlogLink: true,
      metadata: { title: "Creative Portfolio", description: "Bold and artistic", ogImage: "" },
      fontFamily: "playfair",
      socialLinks: [],
      footerText: "Powered by Nexora",
      blocks: [
        themeBlock("hero", BLOCK_PRESETS["hero-dark"]),
        themeBlock("gallery", { settings: { title: "Work", subtitle: "Selected projects" } }),
        themeBlock("testimonials", { settings: { title: "What people say" } }),
        themeBlock("cta", BLOCK_PRESETS["cta-gradient"]),
      ],
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple, elegant layout with plenty of whitespace",
    theme: { primary: "#18181b", accent: "#22c55e" },
    siteConfig: {
      schemaVersion: 2,
      showBlogLink: true,
      metadata: { title: "Portfolio", description: "Minimal portfolio", ogImage: "" },
      fontFamily: "inter",
      socialLinks: [],
      footerText: "Powered by Nexora",
      blocks: [
        themeBlock("hero", {
          style: { ...DEFAULT_STYLE },
          settings: { title: "Hi, I'm a designer", subtitle: "Focused on simplicity and clarity.", ctaText: "Explore", ctaHref: "#about" },
        }),
        themeBlock("text", { settings: { title: "About", body: "I create clean, purposeful experiences." } }),
        themeBlock("skills", { settings: { title: "Skills" } }),
        themeBlock("cta", { settings: { title: "Say hello", buttonText: "Contact", buttonHref: "#contact" } }),
      ],
    },
  },
  {
    id: "full",
    name: "Full portfolio",
    description: "Complete layout with all major sections",
    theme: { primary: "#0f172a", accent: "#6366f1" },
    siteConfig: {
      schemaVersion: 2,
      showBlogLink: true,
      metadata: { title: "Full Portfolio", description: "Complete portfolio template", ogImage: "" },
      fontFamily: "inter",
      socialLinks: [{ label: "Twitter", url: "#" }, { label: "LinkedIn", url: "#" }],
      footerText: "Powered by Nexora",
      blocks: [
        themeBlock("hero", { sectionId: "hero" }),
        themeBlock("stats", BLOCK_PRESETS["stats-minimal"]),
        themeBlock("text", { settings: { title: "About me", body: "Your story goes here." }, sectionId: "about" }),
        themeBlock("skills", { sectionId: "skills" }),
        themeBlock("services", { sectionId: "services" }),
        themeBlock("timeline", { sectionId: "timeline" }),
        themeBlock("testimonials", { sectionId: "testimonials" }),
        themeBlock("blog-feed", { sectionId: "blog" }),
        themeBlock("cta", BLOCK_PRESETS["cta-gradient"]),
      ],
    },
  },
];

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlock(type: BlockType): BuilderBlock {
  const common = {
    id: uid(type),
    type,
    enabled: true,
    locked: false,
    hidden: false,
    style: { ...DEFAULT_STYLE },
  };

  if (type === "hero") {
    return {
      ...common,
      settings: {
        title: "Build your digital presence",
        subtitle: "Create a professional portfolio with dynamic sections.",
        avatarUrl: "",
        ctaText: "Explore",
        ctaHref: "#services",
        cta2Text: "",
        cta2Href: "",
        heroBackgroundType: "carousel",
        heroVideoUrl: "",
        carouselEnabled: false,
        carouselImages: [],
        carouselOverlayOpacity: 55,
        carouselOverlayType: "solid",
        carouselDuration: 5,
        carouselTransitionDuration: 700,
        carouselTransitionType: "fade",
        carouselShowDots: true,
        carouselShowArrows: true,
        carouselArrowsColor: "white",
        carouselArrowsCustomColor: "#ffffff",
        carouselDotsColor: "same",
        carouselDotsCustomColor: "#ffffff",
        carouselArrowIcon: "chevron",
        carouselArrowSize: "md",
        carouselDotsSize: "md",
        heroFontFamily: "inherit",
        heroFontSize: "normal",
        heroFontWeight: "normal",
        heroSectionMode: "standard",
        heroNavHeight: "4rem",
        heroScrollIndicator: false,
        heroContentSpacing: "normal",
        heroLayout: "centered",
        heroSize: "normal",
        heroHeight: "normal",
        avatarSize: "md",
        avatarPosition: "top",
        avatarShape: "round",
        badgeVisible: true,
        badgeText: "",
        badgeFontFamily: "inherit",
        badgeFontSize: "inherit",
        badgeFontWeight: "inherit",
        badgeColor: "accent",
        badgeCustomColor: "#6366f1",
        ctaStyle: "primary",
        subtitleMaxWidth: "medium",
        subtitleAlign: "inherit",
        titleAlign: "inherit",
        titleFontFamily: "inherit",
        titleFontSize: "inherit",
        titleFontSizeCustom: "4",
        titleFontWeight: "inherit",
        subtitleFontFamily: "inherit",
        subtitleFontSize: "inherit",
        subtitleFontSizeCustom: "1.25",
        subtitleFontWeight: "inherit",
        ctaPosition: "left",
        ctaFontFamily: "inherit",
        ctaFontSizeTypo: "inherit",
        ctaFontSizeTypoCustom: "1",
        ctaFontWeight: "inherit",
        cta2FontFamily: "same",
        cta2FontSizeTypo: "same",
        cta2FontSizeTypoCustom: "1",
        cta2FontWeight: "same",
        ctaIcon: "none",
        cta2Icon: "same",
        ctaOpenNewTab: false,
        cta2OpenNewTab: "same",
        ctaLayout: "horizontal",
        ctaSpacing: "normal",
        ctaPositionVertical: "below-subtitle",
        ctaColor: "accent",
        ctaCustomColor: "#6366f1",
        cta2Color: "same",
        cta2Style: "same",
        cta2CustomColor: "#6366f1",
        avatarBorderColor: "accent",
        avatarCustomColor: "",
        avatarBorderWidth: "medium",
        heroSectionBorder: "none",
        heroSectionBorderColor: "neutral",
        heroSectionBorderCustomColor: "",
        ctaTextColor: "auto",
        ctaTextCustomColor: "#ffffff",
        ctaBorderWidth: "medium",
        ctaBorderRadius: "md",
        ctaBorderColor: "same",
        ctaBorderCustomColor: "#6366f1",
        ctaSize: "normal",
        ctaFontSize: "md",
        cta2BorderWidth: "same",
        cta2BorderRadius: "same",
        cta2BorderColor: "same",
        cta2TextColor: "same",
        cta2TextCustomColor: "#ffffff",
        cta2BorderCustomColor: "#6366f1",
        cta2Size: "same",
        cta2FontSize: "same",
        avatarBorderRadius: "full",
        titleUseHtml: false,
        titleLineHeight: "normal",
        subtitleLineHeight: "normal",
        titleLetterSpacing: "normal",
        heroParallax: false,
        heroVideoOverlayType: "solid",
        heroVideoOverlayOpacity: 55,
        badgeSize: "md",
        titleMaxWidth: "none",
        heroScrollAnimation: "none",
        subtitleLineClamp: "none",
        heroContentVerticalAlign: "center",
        titleTextShadow: false,
        subtitleTextShadow: false,
        heroScrollAnimationStagger: false,
        titleDecorativeAccent: "none",
        badgeIcon: "none",
        subtitleLetterSpacing: "normal",
        ctaFullWidthMobile: false,
        heroContentMaxWidth: "medium",
        titleSubtitleDivider: false,
        badgeBorderRadius: "pill",
        heroVideoAutoplay: true,
        subtitleDropCap: false,
        heroComponentOrder: ["badge", "title", "subtitle", "avatar", "ctas"],
      },
    };
  }
  if (type === "text") {
    return {
      ...common,
      settings: {
        title: "About me",
        titleUseHtml: false,
        titleHeadingLevel: "h2",
        titleTextTransform: "none",
        subtitle: "",
        subtitleUseHtml: false,
        subtitleVisible: true,
        subtitlePosition: "below",
        body: "Write your story here.",
        textLayout: "left",
        textLayoutColumns: "single",
        titleAlign: "inherit",
        subtitleAlign: "inherit",
        textContentMaxWidth: "medium",
        textCardStyle: "bordered",
        textContentPadding: "md",
        sectionId: "",
        titleSubtitleDivider: "none",
        titleSubtitleDividerStyle: "line",
        titleSubtitleDividerColor: "inherit",
        titleSubtitleDividerWidth: "short",
        ctaText: "",
        ctaHref: "",
        ctaColor: "accent",
        ctaCustomColor: "#6366f1",
        ctaStyle: "primary",
        ctaTextColor: "auto",
        ctaTextCustomColor: "#ffffff",
        ctaBorderWidth: "medium",
        ctaBorderRadius: "md",
        ctaBorderColor: "same",
        ctaBorderCustomColor: "#6366f1",
        ctaSize: "normal",
        ctaFontSize: "md",
        textFontFamily: "inherit",
        textFontSize: "normal",
        textFontWeight: "normal",
        titleFontFamily: "inherit",
        titleFontSize: "inherit",
        titleFontSizeCustom: "3",
        titleFontWeight: "inherit",
        titleColor: "inherit",
        titleCustomColor: "#18181b",
        titleLineHeight: "normal",
        titleLetterSpacing: "normal",
        subtitleFontFamily: "inherit",
        subtitleFontSize: "inherit",
        subtitleFontSizeCustom: "1.25",
        subtitleFontWeight: "inherit",
        subtitleColor: "inherit",
        subtitleCustomColor: "#52525b",
        subtitleLineHeight: "normal",
        subtitleLetterSpacing: "normal",
        bodyFontFamily: "inherit",
        bodyFontSize: "inherit",
        bodyFontSizeCustom: "1",
        bodyFontWeight: "inherit",
        bodyColor: "inherit",
        bodyCustomColor: "#3f3f46",
        bodyLineHeight: "normal",
        bodyLetterSpacing: "normal",
        bodyProseSize: "sm",
        bodyLinkColor: "accent",
        bodyLinkCustomColor: "#6366f1",
      },
    };
  }
  if (type === "skills") {
    return {
      ...common,
      settings: {
        title: "Skills",
        subtitle: "",
        emptyMessage: "Add segments below or from your admin profile.",
        skillsDataSource: "auto",
        segmentAlign: "left",
        segmentDesign: "badges",
        segmentLayout: "vertical",
        segmentGridColumns: 2,
        segmentGridColumnsMobile: 1,
        skillsGridColumns: 0,
        skillsGridColumnsMobile: 0,
        skillColor: "accent",
        skillSize: "md",
        skillUniformWidth: false,
        skillFontWeight: "medium",
        skillTextColor: "auto",
        skillTextCustomColor: "#ffffff",
        skillCustomColor: "",
        skillBorderRadius: "md",
        skillHoverEffect: "subtle",
        maxSkillsPerSegment: 0,
        segments: [],
        sectionId: "",
        skillsHeaderAlign: "left",
        headerGap: "md",
        segmentGap: "md",
        skillsTitleFontFamily: "inherit",
        skillsTitleFontSize: "inherit",
        skillsTitleFontWeight: "bold",
        skillsTitleColor: "inherit",
        skillsTitleCustomColor: "#0f172a",
        skillsSubtitleFontFamily: "inherit",
        skillsSubtitleFontSize: "inherit",
        skillsSubtitleFontWeight: "inherit",
        skillsSubtitleColor: "inherit",
        skillsSubtitleCustomColor: "#52525b",
        segmentTitleFontFamily: "inherit",
        segmentTitleFontSize: "inherit",
        segmentTitleFontWeight: "semibold",
        segmentTitleColor: "accent",
        segmentTitleCustomColor: "#6366f1",
        segmentTitleBgColor: "none",
        segmentTitleBgCustomColor: "#f4f4f5",
        segmentTitlePadding: "none",
        segmentTitleBorderRadius: "none",
        segmentTitleBorder: "none",
        segmentTitleBorderColor: "accent",
        segmentTitleBorderCustomColor: "#6366f1",
        segmentTitleShadow: "none",
        sectionBgColor: "none",
        sectionBgCustomColor: "#fafafa",
        sectionPadding: "md",
        sectionBorder: "none",
        sectionBorderColor: "#e4e4e7",
      },
    };
  }
  if (type === "services") {
    return {
      ...common,
      settings: {
        title: "Services",
        subtitle: "",
        emptyMessage: "Add services below or from the admin panel.",
        columns: 2,
        serviceLayout: "grid",
        serviceCardStyle: "bordered",
        serviceAlignment: "left",
        maxServices: 0,
        items: [],
      },
    };
  }
  if (type === "timeline") {
    return {
      ...common,
      settings: {
        title: "Timeline",
        subtitle: "",
        emptyMessage: "Add entries below or from admin.",
        items: [],
      },
    };
  }
  if (type === "testimonials") {
    return {
      ...common,
      settings: {
        title: "Testimonials",
        subtitle: "",
        items: [
          { quote: "Excellent to work with.", author: "Client Name", role: "Founder" },
          { quote: "Delivered above expectations.", author: "Another Client", role: "Director" },
        ],
      },
    };
  }
  if (type === "cta") {
    return {
      ...common,
      settings: {
        title: "Ready to work together?",
        body: "Let us build something impactful.",
        buttonText: "Contact me",
        buttonHref: "#contact",
      },
    };
  }
  if (type === "contact") {
    return {
      ...common,
      settings: {
        title: "Get in touch",
        subtitle: "Send a message and we'll get back to you.",
        submitButtonText: "Send message",
        successMessage: "Thanks! Your message has been sent.",
      },
    };
  }
  if (type === "blog-feed") {
    return {
      ...common,
      settings: {
        title: "Latest posts",
        subtitle: "",
        emptyMessage: "No published posts yet.",
        limit: 3,
        columns: 2,
      },
    };
  }
  if (type === "gallery") {
    return {
      ...common,
      settings: { title: "Gallery", subtitle: "", columns: 3, images: [] },
    };
  }
  if (type === "projects") {
    return {
      ...common,
      settings: {
        title: "Projects",
        subtitle: "",
        items: [
          { title: "Project One", description: "Brief description.", image: "", link: "", tags: ["React", "Node"] },
          { title: "Project Two", description: "Another project.", image: "", link: "", tags: ["Design"] },
        ],
        columns: 2,
      },
    };
  }
  if (type === "client-logos") {
    return {
      ...common,
      settings: {
        title: "Trusted by",
        subtitle: "",
        logos: [],
      },
    };
  }
  if (type === "pricing") {
    return {
      ...common,
      settings: {
        title: "Pricing",
        subtitle: "",
        items: [
          { name: "Starter", price: "$99", description: "For small projects", features: ["Feature 1", "Feature 2"], ctaText: "Get started", ctaHref: "#contact" },
          { name: "Pro", price: "$299", description: "For growing teams", features: ["Everything in Starter", "Feature 3"], ctaText: "Get started", ctaHref: "#contact", highlighted: true },
        ],
      },
    };
  }
  if (type === "faq") {
    return {
      ...common,
      settings: {
        title: "FAQ",
        subtitle: "",
        items: [
          { question: "How long does a project take?", answer: "Typically 2–4 weeks depending on scope." },
          { question: "Do you offer revisions?", answer: "Yes, we include 2 rounds of revisions." },
        ],
      },
    };
  }
  if (type === "video") {
    return {
      ...common,
      settings: {
        title: "See my work",
        subtitle: "",
        videoUrl: "",
        posterUrl: "",
      },
    };
  }
  if (type === "process") {
    return {
      ...common,
      settings: {
        title: "How I work",
        subtitle: "",
        items: [
          { step: 1, title: "Discovery", description: "We discuss your goals and requirements." },
          { step: 2, title: "Proposal", description: "I send a detailed proposal and timeline." },
          { step: 3, title: "Build", description: "We collaborate and iterate." },
          { step: 4, title: "Launch", description: "We deploy and hand over." },
        ],
      },
    };
  }
  if (type === "certifications") {
    return {
      ...common,
      settings: {
        title: "Certifications",
        subtitle: "",
        items: [
          { name: "AWS Certified", issuer: "Amazon", url: "", image: "" },
          { name: "Google Analytics", issuer: "Google", url: "", image: "" },
        ],
      },
    };
  }
  if (type === "newsletter") {
    return {
      ...common,
      settings: {
        title: "Stay updated",
        subtitle: "Get tips and updates in your inbox.",
        buttonText: "Subscribe",
        successMessage: "Thanks for subscribing!",
      },
    };
  }
  if (type === "separator") {
    return {
      ...common,
      settings: {
        separatorStyle: "solid",
        separatorThickness: "medium",
        separatorWidth: "full",
      },
    };
  }
  return {
    ...common,
    settings: {
      title: "Key stats",
      subtitle: "",
      items: [
        { label: "Projects", value: "25+" },
        { label: "Years", value: "7+" },
        { label: "Clients", value: "15+" },
      ],
    },
  };
}

function ensureStyle(value: unknown): BlockStyle {
  const style = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    backgroundType:
      style.backgroundType === "color" || style.backgroundType === "image"
        ? style.backgroundType
        : "none",
    backgroundColor:
      typeof style.backgroundColor === "string" ? style.backgroundColor : DEFAULT_STYLE.backgroundColor,
    backgroundImage:
      typeof style.backgroundImage === "string" ? style.backgroundImage : DEFAULT_STYLE.backgroundImage,
    textColor: typeof style.textColor === "string" ? style.textColor : DEFAULT_STYLE.textColor,
    accentColor: typeof style.accentColor === "string" ? style.accentColor : DEFAULT_STYLE.accentColor,
    padding:
      style.padding === "sm" || style.padding === "lg" ? style.padding : DEFAULT_STYLE.padding,
    container:
      style.container === "narrow" || style.container === "wide" || style.container === "full"
        ? style.container
        : DEFAULT_STYLE.container,
    blockSpacing:
      style.blockSpacing === "tight" || style.blockSpacing === "loose"
        ? style.blockSpacing
        : "normal",
    blockVisibility:
      style.blockVisibility === "desktop-only" || style.blockVisibility === "mobile-only"
        ? style.blockVisibility
        : "all",
    blockDivider:
      style.blockDivider === "line" || style.blockDivider === "wave" ? style.blockDivider : "none",
    blockAnimation:
      style.blockAnimation === "fade" || style.blockAnimation === "slide-up"
        ? style.blockAnimation
        : "none",
  };
}

function isBlockType(v: unknown): v is BlockType {
  return (
    v === "hero" ||
    v === "text" ||
    v === "skills" ||
    v === "services" ||
    v === "timeline" ||
    v === "testimonials" ||
    v === "cta" ||
    v === "contact" ||
    v === "blog-feed" ||
    v === "gallery" ||
    v === "stats" ||
    v === "projects" ||
    v === "client-logos" ||
    v === "pricing" ||
    v === "faq" ||
    v === "video" ||
    v === "process" ||
    v === "certifications" ||
    v === "newsletter" ||
    v === "separator"
  );
}

type LegacySectionKey = "about" | "skills" | "services" | "timeline" | "contact";

function convertLegacyToBlocks(site: Record<string, unknown>): BuilderBlock[] {
  const result: BuilderBlock[] = [];
  const hero = site.hero && typeof site.hero === "object" ? (site.hero as Record<string, unknown>) : null;
  if (hero && hero.enabled !== false) {
    const block = createBlock("hero");
    block.settings = {
      ...block.settings,
      title: typeof hero.title === "string" ? hero.title : block.settings.title,
      subtitle: typeof hero.subtitle === "string" ? hero.subtitle : block.settings.subtitle,
      ctaText: typeof hero.ctaText === "string" ? hero.ctaText : block.settings.ctaText,
      ctaHref: typeof hero.ctaHref === "string" ? hero.ctaHref : block.settings.ctaHref,
      carouselEnabled: typeof hero.carouselEnabled === "boolean" ? hero.carouselEnabled : false,
      carouselImages: Array.isArray(hero.carouselImages)
        ? hero.carouselImages.filter((v): v is string => typeof v === "string")
        : [],
    };
    result.push(block);
  }

  const sections = Array.isArray(site.sections) ? site.sections : [];
  const LEGACY_MAP: Record<LegacySectionKey, BlockType> = {
    about: "text",
    skills: "skills",
    services: "services",
    timeline: "timeline",
    contact: "cta",
  };
  for (const raw of sections) {
    const section = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
    if (!section || section.enabled === false) continue;
    const key = section.key as LegacySectionKey;
    const mappedType = LEGACY_MAP[key];
    if (!mappedType) continue;
    const block = createBlock(mappedType);
    block.style.backgroundType =
      section.backgroundType === "color" || section.backgroundType === "image"
        ? section.backgroundType
        : "none";
    block.style.backgroundColor =
      typeof section.backgroundColor === "string" ? section.backgroundColor : block.style.backgroundColor;
    block.style.backgroundImage =
      typeof section.backgroundImage === "string" ? section.backgroundImage : block.style.backgroundImage;
    result.push(block);
  }
  return result;
}

export function normalizePortfolioSiteConfig(value: unknown): PortfolioSiteConfig {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rawBlocks = Array.isArray(input.blocks) ? input.blocks : [];

  const normalizedBlocks = rawBlocks
    .map((raw): BuilderBlock | null => {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
      if (!item || !isBlockType(item.type)) return null;
      const template = createBlock(item.type);
      return {
        id: typeof item.id === "string" ? item.id : template.id,
        type: item.type,
        enabled: typeof item.enabled === "boolean" ? item.enabled : true,
        locked: typeof item.locked === "boolean" ? item.locked : false,
        hidden: typeof item.hidden === "boolean" ? item.hidden : false,
        sectionId:
          typeof item.sectionId === "string" && item.sectionId ? item.sectionId : undefined,
        style: ensureStyle(item.style),
        settings:
          item.settings && typeof item.settings === "object"
            ? { ...template.settings, ...(item.settings as Record<string, unknown>) }
            : { ...template.settings },
      };
    })
    .filter((b): b is BuilderBlock => b !== null);
  const blocks = normalizedBlocks.length > 0 ? normalizedBlocks : convertLegacyToBlocks(input);

  const meta =
    input.metadata && typeof input.metadata === "object"
      ? (input.metadata as Record<string, unknown>)
      : {};
  const metadata: SiteMetadata = {
    title: typeof meta.title === "string" ? meta.title : "",
    description: typeof meta.description === "string" ? meta.description : "",
    ogImage: typeof meta.ogImage === "string" ? meta.ogImage : "",
  };

  const socialLinks = Array.isArray(input.socialLinks)
    ? (input.socialLinks as { label?: string; url?: string }[])
        .filter((s) => s && typeof s.label === "string" && typeof s.url === "string")
        .map((s) => ({ label: s.label!, url: s.url! }))
    : [];

  return {
    schemaVersion: typeof input.schemaVersion === "number" ? input.schemaVersion : 2,
    showBlogLink: typeof input.showBlogLink === "boolean" ? input.showBlogLink : true,
    metadata,
    fontFamily:
      typeof input.fontFamily === "string" && input.fontFamily ? input.fontFamily : "inter",
    socialLinks,
    footerText: typeof input.footerText === "string" ? input.footerText : "Powered by Nexora",
    analyticsScript: typeof input.analyticsScript === "string" ? input.analyticsScript : undefined,
    blocks,
  };
}

export function parsePortfolioSiteConfig(settingsHeader: string | null): PortfolioSiteConfig {
  if (!settingsHeader) return DEFAULT_SITE_CONFIG;
  try {
    const settings = JSON.parse(settingsHeader) as Record<string, unknown>;
    const site =
      settings.portfolioSite && typeof settings.portfolioSite === "object"
        ? (settings.portfolioSite as Record<string, unknown>)
        : {};
    return normalizePortfolioSiteConfig(site);
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function getBlockSectionStyle(style: BlockStyle): CSSProperties {
  if (style.backgroundType === "color") return { backgroundColor: style.backgroundColor };
  if (style.backgroundType === "image") {
    return {
      backgroundImage: `url(${style.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {};
}

export function getPaddingClass(padding: BlockPadding): string {
  if (padding === "sm") return "py-10";
  if (padding === "lg") return "py-24";
  return "py-16";
}

export function getContainerClass(container: BlockContainer): string {
  if (container === "narrow") return "mx-auto max-w-3xl";
  if (container === "wide") return "mx-auto max-w-6xl";
  if (container === "full") return "mx-auto max-w-none";
  return "mx-auto max-w-5xl";
}

export function getBlockSpacingClass(spacing?: BlockSpacing): string {
  if (spacing === "tight") return "py-8";
  if (spacing === "loose") return "py-20";
  return "py-16";
}

export function getBlockVisibilityClass(visibility?: BlockVisibility): string {
  if (visibility === "desktop-only") return "hidden md:block";
  if (visibility === "mobile-only") return "block md:hidden";
  return "";
}

export function getBlockDividerClass(divider?: BlockDivider): string {
  if (divider === "line") return "border-t border-zinc-200";
  if (divider === "wave")
    return "relative before:absolute before:inset-x-0 before:top-0 before:h-4 before:bg-gradient-to-b before:from-transparent before:to-zinc-100 before:content-['']";
  return "";
}

export function getBlockAnimationClass(animation?: BlockAnimation): string {
  if (animation === "fade") return "animate-fade-in";
  if (animation === "slide-up") return "animate-slide-up";
  return "";
}

export function isValidUrl(str: string): boolean {
  if (!str.trim()) return true;
  try {
    new URL(str.startsWith("#") ? "https://example.com" + str : str);
    return true;
  } catch {
    return false;
  }
}

export function hasLowContrast(foreground: string, background: string, minRatio = 4.5): boolean {
  return getContrastRatio(foreground, background) < minRatio;
}

export function getContrastRatio(foreground: string, background: string): number {
  const hex2rgb = (hex: string) => {
    const m = hex.replace(/^#/, "").match(/.{2}/g);
    if (!m) return [0, 0, 0];
    return m.map((x) => parseInt(x, 16) / 255);
  };
  const luminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  const fg = hex2rgb(foreground.replace(/^#/, "").length === 6 ? foreground : "#000000");
  const bg = hex2rgb(background.replace(/^#/, "").length === 6 ? background : "#ffffff");
  const L1 = luminance(fg[0], fg[1], fg[2]);
  const L2 = luminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getBlockValidationIssues(block: BuilderBlock): string[] {
  const issues: string[] = [];
  if (block.type === "hero") {
    if (!String(block.settings.title ?? "").trim()) issues.push("Hero title is empty");
    if (!String(block.settings.ctaText ?? "").trim()) issues.push("CTA text is empty");
    const href = String(block.settings.ctaHref ?? "").trim();
    if (href && !isValidUrl(href)) issues.push("CTA link URL is invalid");
  }
  if (block.type === "cta") {
    if (!String(block.settings.title ?? "").trim()) issues.push("CTA heading is empty");
    if (!String(block.settings.buttonText ?? "").trim()) issues.push("Button text is empty");
    const href = String(block.settings.buttonHref ?? "").trim();
    if (href && !isValidUrl(href)) issues.push("Button link URL is invalid");
  }
  if (block.type === "gallery") {
    const images = Array.isArray(block.settings.images) ? block.settings.images : [];
    if (images.length === 0) issues.push("Gallery has no images");
  }
  if (
    block.type === "hero" &&
    Boolean(block.settings.carouselEnabled) &&
    Array.isArray(block.settings.carouselImages) &&
    block.settings.carouselImages.length === 0
  ) {
    issues.push("Carousel enabled but no images");
  }
  return issues;
}
