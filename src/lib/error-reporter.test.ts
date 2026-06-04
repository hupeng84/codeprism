/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./analytics", () => ({
  getConsent: vi.fn(() => "granted"),
  isDNTEnabled: vi.fn(() => false),
  track: vi.fn(),
}));

import { getConsent, isDNTEnabled, track } from "./analytics";
import {
  reportError,
  configureErrorReporting,
  installGlobalErrorHandlers,
  sentryTransport,
  parseStackTrace,
} from "./error-reporter";

// ── reportError ─────────────────────────────────────────────────────────

describe("reportError", () => {
  beforeEach(() => {
    vi.mocked(getConsent).mockReturnValue("granted");
    vi.mocked(isDNTEnabled).mockReturnValue(false);
  });

  it("invokes the configured transport with the error and context", () => {
    const transport = vi.fn();
    configureErrorReporting({ transport });
    const error = new Error("test error");
    const context = { tags: { source: "manual" } };

    reportError(error, context);

    expect(transport).toHaveBeenCalledWith(error, context);
  });

  it("wraps a string in an Error", () => {
    const transport = vi.fn();
    configureErrorReporting({ transport });

    reportError("oops");

    const calledError = transport.mock.calls[0]?.[0];
    expect(calledError).toBeInstanceOf(Error);
    expect(calledError.message).toBe("oops");
  });

  it("does not throw when the transport throws", () => {
    configureErrorReporting({
      transport: () => {
        throw new Error("boom");
      },
    });
    expect(() => reportError("test")).not.toThrow();
  });

  it("is a noop when consent is denied", () => {
    vi.mocked(getConsent).mockReturnValue("denied");
    const transport = vi.fn();
    configureErrorReporting({ transport });

    reportError("test");

    expect(transport).not.toHaveBeenCalled();
  });

  it("is a noop when DNT is enabled", () => {
    vi.mocked(isDNTEnabled).mockReturnValue(true);
    const transport = vi.fn();
    configureErrorReporting({ transport });

    reportError("test");

    expect(transport).not.toHaveBeenCalled();
  });

  it("also tracks in analytics when fired", () => {
    const transport = vi.fn();
    configureErrorReporting({ transport });

    const err = new Error("tracked");
    reportError(err);

    expect(track).toHaveBeenCalledWith({
      type: "error",
      message: "tracked",
      stack: err.stack,
    });
  });
});

// ── sentryTransport ─────────────────────────────────────────────────────

describe("sentryTransport", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs to the Sentry store endpoint with the correct auth header", async () => {
    const transport = sentryTransport("https://abc123@sentry.io/123456");
    const error = new Error("something broke");

    await transport(error, { tags: { source: "test" } });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sentry.io/api/123456/store/");
    expect(options.method).toBe("POST");
    const auth = (options.headers as Record<string, string>)["X-Sentry-Auth"];
    expect(auth).toContain("sentry_key=abc123");
    expect(auth).toContain("sentry_version=7");
    expect(auth).toContain("sentry_client=codeprism/");
  });

  it("includes the error message and parsed stack trace in the payload", async () => {
    const transport = sentryTransport("https://abc@sentry.io/1");
    const error = new Error("oops");
    error.stack = "Error: oops\n    at foo (app.js:10:5)";

    await transport(error);

    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body.exception.values[0].value).toBe("oops");
    // `toMatchObject` allows extra fields (like `abs_path` added for
    // source-map support) without having to enumerate them in every test.
    expect(body.exception.values[0].stacktrace.frames).toMatchObject([
      { function: "foo", filename: "app.js", lineno: 10, colno: 5 },
    ]);
  });

  it("includes tags, extra, and user from context", async () => {
    const transport = sentryTransport("https://abc@sentry.io/1");

    await transport(new Error("x"), {
      tags: { source: "react" },
      extra: { componentStack: "at Foo" },
      user: { id: "user-123" },
    });

    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body.tags).toEqual({ source: "react" });
    expect(body.extra).toEqual({ componentStack: "at Foo" });
    expect(body.user).toEqual({ id: "user-123" });
  });

  it("includes url in the request section when provided", async () => {
    const transport = sentryTransport("https://abc@sentry.io/1");
    await transport(new Error("x"), { url: "/some/page" });
    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body.request).toEqual({ url: "/some/page" });
  });

  it("uses release and environment from options", async () => {
    const transport = sentryTransport("https://abc@sentry.io/1", {
      release: "1.2.3",
      environment: "staging",
    });

    await transport(new Error("x"));

    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body.release).toBe("1.2.3");
    expect(body.environment).toBe("staging");
  });

  it("does not throw when fetch fails", async () => {
    fetchSpy.mockRejectedValue(new Error("network"));
    const transport = sentryTransport("https://abc@sentry.io/1");

    await expect(transport(new Error("x"))).resolves.toBeUndefined();
  });

  it("throws on an invalid DSN at construction time", () => {
    expect(() => sentryTransport("not a dsn")).toThrow();
  });

  it("generates a 32-char hex event_id", async () => {
    const transport = sentryTransport("https://abc@sentry.io/1");
    await transport(new Error("x"));
    const body = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
    expect(body.event_id).toMatch(/^[a-f0-9]{32}$/);
  });
});

