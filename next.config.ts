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
  // Mark pdfkit and its dependencies as external for server-side only
  serverExternalPackages: ['pdfkit', 'fontkit', 'linebreak', 'png-js'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure these native modules are not bundled
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfkit', 'fontkit');
      }
    }
    return config;
  },
};

export default nextConfig;
