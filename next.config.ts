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
  /* config options here */
};

export default nextConfig;
