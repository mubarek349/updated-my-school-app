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
    bodySizeLimit: "10000mb",
  },
  /* config options here */
};

export default nextConfig;
/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1000mb",
    },
  },
};
