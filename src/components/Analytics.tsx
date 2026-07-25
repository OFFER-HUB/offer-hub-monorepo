"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/services/analytics';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (localStorage.getItem("cookie_consent") === "accepted") {
      trackPageView(pathname);
    }
  }, [pathname]);

  // This component renders nothing
  return null;
}
