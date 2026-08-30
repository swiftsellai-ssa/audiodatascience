"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import type { ModuleWithChildren } from "@/lib/types";

type SidebarProps = {
  curriculum: ModuleWithChildren[];
  completedIds: string[];
  error: string | null;
  onNavigate?: () => void;
};

function findAncestors(
  curriculum: ModuleWithChildren[],
  subchapterId: string,
): { moduleId: string; chapterId: string } | null {
  for (const module of curriculum) {
    for (const chapter of module.chapters) {
      if (chapter.subchapters.some((subchapter) => subchapter.id === subchapterId)) {
        return { moduleId: module.id, chapterId: chapter.id };
      }
    }
  }

  return null;
}

export function Sidebar({ curriculum, completedIds, error, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const activeId = pathname.startsWith("/lesson/") ? pathname.slice("/lesson/".length) : null;
  const completed = useMemo(() => new Set(completedIds), [completedIds]);

  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const first = curriculum[0]?.id;
    return first ? new Set([first]) : new Set();
  });
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => {
    const firstChapter = curriculum[0]?.chapters[0]?.id;
    return firstChapter ? new Set([firstChapter]) : new Set();
  });

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const ancestors = findAncestors(curriculum, activeId);
    if (!ancestors) {
      return;
    }

    setOpenModules((current) => new Set(current).add(ancestors.moduleId));
    setOpenChapters((current) => new Set(current).add(ancestors.chapterId));
  }, [activeId, curriculum]);

  function toggleModule(id: string) {
    setOpenModules((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleChapter(id: string) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <nav className="px-4 py-6" aria-label="Curriculă">
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-8 block px-2 text-sm font-semibold tracking-tight text-gray-900"
      >
        Audio Data Science
      </Link>

      {error ? (
        <p className="px-2 text-sm leading-relaxed text-gray-500">{error}</p>
      ) : null}

      {!error && curriculum.length === 0 ? (
        <p className="px-2 text-sm leading-relaxed text-gray-500">
          Nu există încă module. Rulează scriptul SQL de seed.
        </p>
      ) : null}

      <ul className="space-y-6">
        {curriculum.map((module) => {
          const moduleOpen = openModules.has(module.id);

          return (
            <li key={module.id}>
              <button
                type="button"
                aria-expanded={moduleOpen}
                onClick={() => toggleModule(module.id)}
                className="flex w-full items-center gap-2 px-2 text-left"
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                    moduleOpen ? "rotate-90" : ""
                  }`}
                />
                <span className="text-sm font-semibold leading-snug text-gray-900">
                  {module.title}
                </span>
              </button>

              {moduleOpen ? (
                <ul className="mt-2 space-y-1 pl-4">
                  {module.chapters.map((chapter) => {
                    const chapterOpen = openChapters.has(chapter.id);

                    return (
                      <li key={chapter.id}>
                        <button
                          type="button"
                          aria-expanded={chapterOpen}
                          onClick={() => toggleChapter(chapter.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-gray-50"
                        >
                          <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${
                              chapterOpen ? "rotate-90" : ""
                            }`}
                          />
                          <span className="text-sm font-medium leading-snug text-gray-700">
                            {chapter.title}
                          </span>
                        </button>

                        {chapterOpen ? (
                          <ul className="mt-1 space-y-0.5 pl-6">
                            {chapter.subchapters.map((subchapter) => {
                              const isActive = activeId === subchapter.id;
                              const isCompleted = completed.has(subchapter.id);

                              return (
                                <li key={subchapter.id}>
                                  <Link
                                    href={`/lesson/${subchapter.id}`}
                                    scroll={false}
                                    onClick={onNavigate}
                                    className={`flex items-start gap-2 rounded-lg px-2 py-2 text-sm leading-snug ${
                                      isActive
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                  >
                                    <span className="flex-1">{subchapter.title}</span>
                                    {isCompleted ? (
                                      <Check
                                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                                          isActive ? "text-white" : "text-gray-900"
                                        }`}
                                        aria-label="Completat"
                                      />
                                    ) : null}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
