"use client";

import React from 'react';
import { useScrollPosition } from '../../hooks/use-scroll-position';

/**
 * Scroll to top button component
 * Shows when user has scrolled down more than 300px
 */
export const ScrollToTop: React.FC = () => {
  const scrollPosition = useScrollPosition();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (scrollPosition < 300) return null;

  return (
    <button
      onClick={handleScrollToTop}
      className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};
