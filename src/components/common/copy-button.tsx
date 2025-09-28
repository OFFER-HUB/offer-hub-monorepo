import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CopyButton({ text, className, size = 'sm' }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  const handleCopy = () => {
    copy(text);
  };

  const sizeClasses = {
    sm: 'h-8 px-2',
    md: 'h-10 px-3',
    lg: 'h-12 px-4'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`${sizeClasses[size]} ${className}`}
    >
      {copied ? (
        <Check className="h-4 w-4 mr-2 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 mr-2" />
      )}
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}
