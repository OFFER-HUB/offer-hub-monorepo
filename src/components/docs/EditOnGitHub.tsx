import { Pencil } from 'lucide-react';

interface EditOnGitHubProps {
  filePath: string;
}

export function EditOnGitHub({ filePath }: EditOnGitHubProps) {
  const githubEditUrl = `https://github.com/OFFER-HUB/offer-hub-monorepo/edit/main/${filePath}`;

  return (
    <a
      href={githubEditUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-[#6D758F] hover:text-[#149A9B] transition-colors"
    >
      <Pencil size={14} />
      <span>Edit this page on GitHub</span>
    </a>
  );
}
