"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "cookie_consent";
const COOKIE_PREFERENCES_EVENT = "cookie-preferences-open";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }

    const handleOpenPreferences = () => {
      setVisible(true);
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, handleOpenPreferences);

    return () => {
      window.removeEventListener(
        COOKIE_PREFERENCES_EVENT,
        handleOpenPreferences
      );
    };
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-fadeInUp"
    >
      <div className="rounded-3xl bg-bg-elevated shadow-neu-raised px-6 py-5 flex flex-col gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-primary">
          Privacy Notice
        </p>

        <p className="text-sm leading-relaxed text-content-secondary">
          We use cookies and analytics to improve your experience. Read our{" "}
          <Link
            href="/privacy"
            className="text-theme-primary font-semibold underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          to learn what data is collected and how it is used.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={accept}
            className="flex-1 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-black uppercase tracking-wider shadow-lg hover:bg-theme-primary-hover transition-colors"
          >
            Accept all
          </button>

          <button
            type="button"
            onClick={reject}
            className="flex-1 py-2.5 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle text-content-secondary text-xs font-black uppercase tracking-wider hover:text-content-primary transition-colors"
          >
            Necessary only
          </button>
        </div>
      </div>
    </div>
  );
}