import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        "hero-inter": ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        "hero-playfair": ["var(--font-playfair)", "Georgia", "serif"],
        "hero-georgia": ["Georgia", "serif"],
        "hero-source-sans": ["var(--font-source-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        "hero-system": ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
  safelist: ["prose", "prose-sm", "prose-lg", "font-hero-inter", "font-hero-georgia", "font-hero-playfair", "font-hero-source-sans", "font-hero-system"],
};

export default config;