// ── parseStackTrace ─────────────────────────────────────────────────────

describe("parseStackTrace", () => {
  it("parses V8 stack frames", () => {
    const stack = `Error: test
    at foo (app.js:10:5)
    at bar (app.js:20:10)
    at app.js:1:1`;
    const result = parseStackTrace(stack);
    expect(result?.frames).toHaveLength(3);
    // Reversed to oldest-first.
    expect(result?.frames[0]?.filename).toBe("app.js");
    expect(result?.frames[0]?.lineno).toBe(1);
    expect(result?.frames[1]?.function).toBe("bar");
    expect(result?.frames[1]?.lineno).toBe(20);
    expect(result?.frames[2]?.function).toBe("foo");
    expect(result?.frames[2]?.lineno).toBe(10);
  });

  it("handles frames with no function name", () => {
    const stack = `Error: test\n    at app.js:1:1`;
    const result = parseStackTrace(stack);
    expect(result?.frames[0]?.function).toBe("?");
  });

  it("returns undefined for empty/undefined input", () => {
    expect(parseStackTrace(undefined)).toBeUndefined();
    expect(parseStackTrace("")).toBeUndefined();
    expect(parseStackTrace("Error: no stack here")).toBeUndefined();
  });
});

// ── generateEventId (tested indirectly via sentryTransport payload) ───

// ── installGlobalErrorHandlers ──────────────────────────────────────────

describe("installGlobalErrorHandlers", () => {
  beforeEach(() => {
    vi.mocked(getConsent).mockReturnValue("granted");
    vi.mocked(isDNTEnabled).mockReturnValue(false);
  });

  // jsdom's default `error` listener throws on uncaught errors, which
  // pollutes other tests. Suppress it for the duration of these tests.
  const stopJsdomErrorThrow = () => {
    const handler = () => {
      // prevent jsdom from throwing
    };
    window.addEventListener("error", handler, { capture: true });
    return () => window.removeEventListener("error", handler, { capture: true });
  };

  it("reports uncaught window errors", () => {
    const stop = stopJsdomErrorThrow();
    const transport = vi.fn();
    configureErrorReporting({ transport });

    const teardown = installGlobalErrorHandlers();

    const error = new Error("uncaught");
    window.dispatchEvent(
      new ErrorEvent("error", { error, message: "uncaught", filename: "app.js", lineno: 42 }),
    );

    expect(transport).toHaveBeenCalled();
    const [calledError, context] = transport.mock.calls[0] as [
      Error,
      { tags?: Record<string, string> },
    ];
    expect(calledError.message).toBe("uncaught");
    expect(context.tags?.source).toBe("window.error");

    teardown();
    stop();
  });

  it("reports unhandled promise rejections", () => {
    const stop = stopJsdomErrorThrow();
    const transport = vi.fn();
    configureErrorReporting({ transport });

    const teardown = installGlobalErrorHandlers();

    // jsdom's PromiseRejectionEvent constructor doesn't carry `reason` as
    // a constructor arg in older versions, so we build a plain Event and
    // attach `reason` directly (matches the DOM spec property).
    const reason = new Error("promise rejected");
    const event = new Event("unhandledrejection");
    (event as { reason?: unknown }).reason = reason;
    window.dispatchEvent(event);

    expect(transport).toHaveBeenCalled();
    const [calledError, context] = transport.mock.calls[0] as [
      Error,
      { tags?: Record<string, string> },
    ];
    expect(calledError.message).toBe("promise rejected");
    expect(context.tags?.source).toBe("unhandledrejection");

    teardown();
    stop();
  });

  it("wraps a non-Error rejection reason in an Error", () => {
    const stop = stopJsdomErrorThrow();
    const transport = vi.fn();
    configureErrorReporting({ transport });

    const teardown = installGlobalErrorHandlers();

    const event = new Event("unhandledrejection");
    (event as { reason?: unknown }).reason = "string reason";
    window.dispatchEvent(event);

    const [calledError] = transport.mock.calls[0] as [Error];
    expect(calledError).toBeInstanceOf(Error);
    expect(calledError.message).toBe("string reason");

    teardown();
    stop();
  });

  it("teardown removes the listeners", () => {
    const stop = stopJsdomErrorThrow();
    const transport = vi.fn();
    configureErrorReporting({ transport });

    const teardown = installGlobalErrorHandlers();
    teardown();

    // Suppress jsdom's default "throw on uncaught error" so the test
    // can dispatch without polluting the test runner.
    window.dispatchEvent(
      new ErrorEvent("error", { error: new Error("after teardown") }),
    );

    expect(transport).not.toHaveBeenCalled();
    stop();
  });
});
