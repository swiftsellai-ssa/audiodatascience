"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { flattenPlayableLessons } from "@/lib/queue";
import type { ModuleWithChildren } from "@/lib/types";

export type PlayingLesson = {
  id: string;
  title: string;
  audio_url: string | null;
};

export type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  playingLesson: PlayingLesson | null;
  playingSubchapterId: string | null;
  playLesson: (lesson: PlayingLesson, options?: { fromStart?: boolean }) => void;
  playNext: () => PlayingLesson | null;
  playFirst: () => PlayingLesson | null;
  repeatMode: RepeatMode;
  cycleRepeatMode: () => void;
  completedIds: string[];
  markCompleted: (id: string) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  skipResumeRef: RefObject<boolean>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

type PlayerProviderProps = {
  curriculum: ModuleWithChildren[];
  initialCompletedIds: string[];
  children: ReactNode;
};

export function PlayerProvider({
  curriculum,
  initialCompletedIds,
  children,
}: PlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingIdRef = useRef<string | null>(null);
  const skipResumeRef = useRef(false);
  const [playingLesson, setPlayingLesson] = useState<PlayingLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");

  const playLesson = useCallback((lesson: PlayingLesson, options?: { fromStart?: boolean }) => {
    playingIdRef.current = lesson.id;
    skipResumeRef.current = Boolean(options?.fromStart);
    setPlayingLesson(lesson);
    const audio = audioRef.current;
    if (!audio || !lesson.audio_url) {
      return;
    }

    audio.muted = false;
    audio.defaultMuted = false;
    if (audio.volume === 0) {
      audio.volume = 1;
    }

    const start = () => {
      if (options?.fromStart) {
        audio.currentTime = 0;
      }
      void audio.play().catch(() => {
        // Mobile browsers may require a second tap on the player button.
      });
    };

    if (audio.getAttribute("src") !== lesson.audio_url) {
      audio.setAttribute("src", lesson.audio_url);
      audio.load();
      audio.addEventListener("canplay", start, { once: true });
      return;
    }

    start();
  }, []);

  const playNext = useCallback((): PlayingLesson | null => {
    const queue = flattenPlayableLessons(curriculum);
    const index = queue.findIndex((lesson) => lesson.id === playingIdRef.current);
    const next = index >= 0 ? queue[index + 1] : null;
    if (!next) {
      return null;
    }

    playLesson(next, { fromStart: true });
    return next;
  }, [curriculum, playLesson]);

  const playFirst = useCallback((): PlayingLesson | null => {
    const first = flattenPlayableLessons(curriculum)[0];
    if (!first) {
      return null;
    }

    playLesson(first, { fromStart: true });
    return first;
  }, [curriculum, playLesson]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((current) => {
      if (current === "off") return "all";
      if (current === "all") return "one";
      return "off";
    });
  }, []);

  const markCompleted = useCallback((id: string) => {
    setCompletedIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const value = useMemo(
    () => ({
      playingLesson,
      playingSubchapterId: playingLesson?.id ?? null,
      playLesson,
      playNext,
      playFirst,
      repeatMode,
      cycleRepeatMode,
      completedIds,
      markCompleted,
      audioRef,
      skipResumeRef,
    }),
    [
      playingLesson,
      playLesson,
      playNext,
      playFirst,
      repeatMode,
      cycleRepeatMode,
      completedIds,
      markCompleted,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} playsInline preload="none" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer trebuie folosit în PlayerProvider.");
  }

  return context;
}
