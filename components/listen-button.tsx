"use client";

import { Play } from "lucide-react";
import { usePlayer } from "@/components/player-provider";
import type { Lesson } from "@/lib/types";

type ListenButtonProps = {
  lesson: Lesson;
};

export function ListenButton({ lesson }: ListenButtonProps) {
  const { playingLesson, playLesson } = usePlayer();
  const isCurrent = playingLesson?.id === lesson.id;
  const hasAudio = Boolean(lesson.audio_url);

  return (
    <button
      type="button"
      disabled={!hasAudio}
      onClick={() =>
        playLesson({
          id: lesson.id,
          title: lesson.title,
          audio_url: lesson.audio_url,
        })
      }
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
    >
      <Play className="h-4 w-4" fill="currentColor" />
      {!hasAudio ? "Audio indisponibil" : isCurrent ? "În redare" : "Ascultă lecția"}
    </button>
  );
}
