import { createJiti } from "jiti";
import { resolve } from "node:path";
import { SibilityConfigSchema, type SibilityConfig } from "@sibility/core";

export async function loadConfig(cwd: string): Promise<SibilityConfig> {
  const configPath = resolve(cwd, "sibility.config.ts");
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const loaded = await jiti.import(configPath);
  const config = (loaded as { default?: unknown }).default ?? loaded;
  return SibilityConfigSchema.parse(config);
}
