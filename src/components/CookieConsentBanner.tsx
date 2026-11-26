"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COOKIE_CONSENT_KEY } from "@/constants/storage";
import { COOKIE_PREFERENCES_EVENT } from "@/constants/events";
import { Button } from "@/components/ui/Button";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
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
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-fadeInUp"
    >
      <div className="rounded-3xl bg-bg-elevated shadow-neu-raised px-6 py-5 flex flex-col gap-4">
        <p
          id="cookie-consent-title"
          className="text-xs font-bold uppercase tracking-[0.12em] text-theme-primary"
        >
          Privacy Notice
        </p>

        <p className="text-sm leading-relaxed text-content-secondary">
          We use cookies and analytics to improve your experience. Read our{" "}
          <Link
            href="/privacy"
            className="inline-flex items-center min-h-6 text-theme-primary font-semibold underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          to learn what data is collected and how it is used.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={accept}
            className="min-w-0 flex-1"
          >
            Accept all
          </Button>

          <Button
            type="button"
            onClick={reject}
            variant="secondary"
            className="min-w-0 flex-1"
          >
            Necessary only
          </Button>
        </div>
      </div>
    </div>
  );
}
