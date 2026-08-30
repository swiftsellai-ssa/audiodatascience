"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { fetchLastPosition, saveProgress } from "@/lib/progress";
import { usePlayer } from "@/components/player-provider";

const SAVE_INTERVAL_SECONDS = 5;

type UseAudioProgressOptions = {
  audioRef: RefObject<HTMLAudioElement | null>;
  subchapterId: string | null;
};

export function useAudioProgress({ audioRef, subchapterId }: UseAudioProgressOptions) {
  const { markCompleted } = usePlayer();
  const resumeAtRef = useRef(0);
  const lastSavedRef = useRef(0);
  const currentSecondsRef = useRef(0);
  const subchapterIdRef = useRef(subchapterId);

  useEffect(() => {
    subchapterIdRef.current = subchapterId;
  }, [subchapterId]);

  const applyResume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.readyState < 1) {
      return;
    }

    const duration = audio.duration;
    const resumeAt = resumeAtRef.current;
    const nearEnd =
      Number.isFinite(duration) && duration > 0 && resumeAt >= duration - 0.5;

    audio.currentTime = nearEnd ? 0 : resumeAt;
  }, [audioRef]);

  useEffect(() => {
    resumeAtRef.current = 0;
    lastSavedRef.current = 0;
    currentSecondsRef.current = 0;

    if (!subchapterId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const position = await fetchLastPosition(subchapterId);
      if (cancelled || subchapterIdRef.current !== subchapterId) {
        return;
      }

      resumeAtRef.current = position;
      lastSavedRef.current = Math.floor(position);
      currentSecondsRef.current = Math.floor(position);
      applyResume();
    })();

    return () => {
      cancelled = true;
      const seconds = currentSecondsRef.current;
      if (seconds > 0) {
        void saveProgress(subchapterId, seconds);
      }
    };
  }, [subchapterId, applyResume]);

  function onLoadedMetadata() {
    applyResume();
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    const id = subchapterIdRef.current;
    if (!audio || !id) {
      return;
    }

    const current = Math.floor(audio.currentTime);
    currentSecondsRef.current = current;

    if (current > 0 && current - lastSavedRef.current >= SAVE_INTERVAL_SECONDS) {
      lastSavedRef.current = current;
      void saveProgress(id, current);
    }
  }

  function onEnded() {
    const audio = audioRef.current;
    const id = subchapterIdRef.current;
    if (!id) {
      return;
    }

    const seconds = audio ? Math.floor(audio.duration || audio.currentTime || 0) : 0;
    lastSavedRef.current = seconds;
    currentSecondsRef.current = seconds;
    markCompleted(id);
    void saveProgress(id, seconds, true);
  }

  return { onLoadedMetadata, onTimeUpdate, onEnded };
}
