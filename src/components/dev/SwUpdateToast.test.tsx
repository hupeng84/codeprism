/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next-intl so we can use raw key → string lookups without a provider.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "swUpdate.title": "New version available",
      "swUpdate.body": "Reload to get the latest features and fixes.",
      "swUpdate.update": "Update",
      "swUpdate.dismiss": "Dismiss",
    };
    return translations[key] ?? key;
  },
}));

import { SwUpdateToast } from "./SwUpdateToast";

// Helper: build a fake SW environment where a waiting worker exists.
function installMockServiceWorker() {
  const postMessage = vi.fn();
  const waitingWorker = { postMessage, state: "installed" } as unknown as ServiceWorker;
  const registration = {
    waiting: waitingWorker,
    active: {} as ServiceWorker,
    installing: null,
  } as unknown as ServiceWorkerRegistration;

  Object.defineProperty(navigator, "serviceWorker", {
    value: {
      getRegistration: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
      controller: {} as ServiceWorker,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    configurable: true,
    writable: true,
  });

  return { postMessage, registration, waitingWorker };
}

describe("SwUpdateToast", () => {
  beforeEach(() => {
    // Component is production-only — stub env so the effect actually runs.
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    // Clean up the mocked navigator.serviceWorker so the next test starts fresh.
    // jsdom doesn't ship one by default; deleting the property restores that.
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
  });

  it("renders nothing in non-production env (dev/test)", () => {
    vi.stubEnv("NODE_ENV", "test");
    const { container } = render(<SwUpdateToast />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when navigator.serviceWorker is unavailable", () => {
    // jsdom has no serviceWorker by default — no toast should appear.
    const { container } = render(<SwUpdateToast />);
    expect(container.firstChild).toBeNull();
  });

  it("shows toast when a waiting worker is detected", async () => {
    installMockServiceWorker();
    render(<SwUpdateToast />);

    const updateBtn = await screen.findByRole("button", { name: "Update" });
    expect(updateBtn).toBeInTheDocument();
    expect(screen.getByText("New version available")).toBeInTheDocument();
  });

  it("posts SKIP_WAITING to the waiting worker when Update is clicked", async () => {
    const { postMessage } = installMockServiceWorker();
    render(<SwUpdateToast />);

    const updateBtn = await screen.findByRole("button", { name: "Update" });
    fireEvent.click(updateBtn);

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith("SKIP_WAITING");
  });

  it("dismisses the toast without posting SKIP_WAITING", async () => {
    const { postMessage } = installMockServiceWorker();
    render(<SwUpdateToast />);

    const dismissBtn = await screen.findByRole("button", { name: "Dismiss" });
    fireEvent.click(dismissBtn);

    expect(postMessage).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Update" })).not.toBeInTheDocument();
  });
});
