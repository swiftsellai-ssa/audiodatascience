import { EmptyState } from "@/components/empty-state";

export default function LessonNotFound() {
  return (
    <EmptyState
      title="Lecția nu există"
      description="Subcapitolul selectat nu a fost găsit. Alege altă lecție din meniu."
    />
  );
}
