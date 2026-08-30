export type Module = {
  id: string;
  title: string;
  description: string | null;
  sequence_order: number;
};

export type Chapter = {
  id: string;
  module_id: string;
  title: string;
  sequence_order: number;
};

export type SubchapterSummary = {
  id: string;
  title: string;
  sequence_order: number;
};

export type ChapterWithSubchapters = Chapter & {
  subchapters: SubchapterSummary[];
};

export type ModuleWithChildren = Module & {
  chapters: ChapterWithSubchapters[];
};

export type Lesson = {
  id: string;
  title: string;
  content_rules: string[];
  audio_url: string | null;
  chapterTitle: string;
  moduleTitle: string;
};
