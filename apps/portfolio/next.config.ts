import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nexora/ui", "@nexora/types", "@nexora/utils"],
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
    ],
  },
};

export default nextConfig;
