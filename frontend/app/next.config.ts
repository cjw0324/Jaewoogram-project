import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["jaewoo-site-s3-bucket.s3.amazonaws.com"],
  },
};

export default nextConfig;
