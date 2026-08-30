import type { Lesson } from "@/lib/types";

type VisualBoardProps = {
  lesson: Lesson;
};

export function VisualBoard({ lesson }: VisualBoardProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <p className="mb-3 text-sm tracking-wide text-gray-400">
        {lesson.moduleTitle}
        {lesson.chapterTitle ? ` · ${lesson.chapterTitle}` : ""}
      </p>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-gray-900">
        {lesson.title}
      </h1>

      {lesson.content_rules.length === 0 ? (
        <p className="text-lg leading-relaxed text-gray-500">
          Această lecție nu are încă reguli de reținut.
        </p>
      ) : (
        <ul className="space-y-4">
          {lesson.content_rules.map((rule, index) => (
            <li
              key={`${lesson.id}-${index}`}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <p className="text-lg leading-relaxed text-gray-800">{rule}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
