import { z } from "zod";

export const WordTimingSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

export type WordTiming = z.infer<typeof WordTimingSchema>;

export const SibilityManifestSchema = z.object({
  id: z.string(),
  text: z.string(),
  audio: z.string(),
  duration: z.number(),
  voice: z.string(),
  model: z.string(),
  hash: z.string(),
  words: z.array(WordTimingSchema),
});

export type SibilityManifest = z.infer<typeof SibilityManifestSchema>;

export const SibilityIndexSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string(),
  blocks: z.record(z.string(), z.string()),
});

export type SibilityIndex = z.infer<typeof SibilityIndexSchema>;

export const OpenAIConfigSchema = z.object({
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1-hd"),
  voice: z
    .enum(["alloy", "ash", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"])
    .default("nova"),
});

export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;

export const BlockConfigSchema = z
  .object({
    id: z.string(),
    text: z.string().optional(),
    file: z.string().optional(),
  })
  .refine((block) => block.text || block.file, {
    message: "Each block must have either text or file",
  });

export type BlockConfig = z.infer<typeof BlockConfigSchema>;

export const SibilityConfigSchema = z.object({
  output: z.string().default("./public/sibility"),
  openai: OpenAIConfigSchema.default({}),
  blocks: z.array(BlockConfigSchema).min(1),
});

export type SibilityConfig = z.infer<typeof SibilityConfigSchema>;

export function defineConfig(config: SibilityConfig): SibilityConfig {
  return SibilityConfigSchema.parse(config);
}
