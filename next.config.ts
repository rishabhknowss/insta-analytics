import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Disable Turbopack's persistent SST/RocksDB cache in dev — prevents panics
    // when .next is deleted and Turbopack tries to restore from missing SST files
    turbopackFileSystemCacheForDev: false,
  } as Record<string, unknown>,
  allowedDevOrigins: ["armani-histologic-sheilah.ngrok-free.dev"],
};

export default nextConfig;
