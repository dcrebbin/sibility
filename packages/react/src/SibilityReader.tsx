"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import type { SibilityManifest } from "@sibility/core";
import { HighlightOverlay } from "./HighlightOverlay.js";
import { useSibilityPlayback, type HighlightMode } from "./useSibilityPlayback.js";
import { wrapContentWithWordSpans } from "./tokenize.js";

export interface SibilityReaderProps {
  manifest: SibilityManifest;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  highlightMode?: HighlightMode;
  showOverlay?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  highlightStyle?: CSSProperties;
  onWordChange?: (index: number) => void;
  onComplete?: () => void;
}

export function SibilityReader({
  manifest,
  children,
  className,
  contentClassName,
  highlightMode = "word",
  showOverlay = true,
  showControls = true,
  autoPlay = false,
  highlightStyle,
  onWordChange,
  onComplete,
}: SibilityReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { isPlaying, currentWordIndex, highlightEndIndex, progress, toggle } =
    useSibilityPlayback({
      manifest,
      audioRef,
      highlightMode,
      autoPlay,
      onWordChange,
      onComplete,
    });

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        ref={containerRef}
        className={contentClassName}
        style={{ position: "relative", lineHeight: 1.7 }}
        data-sibility-active-index={currentWordIndex}
      >
        {showOverlay && (
          <HighlightOverlay
            containerRef={containerRef}
            startIndex={currentWordIndex}
            endIndex={highlightEndIndex}
            style={highlightStyle}
          />
        )}
        <div>{wrapContentWithWordSpans(children)}</div>
      </div>

      {showControls && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: isPlaying ? "#f3f4f6" : "#fff",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              flex: 1,
              height: 4,
              background: "#e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: "#3b82f6",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      )}

      <audio ref={audioRef} src={manifest.audio} preload="auto" />
    </div>
  );
}

export function SibilityReaderGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {children}
    </div>
  );
}
