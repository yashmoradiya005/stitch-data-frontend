import type { NextConfig } from "next";

const isMobileBuild = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  ...(isMobileBuild && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  ...(!isMobileBuild && {
    async rewrites() {
      const backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) return [];
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
