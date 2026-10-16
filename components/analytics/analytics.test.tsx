import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readConsent } from "@/lib/analytics/consent";
import { AnalyticsProvider, ctaLocation, isCtaHref } from "./analytics-provider";

const loadAnalytics = vi.hoisted(() => vi.fn(async () => null));
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics/track", () => ({ loadAnalytics, stopAnalytics: vi.fn(), track }));

beforeEach(() => {
  localStorage.clear();
  loadAnalytics.mockClear();
  track.mockClear();
});
afterEach(() => {
  vi.unstubAllEnvs();
  Object.defineProperty(navigator, "globalPrivacyControl", { value: undefined, configurable: true });
});

describe("<AnalyticsProvider />", () => {
  it("renders nothing when analytics isn't configured", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { container } = render(<AnalyticsProvider />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks once, and loads analytics only after Allow", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    render(<AnalyticsProvider />);
    expect(screen.getByRole("region", { name: "Analytics choice" })).toBeInTheDocument();
    expect(loadAnalytics).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Allow" }));
    expect(readConsent()).toBe("granted");
    expect(screen.queryByRole("region", { name: "Analytics choice" })).not.toBeInTheDocument();
    expect(loadAnalytics).toHaveBeenCalled();
  });

  it("doesn't ask browsers that send Global Privacy Control", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    const { container } = render(<AnalyticsProvider />);
    expect(container).toBeEmptyDOMElement();
    expect(loadAnalytics).not.toHaveBeenCalled();
  });

  it("records CTA clicks with where they happened, after consent", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    localStorage.setItem("akros:consent", "granted");
    render(
      <>
        <AnalyticsProvider />
        <section aria-labelledby="pricing-title">
          <h2 id="pricing-title">Pricing</h2>
          <a href="/contact?service=legal">Book a 20-minute call</a>
          {/* Plain anchors on purpose: the listener sees what the browser sees. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/services">Services</a>
        </section>
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Services" }));
    expect(track).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Book a 20-minute call" }));
    expect(track).toHaveBeenCalledWith("cta_click", {
      location: "pricing-title",
      label: "Book a 20-minute call",
      href: "/contact?service=legal",
    });
  });
});

describe("CTA helpers", () => {
  it("recognises the conversion links only", () => {
    expect(isCtaHref("/contact")).toBe(true);
    expect(isCtaHref("/contact?topic=security")).toBe(true);
    expect(isCtaHref("/resources/back-office-calculator?fn=web")).toBe(true);
    expect(isCtaHref("mailto:hello@akrosstech.com")).toBe(true);
    expect(isCtaHref("/contact/thank-you")).toBe(false);
    expect(isCtaHref("https://evil.example/contact")).toBe(false);
  });

  it("names the place, not the content", () => {
    document.body.innerHTML = `<header><a id="h" href="/contact">x</a></header><section data-cta-zone><a id="s" href="/contact">x</a></section><div><a id="p" href="/contact">x</a></div>`;
    expect(ctaLocation(document.getElementById("h")!)).toBe("header");
    expect(ctaLocation(document.getElementById("s")!)).toBe("closing-slab");
    expect(ctaLocation(document.getElementById("p")!)).toBe("page");
  });
});
