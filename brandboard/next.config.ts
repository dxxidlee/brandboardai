import path from "path";
import type { NextConfig } from "next";

const projectRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  // Required: a parent lockfile exists at ~/package-lock.json; without this,
  // Next infers the wrong workspace root and Tailwind/PostCSS fail to load in dev.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
