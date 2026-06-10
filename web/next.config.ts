import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  // REMOVED: output: 'export' (Required for Auth/API)
  
  // Explicitly set Turbopack config to empty
  turbopack: {},
  
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
