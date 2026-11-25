import { UseCaseLayout } from "@/components/use-cases/UseCaseLayout";
import { DEFAULT_USE_CASE_ID } from "@/components/use-cases/data";

/**
 * `/use-cases` opens the first vertical. Legacy `?vertical=` links are
 * upgraded to their shareable path URL by `UseCaseLayout`.
 */
export default function UseCasesPage() {
  return <UseCaseLayout vertical={DEFAULT_USE_CASE_ID} />;
}
