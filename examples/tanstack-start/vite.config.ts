import path from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

const repoRoot = path.resolve(__dirname, "../..");

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@sibility/react": path.join(repoRoot, "packages/react/src/index.ts"),
      "@sibility/core": path.join(repoRoot, "packages/core/src/index.ts"),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  plugins: [tanstackStart(), viteReact()],
});

export default config;
