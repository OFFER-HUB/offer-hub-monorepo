"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/services/analytics';
import { COOKIE_CONSENT_KEY } from '@/constants/storage';

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted") {
      trackPageView(pathname);
    }
  }, [pathname]);

  // This component renders nothing
  return null;
}
