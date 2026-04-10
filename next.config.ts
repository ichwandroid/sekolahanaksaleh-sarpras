import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["server-tu","10.10.2.230"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bwipjs-api.metafloor.com",
      },
    ],
  },
}

export default nextConfig
