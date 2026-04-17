import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["otzovik.systemtool.ru"],
  },
};

export default nextConfig;
