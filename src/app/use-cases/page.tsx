// Server Component — no "use client" directive needed here.
// All interactive logic (hooks, scroll, IntersectionObserver, window events)
// lives in UseCasesClient which declares its own "use client" boundary.
import UseCasesClient from "@/components/use-cases/UseCasesClient";

export default function UseCasesPage() {
  return <UseCasesClient />;
}