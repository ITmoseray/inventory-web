import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  // Disable Turbopack for Cloudflare build compatibility if needed, 
  // though Cloudflare build happens in their CI.
  // Standard webpack build is safer for the adapter.
  typescript: {
    ignoreBuildErrors: true,
  },
};

const nextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(config);

export default nextConfig;
