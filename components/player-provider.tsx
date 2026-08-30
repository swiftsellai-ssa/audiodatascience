"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PlayingLesson = {
  id: string;
  title: string;
  audio_url: string | null;
};

type PlayerContextValue = {
  playingLesson: PlayingLesson | null;
  playingSubchapterId: string | null;
  playLesson: (lesson: PlayingLesson) => void;
  completedIds: string[];
  markCompleted: (id: string) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

type PlayerProviderProps = {
  initialCompletedIds: string[];
  children: ReactNode;
};

export function PlayerProvider({ initialCompletedIds, children }: PlayerProviderProps) {
  const [playingLesson, setPlayingLesson] = useState<PlayingLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);

  const playLesson = useCallback((lesson: PlayingLesson) => {
    setPlayingLesson((current) => (current?.id === lesson.id ? current : lesson));
  }, []);

  const markCompleted = useCallback((id: string) => {
    setCompletedIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const value = useMemo(
    () => ({
      playingLesson,
      playingSubchapterId: playingLesson?.id ?? null,
      playLesson,
      completedIds,
      markCompleted,
    }),
    [playingLesson, playLesson, completedIds, markCompleted],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer trebuie folosit în PlayerProvider.");
  }

  return context;
}


