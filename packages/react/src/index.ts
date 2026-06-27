export { SibilityReader, SibilityReaderGroup } from "./SibilityReader.js";
export type { SibilityReaderProps, SibilityReaderGroupProps } from "./SibilityReader.js";

export { SibilityPlayer } from "./SibilityPlayer.js";

export {
  SibilityPlaybackProvider,
  useSibilityPlaybackContext,
  useSibilityPlaybackContextOptional,
} from "./SibilityPlaybackContext.js";
export type { SibilityPlayerStyles, SibilityPlaybackProviderProps } from "./SibilityPlaybackContext.js";

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
