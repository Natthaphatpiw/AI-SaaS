import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uadzs1v5vqiz9o7f.public.blob.vercel-storage.com',
      },
    ],
  },
  allowedDevOrigins: ["172.20.10.3"]
};

export default nextConfig;
