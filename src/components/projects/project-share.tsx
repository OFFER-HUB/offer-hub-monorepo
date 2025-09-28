import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/copy-button';

interface ProjectShareProps {
  projectId: string;
  projectTitle: string;
  className?: string;
}

export function ProjectShare({ projectId, projectTitle, className }: ProjectShareProps) {
  const projectUrl = `${window.location.origin}/projects/${projectId}`;
  const shareText = `Check out this project: ${projectTitle} - ${projectUrl}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Share Project
      </Button>
      <CopyButton text={shareText} />
    </div>
  );
}
