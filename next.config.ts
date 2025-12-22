import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/epk.pdf',
        destination: '/epk',
        permanent: true,
      },
      {
        source: '/pers',
        destination: '/epk',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
