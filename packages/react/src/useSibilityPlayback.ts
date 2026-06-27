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
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  seek: (time: number) => void;
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
  const [currentTime, setCurrentTime] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prevWordRef = useRef(-1);
  const onWordChangeRef = useRef(onWordChange);
  const onCompleteRef = useRef(onComplete);

  onWordChangeRef.current = onWordChange;
  onCompleteRef.current = onComplete;

  const highlightEndIndex =
    currentWordIndex >= 0 && highlightMode === "sentence"
      ? findSentenceEndIndex(manifest.words, currentWordIndex)
      : currentWordIndex;

  const updateFromTime = useCallback(
    (time: number) => {
      const index = findActiveWordIndex(manifest.words, time);
      const nextProgress = manifest.duration > 0 ? time / manifest.duration : 0;
      setCurrentTime(time);
      setProgress(nextProgress);

      if (index !== prevWordRef.current) {
        prevWordRef.current = index;
        setCurrentWordIndex(index);
        if (index >= 0) {
          onWordChangeRef.current?.(index);
        }
      }
    },
    [manifest.duration, manifest.words]
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
    setCurrentTime(0);
    setProgress(0);
    prevWordRef.current = -1;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [audioRef]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const maxTime = manifest.duration > 0 ? manifest.duration : audio.duration;
      const clamped = Math.max(0, Math.min(time, maxTime || 0));
      audio.currentTime = clamped;

      const index = findActiveWordIndex(manifest.words, clamped);
      prevWordRef.current = index;
      setCurrentWordIndex(index);
      setCurrentTime(clamped);
      setProgress(maxTime > 0 ? clamped / maxTime : 0);

      if (index >= 0) {
        onWordChangeRef.current?.(index);
      }
    },
    [audioRef, manifest.duration, manifest.words]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      setCurrentTime(manifest.duration);
      setProgress(1);
      prevWordRef.current = -1;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      onCompleteRef.current?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
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
    } else if (!audio.paused && rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioRef, autoPlay, manifest.duration, play, tick]);

  return {
    isPlaying,
    currentWordIndex,
    highlightEndIndex,
    progress,
    currentTime,
    duration: manifest.duration,
    play,
    pause,
    toggle,
    stop,
    seek,
  };
}
