import type { ModuleWithChildren } from "@/lib/types";

export type QueueLesson = {
  id: string;
  title: string;
  audio_url: string;
};

export function flattenPlayableLessons(curriculum: ModuleWithChildren[]): QueueLesson[] {
  const queue: QueueLesson[] = [];

  for (const module of curriculum) {
    for (const chapter of module.chapters) {
      for (const subchapter of chapter.subchapters) {
        if (subchapter.audio_url) {
          queue.push({
            id: subchapter.id,
            title: subchapter.title,
            audio_url: subchapter.audio_url,
          });
        }
      }
    }
  }

  return queue;
}
