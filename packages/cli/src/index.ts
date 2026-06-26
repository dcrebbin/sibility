import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runGenerate } from "./commands/generate.js";

export { defineConfig } from "@sibility/core";

const program = new Command();

program
  .name("sibility")
  .description("Generate OpenAI TTS audio with word-level alignment for karaoke read-along")
  .version("0.1.0");

program
  .command("init")
  .description("Create sibility.config.ts and output directory")
  .action(() => {
    runInit(process.cwd());
  });

program
  .command("generate")
  .description("Generate audio and manifest files from sibility.config.ts")
  .option("-f, --force", "Regenerate all blocks even if unchanged")
  .action(async (options: { force?: boolean }) => {
    try {
      await runGenerate(process.cwd(), { force: options.force });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
