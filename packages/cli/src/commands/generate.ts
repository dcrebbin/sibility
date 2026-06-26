import { readFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import {
  extractPlainText,
  manifestJsonPath,
  manifestAudioPath,
  publicAudioUrl,
  type SibilityManifest,
  type OpenAIConfig,
} from "@sibility/core";
import { readManifest, writeManifest, writeIndex } from "../manifest-io.js";
import { hashContent } from "../hash.js";
import { loadConfig } from "../config.js";
import { generateSpeechWithAlignment, transcodeWavToMp3 } from "../generate-audio.js";

function resolveBlockText(cwd: string, block: { text?: string; file?: string }): string {
  if (block.text) {
    return block.text.trim();
  }

  if (block.file) {
    const filePath = resolve(cwd, block.file);
    if (!existsSync(filePath)) {
      throw new Error(`Block file not found: ${block.file}`);
    }
    const raw = readFileSync(filePath, "utf-8");
    return extractPlainText(raw);
  }

  throw new Error("Block must have text or file");
}

async function generateBlock(
  cwd: string,
  outputDir: string,
  configOutput: string,
  block: { id: string; text?: string; file?: string },
  openai: OpenAIConfig,
  apiKey: string,
  force: boolean
): Promise<SibilityManifest> {
  const text = resolveBlockText(cwd, block);
  const contentHash = hashContent(text);
  const jsonPath = manifestJsonPath(outputDir, block.id);
  const mp3Path = manifestAudioPath(outputDir, block.id);

  if (!force && existsSync(jsonPath)) {
    const existing = readManifest(jsonPath);
    if (existing.hash === contentHash && existsSync(mp3Path)) {
      console.log(`  ✓ ${block.id} (cached)`);
      return existing;
    }
  }

  console.log(`  → ${block.id} generating...`);

  const wavPath = join(tmpdir(), `sibility-${block.id}-${randomBytes(4).toString("hex")}.wav`);

  try {
    const result = await generateSpeechWithAlignment(text, {
      apiKey,
      openai,
      wavPath,
    });

    await transcodeWavToMp3(wavPath, mp3Path);

    const manifest: SibilityManifest = {
      id: block.id,
      text,
      audio: publicAudioUrl(configOutput, block.id),
      duration: result.duration,
      voice: openai.voice,
      model: openai.model,
      hash: contentHash,
      words: result.words,
    };

    writeManifest(jsonPath, manifest);
    console.log(`  ✓ ${block.id} (${result.words.length} words, ${result.duration.toFixed(1)}s)`);
    return manifest;
  } finally {
    try {
      if (existsSync(wavPath)) unlinkSync(wavPath);
    } catch {
      // ignore
    }
  }
}

export async function runGenerate(cwd: string, options: { force?: boolean } = {}): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  const config = await loadConfig(cwd);
  const outputDir = resolve(cwd, config.output);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating audio to ${outputDir}\n`);

  const blocks: Record<string, string> = {};

  for (const block of config.blocks) {
    await generateBlock(
      cwd,
      outputDir,
      config.output,
      block,
      config.openai,
      apiKey,
      options.force ?? false
    );
    blocks[block.id] = `${block.id}.json`;
  }

  const indexPath = join(outputDir, "sibility.manifest.json");
  writeIndex(indexPath, {
    version: 1,
    generatedAt: new Date().toISOString(),
    blocks,
  });

  console.log(`\nDone. Wrote ${indexPath}`);
}
