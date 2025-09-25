import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "darelkubra.com",
        pathname: "/**",
      },
    ],
  },
  serverActions: {
    bodySizeLimit: "10mb",
  },
};

export default nextConfig;
