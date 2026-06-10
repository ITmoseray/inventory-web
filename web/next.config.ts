import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  // Standard Next.js server-side build (not static export)
  turbopack: {},
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const nextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(config);

export default nextConfig;
