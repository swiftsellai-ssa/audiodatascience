import { asRuleList } from "@/lib/rules";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Lesson, ModuleWithChildren } from "@/lib/types";

type CurriculumResult = {
  data: ModuleWithChildren[];
  error: string | null;
};

type LessonResult = {
  data: Lesson | null;
  error: string | null;
};

type NestedModule = {
  id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  chapters: {
    id: string;
    module_id: string;
    title: string;
    sequence_order: number;
    subchapters: {
      id: string;
      title: string;
      sequence_order: number;
      audio_url: string | null;
    }[] | null;
  }[] | null;
};

export async function getCurriculum(): Promise<CurriculumResult> {
  if (!getSupabaseEnv()) {
    return {
      data: [],
      error: "Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("modules")
      .select(
        `
        id,
        title,
        description,
        sequence_order,
        chapters (
          id,
          module_id,
          title,
          sequence_order,
          subchapters (
            id,
            title,
            sequence_order,
            audio_url
          )
        )
      `,
      )
      .order("sequence_order", { ascending: true });

    if (error) {
      return { data: [], error: "Nu am putut încărca curricula." };
    }

    const modules = ((data ?? []) as NestedModule[]).map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      sequence_order: module.sequence_order,
      chapters: [...(module.chapters ?? [])]
        .sort((a, b) => a.sequence_order - b.sequence_order)
        .map((chapter) => ({
          id: chapter.id,
          module_id: chapter.module_id,
          title: chapter.title,
          sequence_order: chapter.sequence_order,
          subchapters: [...(chapter.subchapters ?? [])].sort(
            (a, b) => a.sequence_order - b.sequence_order,
          ),
        })),
    }));

    return { data: modules, error: null };
  } catch {
    return { data: [], error: "Nu am putut încărca curricula." };
  }
}

export async function getLesson(id: string): Promise<LessonResult> {
  if (!getSupabaseEnv()) {
    return {
      data: null,
      error: "Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subchapters")
      .select(
        `
        id,
        title,
        content_rules,
        audio_url,
        chapters (
          title,
          modules (
            title
          )
        )
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { data: null, error: "Nu am putut încărca lecția." };
    }

    if (!data) {
      return { data: null, error: null };
    }

    const chapter = Array.isArray(data.chapters) ? data.chapters[0] : data.chapters;
    const moduleRow = chapter?.modules
      ? Array.isArray(chapter.modules)
        ? chapter.modules[0]
        : chapter.modules
      : null;

    return {
      data: {
        id: data.id,
        title: data.title,
        content_rules: asRuleList(data.content_rules),
        audio_url: data.audio_url,
        chapterTitle: chapter?.title ?? "",
        moduleTitle: moduleRow?.title ?? "",
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Nu am putut încărca lecția." };
  }
}

export async function getCompletedSubchapterIds(): Promise<Set<string>> {
  if (!getSupabaseEnv()) {
    return new Set();
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Set();
    }

    const { data, error } = await supabase
      .from("user_progress")
      .select("subchapter_id")
      .eq("user_id", user.id)
      .eq("is_completed", true);

    if (error || !data) {
      return new Set();
    }

    return new Set(data.map((row) => row.subchapter_id));
  } catch {
    return new Set();
  }
}
