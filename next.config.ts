import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Hapus batasan ukuran body untuk upload file besar
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Exclude public folder from serverless function bundling
  outputFileTracingExcludes: {
    '*': [
      './public/images/**',
      './public/uploads/**',
      './public/certificates/**',
      './public/payment-proofs/**',
    ],
  },
};

export default nextConfig;
