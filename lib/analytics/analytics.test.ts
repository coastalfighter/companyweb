import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY, readConsent, resetConsent, writeConsent } from "./consent";
import { loadAnalytics, resetAnalyticsForTests, stopAnalytics, track } from "./track";

// The real dynamic import, pointed at a fake: track() loads PostHog on its own.
const mockedPostHog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
  opt_in_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: mockedPostHog }));

function fakePostHog() {
  return {
    init: vi.fn(),
    capture: vi.fn(),
    opt_out_capturing: vi.fn(),
    opt_in_capturing: vi.fn(),
  };
}

beforeEach(() => {
  localStorage.clear();
  resetAnalyticsForTests();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
});
afterEach(() => {
  vi.unstubAllEnvs();
  Object.defineProperty(navigator, "globalPrivacyControl", { value: undefined, configurable: true });
});

describe("consent", () => {
  it("starts unanswered, then remembers the choice", () => {
    expect(readConsent()).toBeNull();
    writeConsent("granted");
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(readConsent()).toBe("granted");
    resetConsent();
    expect(readConsent()).toBeNull();
  });

  it("treats Global Privacy Control as a no, whatever was stored", () => {
    writeConsent("granted");
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    expect(readConsent()).toBe("denied");
  });

  it("ignores junk in storage", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "maybe");
    expect(readConsent()).toBeNull();
  });
});

describe("loadAnalytics", () => {
  it("doesn't load without consent or without a key", async () => {
    const importer = vi.fn();
    await expect(loadAnalytics(importer)).resolves.toBeNull();
    writeConsent("granted");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    await expect(loadAnalytics(importer)).resolves.toBeNull();
    expect(importer).not.toHaveBeenCalled();
  });

  it("initialises PostHog with no cookies, no autocapture, no replay and no remote scripts", async () => {
    writeConsent("granted");
    const posthog = fakePostHog();
    await loadAnalytics(async () => ({ default: posthog }));
    expect(posthog.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        persistence: "localStorage",
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_external_dependency_loading: true,
        person_profiles: "never",
        advanced_disable_flags: true,
        capture_pageview: "history_change",
      }),
    );
  });

  it("loads once, even when asked twice", async () => {
    writeConsent("granted");
    const importer = vi.fn(async () => ({ default: fakePostHog() }));
    await Promise.all([loadAnalytics(importer), loadAnalytics(importer)]);
    expect(importer).toHaveBeenCalledTimes(1);
  });
});

describe("track", () => {
  it("drops events without consent, and never loads the library", async () => {
    mockedPostHog.init.mockClear();
    mockedPostHog.capture.mockClear();
    track("form_start", { form: "contact" });
    writeConsent("denied");
    track("form_start", { form: "contact" });
    await new Promise((r) => setTimeout(r, 0));
    expect(mockedPostHog.init).not.toHaveBeenCalled();
    expect(mockedPostHog.capture).not.toHaveBeenCalled();
  });

  it("queues events fired before the library loads, then sends them in order", async () => {
    mockedPostHog.capture.mockClear();
    writeConsent("granted");
    track("calculator_start", {});
    track("calculator_complete", { functions: 2, has_rate_card: false });
    expect(mockedPostHog.capture).not.toHaveBeenCalled();
    await loadAnalytics();
    expect(mockedPostHog.capture.mock.calls).toEqual([
      ["calculator_start", {}],
      ["calculator_complete", { functions: 2, has_rate_card: false }],
    ]);
  });

  it("stops sending when consent is withdrawn", async () => {
    writeConsent("granted");
    const posthog = fakePostHog();
    await loadAnalytics(async () => ({ default: posthog }));
    stopAnalytics();
    expect(posthog.opt_out_capturing).toHaveBeenCalled();
    writeConsent("denied");
    track("form_submit", { form: "contact", services: 1 });
    expect(posthog.capture).not.toHaveBeenCalled();
  });
});
