import { useCallback, useRef, useEffect, KeyboardEvent } from 'react';

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onHome,
  onEnd,
  onTab,
  preventDefault = true,
  enabled = true
}: UseKeyboardNavigationOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const keyHandlers: { [key: string]: () => void } = {
      Escape: onEscape || (() => {}),
      Enter: onEnter || (() => {}),
      ArrowUp: onArrowUp || (() => {}),
      ArrowDown: onArrowDown || (() => {}),
      ArrowLeft: onArrowLeft || (() => {}),
      ArrowRight: onArrowRight || (() => {}),
      Home: onHome || (() => {}),
      End: onEnd || (() => {})
    };

    const handler = keyHandlers[e.key];
    if (handler) {
      if (preventDefault) {
        e.preventDefault();
      }
      handler();
    }

    // Handle Tab separately as it might need special handling
    if (e.key === 'Tab' && onTab) {
      onTab(e);
    }
  }, [
    enabled,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    preventDefault
  ]);

  return {
    elementRef,
    handleKeyDown
  };
}

interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusRef?: React.RefObject<HTMLElement>;
}

export function useFocusTrap({
  enabled = true,
  initialFocusRef,
  returnFocusRef
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [enabled, getFocusableElements]);

  useEffect(() => {
    if (!enabled) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the initial element or first focusable element
    const focusInitialElement = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Use setTimeout to ensure the element is rendered
    const timeoutId = setTimeout(focusInitialElement, 100);

    return () => {
      clearTimeout(timeoutId);
      // Return focus to the previously focused element
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, initialFocusRef, returnFocusRef, getFocusableElements]);

  return {
    containerRef,
    handleKeyDown
  };
}

interface UseArrowNavigationOptions {
  items: any[];
  onSelect?: (item: any, index: number) => void;
  onNavigate?: (index: number) => void;
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function useArrowNavigation({
  items,
  onSelect,
  onNavigate,
  enabled = true,
  loop = true,
  orientation = 'vertical'
}: UseArrowNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || items.length === 0) return;

    const isVertical = orientation === 'vertical';
    const isArrowUp = isVertical && e.key === 'ArrowUp';
    const isArrowDown = isVertical && e.key === 'ArrowDown';
    const isArrowLeft = !isVertical && e.key === 'ArrowLeft';
    const isArrowRight = !isVertical && e.key === 'ArrowRight';

    if (isArrowUp || isArrowLeft) {
      e.preventDefault();
      setFocusedIndex(prev => {
        const newIndex = prev <= 0 ? (loop ? items.length - 1 : 0) : prev - 1;
        onNavigate?.(newIndex);
        return newIndex;
      });
    } else if (isArrowDown || isArrowRight) {
      e.preventDefault();
      setFocusedIndex(prev => {
        const newIndex = prev >= items.length - 1 ? (loop ? 0 : items.length - 1) : prev + 1;
        onNavigate?.(newIndex);
        return newIndex;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < items.length) {
        onSelect?.(items[focusedIndex], focusedIndex);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      onNavigate?.(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = items.length - 1;
      setFocusedIndex(lastIndex);
      onNavigate?.(lastIndex);
    }
  }, [enabled, items, focusedIndex, onSelect, onNavigate, loop, orientation]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown
  };
}

// Re-export useState for convenience
import { useState } from 'react';
export { useState };
