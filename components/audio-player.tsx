"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { useAudioProgress } from "@/hooks/use-audio-progress";
import { usePlayer, type PlayingLesson } from "@/components/player-provider";
import { prepareAudioElement, unlockAudio } from "@/lib/audio-output";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const { playingLesson } = usePlayer();

  return (
    <>
      <div className="h-[88px] shrink-0" aria-hidden />
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-100 bg-white">
        <PlayerBar key={playingLesson?.id ?? "idle"} lesson={playingLesson} />
      </div>
    </>
  );
}

function PlayerBar({ lesson }: { lesson: PlayingLesson | null }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [volume, setVolume] = useState(1);

  const { onLoadedMetadata, onTimeUpdate, onEnded } = useAudioProgress({
    audioRef,
    subchapterId: lesson?.id ?? null,
  });

  const audioUrl = lesson?.audio_url ?? null;

  async function startPlayback() {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      return;
    }

    await unlockAudio();
    prepareAudioElement(audio, volume);

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
    if (audio) {
      prepareAudioElement(audio, volume);
    }
    onLoadedMetadata();
    void startPlayback();
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    }
    onTimeUpdate();
  }

  function handleEnded() {
    setIsPlaying(false);
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      setCurrentTime(audio.duration);
    }
    onEnded();
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void startPlayback();
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

  const title = lesson?.title ?? "Nicio lecție în redare";
  const canPlay = Boolean(audioUrl);
  const statusMessage = lesson
    ? audioUrl
      ? null
      : "Această lecție nu are încă audio."
    : "Alege o lecție și apasă Ascultă.";

  return (
    <>
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

      {audioUrl && lesson ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setLoadError(true)}
        />
      ) : null}
    </>
  );
}
