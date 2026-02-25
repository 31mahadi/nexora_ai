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
  safelist: [
    "min-h-[calc(100dvh-3rem)]",
    "min-h-[calc(100vh-3rem)]",
    "min-h-[calc(100dvh-4rem)]",
    "min-h-[calc(100vh-4rem)]",
    "min-h-[calc(100dvh-5rem)]",
    "min-h-[calc(100vh-5rem)]",
    "font-hero-inter",
    "font-hero-georgia",
    "font-hero-playfair",
    "font-hero-source-sans",
    "font-hero-system",
    "text-[87.5%]",
    "text-[112.5%]",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
  ],
};

export default config;
