import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  // Standard Next.js server-side build (not static export)
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
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
  async redirects() {
    return [
      {
        source: "/dashboard/staff",
        destination: "/dashboard/staff/employees",
        permanent: true,
      },
      {
        source: "/dashboard/inventory",
        destination: "/dashboard/inventory/overview",
        permanent: true,
      },
      {
        source: "/dashboard/sales",
        destination: "/dashboard/sales/history",
        permanent: true,
      },
      {
        source: "/dashboard/accounting",
        destination: "/dashboard/accounting/pl",
        permanent: true,
      },
      {
        source: "/dashboard/system",
        destination: "/dashboard/system/settings",
        permanent: true,
      },
      {
        source: "/dashboard/clinic",
        destination: "/dashboard/clinic/overview",
        permanent: true,
      },
    ];
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
