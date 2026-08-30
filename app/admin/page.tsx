import { AddLessonForm } from "@/components/add-lesson-form";
import { getCurriculum } from "@/lib/curriculum";

export default async function AdminPage() {
  const { data } = await getCurriculum();

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <p className="mb-3 text-sm tracking-wide text-gray-400">Administrare</p>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Adaugă lecție
      </h1>
      <p className="mt-3 mb-10 text-lg leading-relaxed text-gray-500">
        Titlu, reguli, Salvează. Vocea se generează automat după insert.
      </p>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AddLessonForm curriculum={data} />
      </div>
    </article>
  );
}
