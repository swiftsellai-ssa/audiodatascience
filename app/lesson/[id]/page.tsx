import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { VisualBoard } from "@/components/visual-board";
import { getLesson } from "@/lib/curriculum";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const { data, error } = await getLesson(id);

  if (error) {
    return (
      <EmptyState
        title="Lecția nu a putut fi încărcată"
        description={error}
      />
    );
  }

  if (!data) {
    notFound();
  }

  return <VisualBoard lesson={data} />;
}
