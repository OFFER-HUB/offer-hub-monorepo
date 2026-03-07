import { getSidebarNav } from "@/lib/mdx";
import { DocsLayoutShell } from "@/components/docs/DocsLayoutShell";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = getSidebarNav();

  return <DocsLayoutShell nav={nav}>{children}</DocsLayoutShell>;
}
