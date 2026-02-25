import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nexora/ui", "@nexora/types", "@nexora/utils"],
  turbopack: {},
};

export default nextConfig;
