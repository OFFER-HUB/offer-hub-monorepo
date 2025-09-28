import { useState } from 'react';

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

export function useClipboard(): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return { copied, copy };
}
