/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const t: Record<string, string> = {
      "pwa.install.title": "Install CodePrism",
      "pwa.install.body": "Add to your home screen for one-tap access — works offline.",
      "pwa.install.iosTitle": "Add to Home Screen",
      "pwa.install.iosBody": "Tap the Share button, then choose Add to Home Screen.",
      "pwa.install.button": "Install",
      "pwa.install.dismiss": "Dismiss",
    };
    return t[key] ?? key;
  },
}));

import { PwaInstallPrompt } from "./PwaInstallPrompt";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build a stub BeforeInstallPromptEvent with `prompt` + `userChoice`. */
function makeBeforeInstallPromptEvent() {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const userChoice = Promise.resolve({ outcome: "accepted" as const, platform: "web" });
  const event = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  };
  event.prompt = prompt;
  event.userChoice = userChoice;
  return { event, prompt, userChoice };
}

const DISMISS_KEY = "codeprism-install-dismissed";

beforeEach(() => {
  localStorage.clear();
  // Default: not installed, not in standalone mode.
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  // Default: not iOS.
  Object.defineProperty(navigator, "userAgent", {
    value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
    configurable: true,
  });
  // The component sets a 5-second setTimeout to show the prompt. Use fake
  // timers so we can advance them deterministically.
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("PwaInstallPrompt", () => {
  it("renders nothing until beforeinstallprompt fires", () => {
    render(<PwaInstallPrompt />);
    // Advance past the 5s delay to ensure it's truly the event-driven path.
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the toast after beforeinstallprompt fires + 5s delay", () => {
    render(<PwaInstallPrompt />);
    const { event } = makeBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Install CodePrism")).toBeInTheDocument();
  });

  it("clicking Install calls prompt() and hides the toast on accept", async () => {
    render(<PwaInstallPrompt />);
    const { event, prompt, userChoice } = makeBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
      vi.advanceTimersByTime(5000);
    });

    const installBtn = screen.getByRole("button", { name: "Install" });
    await act(async () => {
      fireEvent.click(installBtn);
      await userChoice;
    });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("clicking the dismiss button hides the toast and records the cooldown", () => {
    render(<PwaInstallPrompt />);
    const { event } = makeBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
      vi.advanceTimersByTime(5000);
    });

    const dismissBtn = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(Number(localStorage.getItem(DISMISS_KEY))).toBeGreaterThan(0);
  });

  it("does not show the toast if the user dismissed within the last 7 days", () => {
    // Pre-record a recent dismissal.
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1000 * 60 * 60));

    render(<PwaInstallPrompt />);
    const { event } = makeBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not show the toast if already installed (standalone display mode)", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    render(<PwaInstallPrompt />);
    const { event } = makeBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hides the toast when appinstalled fires", () => {
    render(<PwaInstallPrompt />);
    const { event: beforeEvt } = makeBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(beforeEvt);
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the iOS fallback with the iOS-specific copy and no Install button", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      configurable: true,
    });

    render(<PwaInstallPrompt />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("Add to Home Screen")).toBeInTheDocument();
    expect(screen.getByText(/Share button/)).toBeInTheDocument();
    // No install button on iOS — user uses the Share menu.
    expect(screen.queryByRole("button", { name: "Install" })).toBeNull();
  });

  it("removes its event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<PwaInstallPrompt />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("beforeinstallprompt", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("appinstalled", expect.any(Function));
  });
});
