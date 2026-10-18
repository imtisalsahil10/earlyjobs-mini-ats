import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page reads live pipeline data, so component-level caching is off
  // in favour of per-page dynamic rendering.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
