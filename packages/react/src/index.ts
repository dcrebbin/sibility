export { SibilityReader, SibilityReaderGroup } from "./SibilityReader.js";
export type { SibilityReaderProps } from "./SibilityReader.js";

export { HighlightOverlay } from "./HighlightOverlay.js";
export type { HighlightOverlayProps, HighlightRect } from "./HighlightOverlay.js";

export { useSibilityPlayback } from "./useSibilityPlayback.js";
export type {
  UseSibilityPlaybackOptions,
  UseSibilityPlaybackResult,
  HighlightMode,
} from "./useSibilityPlayback.js";

export { wrapContentWithWordSpans, wrapTextWithWordSpans } from "./tokenize.js";

export type {
  SibilityManifest,
  WordTiming,
  SibilityIndex,
} from "@sibility/core";
