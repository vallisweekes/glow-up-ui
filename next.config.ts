import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  // Avoid exposing server-only env vars to the client
};

export default nextConfig;
