import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb', // Increase from default 1MB to 50MB for file uploads
    },
  },
};

export default nextConfig;
