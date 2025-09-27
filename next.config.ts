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

  // ⚠️ Note: 'serverActions' is not a recognized key in Next.js 15+
  // If you're trying to increase body size for API routes or middleware,
  // consider handling it in your custom server or edge config.
  // serverActions: {
  //   bodySizeLimit: "1000mb",
  // },
};

export default nextConfig;
