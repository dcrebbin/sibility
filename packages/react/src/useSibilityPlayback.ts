import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  findActiveWordIndex,
  findSentenceEndIndex,
  type SibilityManifest,
} from "@sibility/core";

export type HighlightMode = "word" | "sentence";

export interface UseSibilityPlaybackOptions {
  manifest: SibilityManifest;
  audioRef: RefObject<HTMLAudioElement | null>;
  highlightMode?: HighlightMode;
  autoPlay?: boolean;
  onWordChange?: (index: number) => void;
  onComplete?: () => void;
}

export interface UseSibilityPlaybackResult {
  isPlaying: boolean;
  currentWordIndex: number;
  highlightEndIndex: number;
  progress: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
}

export function useSibilityPlayback({
  manifest,
  audioRef,
  highlightMode = "word",
  autoPlay = false,
  onWordChange,
  onComplete,
}: UseSibilityPlaybackOptions): UseSibilityPlaybackResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prevWordRef = useRef(-1);

  const highlightEndIndex =
    currentWordIndex >= 0 && highlightMode === "sentence"
      ? findSentenceEndIndex(manifest.words, currentWordIndex)
      : currentWordIndex;

  const updateFromTime = useCallback(
    (time: number) => {
      const index = findActiveWordIndex(manifest.words, time);
      const nextProgress = manifest.duration > 0 ? time / manifest.duration : 0;
      setProgress(nextProgress);

      if (index !== prevWordRef.current) {
        prevWordRef.current = index;
        setCurrentWordIndex(index);
        if (index >= 0) {
          onWordChange?.(index);
        }
      }
    },
    [manifest.duration, manifest.words, onWordChange]
  );

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      updateFromTime(audio.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [audioRef, updateFromTime]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play().then(() => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [audioRef, tick]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [audioRef]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setProgress(0);
    prevWordRef.current = -1;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      setProgress(1);
      prevWordRef.current = -1;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      onComplete?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };

    const handlePause = () => {
      if (audio.currentTime >= audio.duration) return;
      setIsPlaying(false);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    if (autoPlay) {
      play();
    }

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioRef, autoPlay, onComplete, play, tick]);

  return {
    isPlaying,
    currentWordIndex,
    highlightEndIndex,
    progress,
    play,
    pause,
    toggle,
    stop,
  };
}
