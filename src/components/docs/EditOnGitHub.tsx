import { Pencil } from 'lucide-react';
import { DOCS_EDIT_BASE } from '@/constants/github';

interface EditOnGitHubProps {
  filePath: string;
}

export function EditOnGitHub({ filePath }: EditOnGitHubProps) {
  const githubEditUrl = `${DOCS_EDIT_BASE}/${filePath}`;

  return (
    <a
      href={githubEditUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-theme-primary transition-colors"
    >
      <Pencil size={14} />
      <span>Edit this page on GitHub</span>
    </a>
  );
}
