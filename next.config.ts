import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {

    // domains: ["darelkubra.com"],// Add your allowed image domains here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "darelkubra.com",
       
      },
    ],

  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
  /* config options here */
};

export default nextConfig;
