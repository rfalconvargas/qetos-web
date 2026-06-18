import type { NextConfig } from "next";
import path from "node:path";

const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  // Types are validated separately via `tsc --noEmit`; skipping the in-build
  // type-check/lint workers keeps memory-constrained local builds reliable.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        // Carry over the existing waitlist endpoint from apps/landing.
        source: "/api/waitlist",
        destination:
          "https://efkantatoxcpcteqthfh.supabase.co/functions/v1/waitlist",
      },
    ];
  },
};

export default nextConfig;
