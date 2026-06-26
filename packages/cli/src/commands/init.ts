import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG_TEMPLATE = `import { defineConfig } from 'sibility';

export default defineConfig({
  output: './public/sibility',
  openai: {
    model: 'tts-1-hd',
    voice: 'nova',
  },
  blocks: [
    {
      id: 'hero',
      text: 'Welcome to our site. Read along as we speak.',
    },
  ],
});
`;

export function runInit(cwd: string): void {
  const configPath = resolve(cwd, "sibility.config.ts");
  const outputDir = resolve(cwd, "public/sibility");

  if (existsSync(configPath)) {
    console.log("sibility.config.ts already exists — skipping.");
  } else {
    writeFileSync(configPath, CONFIG_TEMPLATE, "utf-8");
    console.log("Created sibility.config.ts");
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log("Created public/sibility/");
  }

  console.log("\nNext steps:");
  console.log("  1. Edit sibility.config.ts with your content blocks");
  console.log("  2. Set OPENAI_API_KEY in your environment");
  console.log("  3. Run: npx sibility generate");
}
