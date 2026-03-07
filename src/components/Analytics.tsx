"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Fire-and-forget: don't block rendering/navigation
    trackPageView(pathname);
  }, [pathname]);

  // This component renders nothing
  return null;
}
