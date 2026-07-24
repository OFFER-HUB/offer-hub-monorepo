import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { FloatingCTA } from "../FloatingCTA";

const push = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push }),
}));

import { CTA_DISMISSED_KEY } from "@/constants/storage";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe("FloatingCTA", () => {
  beforeEach(() => {
    pathname = "/";
    push.mockClear();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays hidden while the dismiss flag is within its TTL", async () => {
    localStorage.setItem(CTA_DISMISSED_KEY, Date.now().toString());
    render(<FloatingCTA />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });

    expect(screen.queryByText(/join the waitlist/i)).not.toBeInTheDocument();
  });

  it("becomes visible again once the dismiss TTL has expired", async () => {
    localStorage.setItem(CTA_DISMISSED_KEY, (Date.now() - SEVEN_DAYS_MS - 1000).toString());
    render(<FloatingCTA />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });

    expect(screen.getByText(/join the waitlist/i)).toBeInTheDocument();
    expect(localStorage.getItem(CTA_DISMISSED_KEY)).toBeNull();
  });

  it("shows the CTA when the page loads with no dismiss flag set", async () => {
    render(<FloatingCTA />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(screen.getByText(/join the waitlist/i)).toBeInTheDocument();
  });

  it("sets the localStorage dismiss flag when the dismiss button is clicked", async () => {
    render(<FloatingCTA />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    const dismissButton = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(localStorage.getItem(CTA_DISMISSED_KEY)).not.toBeNull();
  });
});
