import path from "node:path";
import type { NextConfig } from "next";

const reactSrc = path.resolve(__dirname, "../../packages/react/src/index.ts");
const coreSrc = path.resolve(__dirname, "../../packages/core/src/index.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@sibility/react", "@sibility/core"],
  webpack: (config, { dev }) => {
    if (!dev) return config;

    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@sibility/react": reactSrc,
      "@sibility/core": coreSrc,
    };
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@sibility/react": reactSrc,
      "@sibility/core": coreSrc,
    },
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
};

export default nextConfig;
