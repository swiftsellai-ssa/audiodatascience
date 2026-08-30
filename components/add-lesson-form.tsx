"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ModuleWithChildren } from "@/lib/types";

const NEW_VALUE = "__new__";

type AddLessonFormProps = {
  curriculum: ModuleWithChildren[];
};

export function AddLessonForm({ curriculum }: AddLessonFormProps) {
  const router = useRouter();
  const [moduleId, setModuleId] = useState(curriculum[0]?.id ?? NEW_VALUE);
  const [moduleTitle, setModuleTitle] = useState("");
  const [chapterId, setChapterId] = useState(
    curriculum[0]?.chapters[0]?.id ?? NEW_VALUE,
  );
  const [chapterTitle, setChapterTitle] = useState("");
  const [title, setTitle] = useState("");
  const [rules, setRules] = useState(["", "", ""]);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "ok">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const selectedModule = useMemo(
    () => curriculum.find((item) => item.id === moduleId) ?? null,
    [curriculum, moduleId],
  );

  const chapters = selectedModule?.chapters ?? [];

  function handleModuleChange(value: string) {
    setModuleId(value);
    if (value === NEW_VALUE) {
      setChapterId(NEW_VALUE);
      return;
    }

    const nextModule = curriculum.find((item) => item.id === value);
    setChapterId(nextModule?.chapters[0]?.id ?? NEW_VALUE);
  }

  function updateRule(index: number, value: string) {
    setRules((current) => current.map((rule, i) => (i === index ? value : rule)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("create-lesson", {
        body: {
          moduleId: moduleId === NEW_VALUE ? null : moduleId,
          moduleTitle: moduleId === NEW_VALUE ? moduleTitle : null,
          chapterId: chapterId === NEW_VALUE ? null : chapterId,
          chapterTitle: chapterId === NEW_VALUE ? chapterTitle : null,
          title,
          content_rules: rules,
        },
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      if (error) {
        throw error;
      }

      if (!data?.id) {
        throw new Error("Lecția a fost salvată, dar nu am primit ID-ul.");
      }

      setStatus("ok");
      setMessage("Lecția e salvată. Audio-ul se generează acum — poți deschide lecția imediat.");
      router.refresh();
      router.push(`/lesson/${data.id}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Nu am putut salva lecția.");
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="module">
          Modul
        </label>
        <select
          id="module"
          value={moduleId}
          onChange={(event) => handleModuleChange(event.target.value)}
          className={inputClass}
        >
          {curriculum.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
          <option value={NEW_VALUE}>+ Modul nou</option>
        </select>
        {moduleId === NEW_VALUE ? (
          <input
            value={moduleTitle}
            onChange={(event) => setModuleTitle(event.target.value)}
            placeholder="Ex: Etapa 5: Proiecte practice"
            className={`${inputClass} mt-2`}
            required
          />
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="chapter">
          Capitol
        </label>
        <select
          id="chapter"
          value={chapterId}
          onChange={(event) => setChapterId(event.target.value)}
          className={inputClass}
        >
          {chapters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
          <option value={NEW_VALUE}>+ Capitol nou</option>
        </select>
        {chapterId === NEW_VALUE ? (
          <input
            value={chapterTitle}
            onChange={(event) => setChapterTitle(event.target.value)}
            placeholder="Ex: Pandas în practică"
            className={`${inputClass} mt-2`}
            required
          />
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900" htmlFor="title">
          Titlul lecției
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex: Cum citești un CSV cu Pandas"
          className={inputClass}
          required
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900">Reguli de reținut</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Astea apar pe ecran și sunt citite de voce.
        </p>
        <ul className="mt-3 space-y-3">
          {rules.map((rule, index) => (
            <li key={index} className="flex gap-2">
              <textarea
                value={rule}
                onChange={(event) => updateRule(index, event.target.value)}
                rows={2}
                placeholder={`Regula ${index + 1}`}
                className={`${inputClass} resize-y`}
              />
              {rules.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setRules((current) => current.filter((_, i) => i !== index))}
                  className="mt-1 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  aria-label="Șterge regula"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setRules((current) => [...current, ""])}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <Plus className="h-4 w-4" />
          Adaugă regulă
        </button>
      </div>

      {message ? (
        <p className={`text-sm leading-relaxed ${status === "error" ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {status === "saving" ? "Se salvează..." : "Salvează lecția"}
      </button>
    </form>
  );
}
