"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Volume2 } from "lucide-react";
import { useAudioProgress } from "@/hooks/use-audio-progress";
import { usePlayer } from "@/components/player-provider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const router = useRouter();
  const { playingLesson, playLesson, playNext, audioRef } = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [volume, setVolume] = useState(1);

  const { onLoadedMetadata, onTimeUpdate, onEnded } = useAudioProgress({
    audioRef,
    subchapterId: playingLesson?.id ?? null,
  });

  const audioUrl = playingLesson?.audio_url ?? null;

  useEffect(() => {
    setLoadError(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [playingLesson?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const el = audio;

    function handleLoadedMetadata() {
      if (Number.isFinite(el.duration)) {
        setDuration(el.duration);
      }
      onLoadedMetadata();
    }

    function handleTimeUpdate() {
      setCurrentTime(el.currentTime);
      if (Number.isFinite(el.duration)) {
        setDuration(el.duration);
      }
      onTimeUpdate();
    }

    function handleEnded() {
      onEnded();
      const next = playNext();
      if (next) {
        router.push(`/lesson/${next.id}`);
        return;
      }

      setIsPlaying(false);
      if (Number.isFinite(el.duration)) {
        setCurrentTime(el.duration);
      }
    }

    function handlePlay() {
      setIsPlaying(true);
      setLoadError(false);
    }

    function handlePause() {
      setIsPlaying(false);
    }

    function handleError() {
      setLoadError(true);
      setIsPlaying(false);
    }

    el.addEventListener("loadedmetadata", handleLoadedMetadata);
    el.addEventListener("timeupdate", handleTimeUpdate);
    el.addEventListener("ended", handleEnded);
    el.addEventListener("play", handlePlay);
    el.addEventListener("pause", handlePause);
    el.addEventListener("error", handleError);

    return () => {
      el.removeEventListener("loadedmetadata", handleLoadedMetadata);
      el.removeEventListener("timeupdate", handleTimeUpdate);
      el.removeEventListener("ended", handleEnded);
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("error", handleError);
    };
  }, [audioRef, onEnded, onLoadedMetadata, onTimeUpdate, playNext, playingLesson?.id, router]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !playingLesson || !audioUrl) {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      return;
    }

    playLesson(playingLesson);
  }

  function handleSeek(event: ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function handleVolume(event: ChangeEvent<HTMLInputElement>) {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    const audio = audioRef.current;
    if (audio) {
      audio.muted = nextVolume === 0;
      audio.volume = nextVolume;
    }
  }

  const title = playingLesson?.title ?? "Nicio lecție în redare";
  const canPlay = Boolean(audioUrl);
  const statusMessage = playingLesson
    ? audioUrl
      ? null
      : "Această lecție nu are încă audio."
    : "Alege o lecție și apasă Ascultă.";

  return (
    <>
      <div className="h-[88px] shrink-0" aria-hidden />
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-100 bg-white">
        <div className="mx-auto flex h-[88px] max-w-5xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!canPlay}
            aria-label={isPlaying ? "Pauză" : "Redă"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{title}</p>
            {statusMessage ? (
              <p className="mt-1 text-xs text-gray-400">{statusMessage}</p>
            ) : loadError ? (
              <p className="mt-1 text-xs text-gray-400">Audio-ul nu a putut fi redat.</p>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs tabular-nums text-gray-400">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSeek}
                  disabled={!canPlay || duration <= 0}
                  aria-label="Progres"
                  className="h-1 w-full cursor-pointer rounded-full accent-gray-900 disabled:cursor-not-allowed"
                />
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-gray-400">
                  {formatTime(duration)}
                </span>
              </div>
            )}
          </div>

          <label className="hidden items-center gap-2 sm:flex">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolume}
              aria-label="Volum"
              className="h-1 w-20 cursor-pointer accent-gray-900"
            />
          </label>
        </div>
      </div>
    </>
  );
}
