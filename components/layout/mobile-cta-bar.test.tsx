import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileCtaBar } from "./mobile-cta-bar";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  // Flush the rAF-batched update.
  act(() => {
    vi.advanceTimersByTime(20);
  });
}

describe("<MobileCtaBar />", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    vi.useFakeTimers();
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  function bar() {
    return screen.getByRole("link", { name: "Book a call" }).closest("[data-visible]")!;
  }

  it("is hidden (and inert) at the top of the page", () => {
    render(<MobileCtaBar />);
    expect(bar()).toHaveAttribute("data-visible", "false");
    expect(bar()).toHaveAttribute("inert");
  });

  it("appears once the visitor scrolls past the hero", () => {
    render(<MobileCtaBar />);
    scrollTo(900);
    expect(bar()).toHaveAttribute("data-visible", "true");
    expect(bar()).not.toHaveAttribute("inert");
    scrollTo(100);
    expect(bar()).toHaveAttribute("data-visible", "false");
  });

  it("links to both CTAs", () => {
    render(<MobileCtaBar />);
    expect(screen.getByRole("link", { name: "Book a call" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Estimate savings" })).toHaveAttribute(
      "href",
      "/resources/back-office-calculator",
    );
  });

  it("is not rendered on the contact page", () => {
    navigation.pathname = "/contact";
    render(<MobileCtaBar />);
    expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
  });

  it("is not rendered for job seekers", () => {
    for (const path of ["/careers", "/careers/senior-bookkeeper-a1b2c3d4"]) {
      navigation.pathname = path;
      const { unmount } = render(<MobileCtaBar />);
      expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
      unmount();
    }
  });
});

function intersect(cb: IntersectionObserverCallback | undefined, target: Element, isIntersecting: boolean) {
  const entry = { target, isIntersecting } as unknown as IntersectionObserverEntry;
  act(() => cb?.([entry], {} as IntersectionObserver));
}

describe("<MobileCtaBar /> with CTA zones", () => {
  let callback: IntersectionObserverCallback | undefined;

  beforeEach(() => {
    navigation.pathname = "/";
    vi.useFakeTimers();
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
  });

  it("hides while the closing CTA or footer is on screen", () => {
    render(
      <>
        <section data-cta-zone>slab</section>
        <MobileCtaBar />
      </>,
    );
    const zone = screen.getByText("slab");
    scrollTo(1500);
    const bar = screen.getByRole("link", { name: "Book a call" }).closest("[data-visible]")!;
    expect(bar).toHaveAttribute("data-visible", "true");

    intersect(callback, zone, true);
    expect(bar).toHaveAttribute("data-visible", "false");

    intersect(callback, zone, false);
    expect(bar).toHaveAttribute("data-visible", "true");
  });
});
