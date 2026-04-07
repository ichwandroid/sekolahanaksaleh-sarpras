import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.12"],
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
