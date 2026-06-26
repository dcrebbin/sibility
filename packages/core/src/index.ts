export {
  WordTimingSchema,
  SibilityManifestSchema,
  SibilityIndexSchema,
  OpenAIConfigSchema,
  BlockConfigSchema,
  SibilityConfigSchema,
  defineConfig,
} from "./types.js";

export type {
  WordTiming,
  SibilityManifest,
  SibilityIndex,
  OpenAIConfig,
  BlockConfig,
  SibilityConfig,
} from "./types.js";

export {
  parseManifest,
  parseIndex,
  manifestAudioPath,
  manifestJsonPath,
  publicAudioUrl,
} from "./manifest.js";

export {
  tokenizeText,
  alignWordsToSource,
  extractPlainText,
  findActiveWordIndex,
  findSentenceEndIndex,
} from "./utils.js";

