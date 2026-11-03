import type { NextConfig } from "next";
// @ts-check
import withPlaiceholder from "@plaiceholder/next";
const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  experimental:{
    staleTimes:{
      dynamic:30,
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-6cb995ac25324613a456b55971827f44.r2.dev",
      },
    ],
  },
  serverExternalPackages: ["@node-rs/argon2", "sharp"],
};

export default withPlaiceholder(nextConfig);
