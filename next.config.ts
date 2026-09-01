import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    staleTimes: {
      dynamic: 30, // Instant 0ms routing between pages by caching dynamic routes for 30s
      static: 180, // Cache static pages for 180s in client router
    },
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/battles",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
