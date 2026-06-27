"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { SibilityManifest } from "@sibility/core";
import { HighlightOverlay } from "./HighlightOverlay.js";
import {
  SibilityPlaybackProvider,
  useSibilityPlaybackContextOptional,
  type SibilityPlayerStyles,
} from "./SibilityPlaybackContext.js";
import { SibilityPlayer } from "./SibilityPlayer.js";
import { useSibilityPlayback, type HighlightMode } from "./useSibilityPlayback.js";
import { wrapContentWithWordSpans } from "./tokenize.js";

export interface SibilityReaderProps {
  manifest: SibilityManifest;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  highlightMode?: HighlightMode;
  showOverlay?: boolean;
  /** @deprecated Use `showPlayer` on the parent group or standalone provider instead */
  showControls?: boolean;
  showPlayer?: boolean;
  playerStyles?: SibilityPlayerStyles;
  autoAdvance?: boolean;
  autoPlay?: boolean;
  highlightStyle?: CSSProperties;
  onWordChange?: (index: number) => void;
  onComplete?: () => void;
}

function SibilityReaderContent({
  manifest,
  children,
  className,
  contentClassName,
  title,
  highlightMode = "word",
  showOverlay = true,
  autoPlay = false,
  highlightStyle,
  onWordChange,
  onComplete,
}: SibilityReaderProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const context = useSibilityPlaybackContextOptional();
  const contextRef = useRef(context);
  contextRef.current = context;

  const handleComplete = useCallback(() => {
    onComplete?.();
    if (contextRef.current?.autoAdvance) {
      contextRef.current.playNext();
    }
  }, [onComplete]);

  const playback = useSibilityPlayback({
    manifest,
    audioRef,
    highlightMode,
    autoPlay,
    onWordChange,
    onComplete: handleComplete,
  });

  const { currentWordIndex, highlightEndIndex, isPlaying } = playback;
  const isActive = !context || context.activeId === id;
  const showHighlight = isActive && (isPlaying || currentWordIndex >= 0);

  const readerTitle = title ?? manifest.id;

  useEffect(() => {
    if (!context) return;
    context.registerReader({ id, title: readerTitle, playback });
    return () => context.unregisterReader(id);
  }, [context, id, readerTitle]);

  useEffect(() => {
    if (!context) return;
    context.updateReader(id, { id, title: readerTitle, playback });
  });

  useEffect(() => {
    if (!context || !isPlaying) return;
    context.setActiveId(id);
  }, [context, id, isPlaying]);

  useEffect(() => {
    if (!context || context.activeId === id) return;
    if (isPlaying) {
      playback.pause();
    }
  }, [context, context?.activeId, id, isPlaying, playback.pause]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={contentClassName}
        style={{ position: "relative", lineHeight: 1.7 }}
        data-sibility-active-index={showHighlight ? currentWordIndex : undefined}
        data-sibility-active={isActive}
      >
        {showOverlay && showHighlight && (
          <HighlightOverlay
            containerRef={containerRef}
            startIndex={currentWordIndex}
            endIndex={highlightEndIndex}
            style={highlightStyle}
          />
        )}
        <div>{wrapContentWithWordSpans(children)}</div>
      </div>

      <audio ref={audioRef} src={manifest.audio} preload="auto" />
    </div>
  );
}

export function SibilityReader({
  showControls,
  showPlayer,
  playerStyles,
  autoAdvance,
  ...props
}: SibilityReaderProps) {
  const context = useSibilityPlaybackContextOptional();
  const resolvedShowPlayer = showPlayer ?? showControls ?? true;

  if (context) {
    return <SibilityReaderContent {...props} />;
  }

  return (
    <SibilityPlaybackProvider
      showPlayer={resolvedShowPlayer}
      playerStyles={playerStyles}
      autoAdvance={autoAdvance}
    >
      <SibilityReaderContent {...props} />
      <SibilityPlayer />
    </SibilityPlaybackProvider>
  );
}

export interface SibilityReaderGroupProps {
  children: ReactNode;
  className?: string;
  showPlayer?: boolean;
  playerStyles?: SibilityPlayerStyles;
  autoAdvance?: boolean;
}

export function SibilityReaderGroup({
  children,
  className,
  showPlayer = true,
  playerStyles,
  autoAdvance = true,
}: SibilityReaderGroupProps) {
  return (
    <SibilityPlaybackProvider
      showPlayer={showPlayer}
      playerStyles={playerStyles}
      autoAdvance={autoAdvance}
    >
      <div className={className} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {children}
      </div>
      <SibilityPlayer />
    </SibilityPlaybackProvider>
  );
}
