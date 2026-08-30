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

type PlayerContextValue = {
  playingLesson: PlayingLesson | null;
  playingSubchapterId: string | null;
  playLesson: (lesson: PlayingLesson) => void;
  playNext: () => PlayingLesson | null;
  completedIds: string[];
  markCompleted: (id: string) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
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
  const [playingLesson, setPlayingLesson] = useState<PlayingLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);

  const playLesson = useCallback((lesson: PlayingLesson) => {
    playingIdRef.current = lesson.id;
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

    if (audio.getAttribute("src") !== lesson.audio_url) {
      audio.setAttribute("src", lesson.audio_url);
      audio.load();
    }

    void audio.play().catch(() => {
      // Mobile browsers may require a second tap on the player button.
    });
  }, []);

  const playNext = useCallback((): PlayingLesson | null => {
    const queue = flattenPlayableLessons(curriculum);
    const index = queue.findIndex((lesson) => lesson.id === playingIdRef.current);
    const next = index >= 0 ? queue[index + 1] : null;
    if (!next) {
      return null;
    }

    playLesson(next);
    return next;
  }, [curriculum, playLesson]);

  const markCompleted = useCallback((id: string) => {
    setCompletedIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const value = useMemo(
    () => ({
      playingLesson,
      playingSubchapterId: playingLesson?.id ?? null,
      playLesson,
      playNext,
      completedIds,
      markCompleted,
      audioRef,
    }),
    [playingLesson, playLesson, playNext, completedIds, markCompleted],
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
