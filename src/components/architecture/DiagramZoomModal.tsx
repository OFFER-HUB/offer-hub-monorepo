"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function DiagramZoomModal({ title, isOpen, onClose, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-bg-base)]/90 backdrop-blur-sm p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 flex flex-col p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-content-muted">
                {title}
              </span>
              <button
                onClick={onClose}
                className="rounded-2xl bg-bg-base shadow-neu-raised-sm p-2.5 hover:shadow-neu-sunken transition-all text-content-secondary hover:text-content-primary"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 w-full rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 overflow-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
