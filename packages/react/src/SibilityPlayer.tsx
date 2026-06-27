"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSibilityPlaybackContext } from "./SibilityPlaybackContext.js";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function useActivePlaybackFrame(activeId: string | null) {
  const { getActiveReader } = useSibilityPlaybackContext();
  const [, setFrame] = useState(0);

  useEffect(() => {
    setFrame((frame) => frame + 1);
  }, [activeId]);

  useEffect(() => {
    let raf: number;
    let lastTime = -1;
    const tick = () => {
      const reader = getActiveReader();
      const time = reader?.playback.currentTime ?? 0;
      const playing = reader?.playback.isPlaying ?? false;
      if (playing || time !== lastTime) {
        lastTime = time;
        setFrame((frame) => frame + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeId, getActiveReader]);

  return getActiveReader();
}

function timeFromPointer(clientX: number, track: HTMLElement, duration: number): number {
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0 || duration <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  return ratio * duration;
}

export function SibilityPlayer() {
  const {
    readerCount,
    activeId,
    toggleActive,
    playNext,
    playPrevious,
    seekActive,
    showPlayer,
    playerStyles,
    getReaders,
  } = useSibilityPlaybackContext();

  const activeReader = useActivePlaybackFrame(activeId);
  const readers = getReaders();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const isPlaying = activeReader?.playback.isPlaying ?? false;
  const progress = activeReader?.playback.progress ?? 0;
  const currentTime = activeReader?.playback.currentTime ?? 0;
  const duration = activeReader?.playback.duration ?? 0;
  const title = activeReader?.title ?? "Sibility";
  const hasMultiple = readers.length > 1;
  const activeIndex = activeReader ? readers.findIndex((r) => r.id === activeReader.id) : -1;
  const hasPrevious = hasMultiple && activeIndex > 0;
  const hasNext = hasMultiple && activeIndex >= 0 && activeIndex < readers.length - 1;

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const displayProgress = duration > 0 ? displayTime / duration : progress;

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || duration <= 0) return;
      const time = timeFromPointer(clientX, track, duration);
      setScrubTime(time);
      seekActive(time);
    },
    [duration, seekActive]
  );

  const handleScrubStart = useCallback(
    (clientX: number) => {
      if (duration <= 0) return;
      setIsScrubbing(true);
      seekFromPointer(clientX);
    },
    [duration, seekFromPointer]
  );

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMove = (event: PointerEvent) => {
      seekFromPointer(event.clientX);
    };

    const handleUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isScrubbing, seekFromPointer]);

  if (!showPlayer || readerCount === 0) return null;

  return (
    <div
      className={playerStyles?.className}
      role="region"
      aria-label="Sibility playback controls"
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        width: "min(32rem, calc(100vw - 2rem))",
        padding: "0.75rem 1rem",
        borderRadius: 999,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        background: "rgba(255, 255, 255, 0.92)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        backdropFilter: "blur(12px)",
        ...playerStyles?.style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
        {hasMultiple && (
          <button
            type="button"
            onClick={playPrevious}
            disabled={!hasPrevious}
            aria-label="Previous section"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              border: "none",
              borderRadius: "50%",
              background: "transparent",
              cursor: hasPrevious ? "pointer" : "default",
              opacity: hasPrevious ? 1 : 0.35,
              fontSize: "0.75rem",
              ...playerStyles?.navButton,
            }}
          >
            ⏮
          </button>
        )}

        <button
          type="button"
          onClick={toggleActive}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            border: "none",
            borderRadius: "50%",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.9rem",
            flexShrink: 0,
            ...playerStyles?.playButton,
          }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        {hasMultiple && (
          <button
            type="button"
            onClick={playNext}
            disabled={!hasNext}
            aria-label="Next section"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              border: "none",
              borderRadius: "50%",
              background: "transparent",
              cursor: hasNext ? "pointer" : "default",
              opacity: hasNext ? 1 : 0.35,
              fontSize: "0.75rem",
              ...playerStyles?.navButton,
            }}
          >
            ⏭
          </button>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "0.35rem",
            ...playerStyles?.title,
          }}
        >
          {title}
        </div>
        <div
          ref={trackRef}
          role="slider"
          aria-label="Playback position"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(displayTime)}
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault();
            trackRef.current?.setPointerCapture(event.pointerId);
            handleScrubStart(event.clientX);
          }}
          onKeyDown={(event) => {
            if (duration <= 0) return;
            const step = duration * 0.05;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              seekActive(Math.max(0, currentTime - step));
            }
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              seekActive(Math.min(duration, currentTime + step));
            }
            if (event.key === "Home") {
              event.preventDefault();
              seekActive(0);
            }
            if (event.key === "End") {
              event.preventDefault();
              seekActive(duration);
            }
          }}
          style={{
            position: "relative",
            height: 16,
            display: "flex",
            alignItems: "center",
            cursor: duration > 0 ? "pointer" : "default",
            touchAction: "none",
            ...playerStyles?.progressTrack,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 4,
              background: "#e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${displayProgress * 100}%`,
                height: "100%",
                background: "#3b82f6",
                transition: isScrubbing ? "none" : "width 0.1s linear",
                ...playerStyles?.progressFill,
              }}
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          fontSize: "0.75rem",
          color: "#6b7280",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {formatTime(displayTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
