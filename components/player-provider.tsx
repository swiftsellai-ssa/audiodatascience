"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PlayerContextValue = {
  playingSubchapterId: string | null;
  setPlayingSubchapterId: (id: string | null) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playingSubchapterId, setPlayingSubchapterId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ playingSubchapterId, setPlayingSubchapterId }),
    [playingSubchapterId],
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
