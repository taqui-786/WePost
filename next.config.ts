import type { NextConfig } from "next";
// @ts-check
import withPlaiceholder from "@plaiceholder/next";
const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    staleTimes:{
      dynamic:30,
    }
  },
  images:{
    remotePatterns: [
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          
        }
      ],
   },
  serverExternalPackages:["@node-rs/argon2"],
};

export default withPlaiceholder(nextConfig);
