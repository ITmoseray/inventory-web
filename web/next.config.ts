import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  // Standard Next.js server-side build (not static export)
  output: "standalone",
  turbopack: {},
  // @ts-ignore
  allowedDevOrigins: ["10.0.2.2"],
  
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  productionBrowserSourceMaps: true, // Enabled for debugging production error
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

const nextConfig = withPWA({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
  importScripts: ["/custom-sw.js"]
})(config);

export default nextConfig;
