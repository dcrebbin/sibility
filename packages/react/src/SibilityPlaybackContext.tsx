"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { UseSibilityPlaybackResult } from "./useSibilityPlayback.js";

export interface SibilityPlayerStyles {
  className?: string;
  style?: React.CSSProperties;
  title?: React.CSSProperties;
  playButton?: React.CSSProperties;
  navButton?: React.CSSProperties;
  progressTrack?: React.CSSProperties;
  progressFill?: React.CSSProperties;
}

export interface RegisteredReader {
  id: string;
  title: string;
  playback: UseSibilityPlaybackResult;
}

interface SibilityPlaybackContextValue {
  readerCount: number;
  activeId: string | null;
  registerReader: (reader: RegisteredReader) => void;
  updateReader: (id: string, reader: RegisteredReader) => void;
  unregisterReader: (id: string) => void;
  getReaders: () => RegisteredReader[];
  getActiveReader: () => RegisteredReader | null;
  setActiveId: (id: string) => void;
  playReader: (id: string) => void;
  seekActive: (time: number) => void;
  toggleActive: () => void;
  playNext: () => void;
  playPrevious: () => void;
  showPlayer: boolean;
  playerStyles?: SibilityPlayerStyles;
  autoAdvance: boolean;
}

const SibilityPlaybackContext = createContext<SibilityPlaybackContextValue | null>(null);

export function useSibilityPlaybackContext(): SibilityPlaybackContextValue {
  const ctx = useContext(SibilityPlaybackContext);
  if (!ctx) {
    throw new Error("useSibilityPlaybackContext must be used within SibilityPlaybackProvider");
  }
  return ctx;
}

export function useSibilityPlaybackContextOptional(): SibilityPlaybackContextValue | null {
  return useContext(SibilityPlaybackContext);
}

export interface SibilityPlaybackProviderProps {
  children: ReactNode;
  showPlayer?: boolean;
  playerStyles?: SibilityPlayerStyles;
  autoAdvance?: boolean;
}

export function SibilityPlaybackProvider({
  children,
  showPlayer = true,
  playerStyles,
  autoAdvance = true,
}: SibilityPlaybackProviderProps) {
  const readersRef = useRef<Map<string, RegisteredReader>>(new Map());
  const [readerCount, setReaderCount] = useState(0);
  const [activeId, setActiveIdState] = useState<string | null>(null);

  const getReaders = useCallback(() => Array.from(readersRef.current.values()), []);

  const getActiveReader = useCallback((): RegisteredReader | null => {
    if (!activeId) return null;
    return readersRef.current.get(activeId) ?? null;
  }, [activeId]);

  const registerReader = useCallback((reader: RegisteredReader) => {
    const isNew = !readersRef.current.has(reader.id);
    readersRef.current.set(reader.id, reader);
    if (isNew) {
      setReaderCount(readersRef.current.size);
      setActiveIdState((current) => current ?? reader.id);
    }
  }, []);

  const updateReader = useCallback((id: string, reader: RegisteredReader) => {
    if (readersRef.current.has(id)) {
      readersRef.current.set(id, reader);
    }
  }, []);

  const unregisterReader = useCallback((id: string) => {
    if (!readersRef.current.delete(id)) return;
    setReaderCount(readersRef.current.size);
    setActiveIdState((current) => {
      if (current !== id) return current;
      const remaining = Array.from(readersRef.current.values());
      return remaining[0]?.id ?? null;
    });
  }, []);

  const pauseOthers = useCallback((exceptId: string) => {
    for (const reader of readersRef.current.values()) {
      if (reader.id !== exceptId && reader.playback.isPlaying) {
        reader.playback.pause();
      }
    }
  }, []);

  const setActiveId = useCallback(
    (id: string) => {
      pauseOthers(id);
      setActiveIdState(id);
    },
    [pauseOthers]
  );

  const playReader = useCallback(
    (id: string) => {
      const reader = readersRef.current.get(id);
      if (!reader) return;
      pauseOthers(id);
      setActiveIdState(id);
      reader.playback.stop();
      reader.playback.play();
    },
    [pauseOthers]
  );

  const seekActive = useCallback(
    (time: number) => {
      if (!activeId) return;
      const reader = readersRef.current.get(activeId);
      reader?.playback.seek(time);
    },
    [activeId]
  );

  const toggleActive = useCallback(() => {
    const readers = Array.from(readersRef.current.values());
    if (readers.length === 0) return;

    const current = activeId ? readersRef.current.get(activeId) : readers[0];
    if (!current) {
      playReader(readers[0]!.id);
      return;
    }

    if (current.playback.isPlaying) {
      current.playback.pause();
    } else {
      pauseOthers(current.id);
      setActiveIdState(current.id);
      current.playback.play();
    }
  }, [activeId, pauseOthers, playReader]);

  const getAdjacentId = useCallback(
    (direction: 1 | -1): string | null => {
      const list = Array.from(readersRef.current.values());
      if (!activeId || list.length < 2) return null;
      const index = list.findIndex((r) => r.id === activeId);
      if (index < 0) return null;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= list.length) return null;
      return list[nextIndex]?.id ?? null;
    },
    [activeId]
  );

  const playNext = useCallback(() => {
    const nextId = getAdjacentId(1);
    if (nextId) playReader(nextId);
  }, [getAdjacentId, playReader]);

  const playPrevious = useCallback(() => {
    const prevId = getAdjacentId(-1);
    if (prevId) playReader(prevId);
  }, [getAdjacentId, playReader]);

  const value = useMemo<SibilityPlaybackContextValue>(
    () => ({
      readerCount,
      activeId,
      registerReader,
      updateReader,
      unregisterReader,
      getReaders,
      getActiveReader,
      setActiveId,
      playReader,
      seekActive,
      toggleActive,
      playNext,
      playPrevious,
      showPlayer,
      playerStyles,
      autoAdvance,
    }),
    [
      readerCount,
      activeId,
      registerReader,
      updateReader,
      unregisterReader,
      getReaders,
      getActiveReader,
      setActiveId,
      playReader,
      seekActive,
      toggleActive,
      playNext,
      playPrevious,
      showPlayer,
      playerStyles,
      autoAdvance,
    ]
  );

  return (
    <SibilityPlaybackContext.Provider value={value}>{children}</SibilityPlaybackContext.Provider>
  );
}
