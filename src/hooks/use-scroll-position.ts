"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to track scroll position
 * @returns current scroll position in pixels
 */
export const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};
