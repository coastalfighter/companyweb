import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PointerSurfaces, surfacePoint } from "./pointer-surfaces";
import { ScrollRail, railStyles, railTimeline } from "./scroll-rail";
import { ScrollTicker } from "./scroll-ticker";

describe("<ScrollRail />", () => {
  const sections = [
    { id: "hero-title", label: "Intro" },
    { id: "problem-title", label: "The problem" },
  ];

  it("is an 'On this page' nav linking to each section heading", () => {
    render(<ScrollRail sections={sections} />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => [a.textContent, a.getAttribute("href")]),
    ).toEqual([
      ["Intro", "#hero-title"],
      ["The problem", "#problem-title"],
    ]);
  });

  it("names a view timeline per section and hoists the names to the root", () => {
    expect(railStyles(sections)).toBe(
      ':root{timeline-scope:--rail-0,--rail-1}section[aria-labelledby="hero-title"]{view-timeline-name:--rail-0}section[aria-labelledby="problem-title"]{view-timeline-name:--rail-1}',
    );
    const { container } = render(<ScrollRail sections={sections} />);
    const items = container.querySelectorAll<HTMLElement>(".scroll-rail-item");
    expect([...items].map((li) => li.style.getPropertyValue("--rail-timeline"))).toEqual([
      railTimeline(0),
      railTimeline(1),
    ]);
  });

  it("drops ids that aren't plain slugs, so nothing can break out of the CSS", () => {
    const { container } = render(
      <ScrollRail
        sections={[
          { id: 'x"]{}body{display:none}', label: "Bad" },
          { id: "faq-title", label: "FAQ" },
        ]}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(container.querySelector("style")?.textContent).not.toContain("display:none");
  });

  it("renders nothing without sections", () => {
    const { container } = render(<ScrollRail sections={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(railStyles([])).toBe("");
  });
});

describe("<ScrollTicker />", () => {
  it("is decoration only, repeating the words so the band never runs out", () => {
    const { container } = render(<ScrollTicker items={["Accounting", "Legal"]} secondary={["Fast"]} />);
    const band = container.firstElementChild as HTMLElement;
    expect(band).toHaveAttribute("aria-hidden", "true");
    const [forward, back] = band.querySelectorAll(".ticker-row");
    expect(forward?.textContent).toBe("AccountingLegal".repeat(3));
    expect(back?.textContent).toBe("Fast".repeat(3));
  });

  it("reverses the first band when there is no second", () => {
    const { container } = render(<ScrollTicker items={["A", "B"]} />);
    expect(container.querySelectorAll(".ticker-row")[1]?.textContent).toBe("BA".repeat(3));
  });

  it("renders nothing without words", () => {
    const { container } = render(<ScrollTicker items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("surfacePoint", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };

  it("maps the pointer to pixel offsets and a −1…1 tilt vector", () => {
    expect(surfacePoint(rect, 200, 100)).toEqual({ x: 100, y: 50, tx: 0, ty: 0 });
    expect(surfacePoint(rect, 100, 50)).toEqual({ x: 0, y: 0, tx: -1, ty: -1 });
    expect(surfacePoint(rect, 300, 150)).toEqual({ x: 200, y: 100, tx: 1, ty: 1 });
  });

  it("clamps to the card and survives a zero-size box", () => {
    expect(surfacePoint(rect, 900, -40)).toEqual({ x: 200, y: 0, tx: 1, ty: -1 });
    expect(surfacePoint({ left: 0, top: 0, width: 0, height: 0 }, 5, 5)).toEqual({
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
    });
  });
});

describe("<PointerSurfaces />", () => {
  const media = (matches: Record<string, boolean>) =>
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: matches[query] ?? false,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );

  function setup() {
    const { getByTestId, unmount } = render(
      <>
        <PointerSurfaces />
        <div className="surface" data-testid="card">
          <p data-testid="inner">Card</p>
        </div>
        <p data-testid="outside">Outside</p>
      </>,
    );
    const card = getByTestId("card");
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    return { card, inner: getByTestId("inner"), outside: getByTestId("outside"), unmount };
  }

  const move = (target: Element, x: number, y: number, pointerType = "mouse") => {
    const event = new MouseEvent("pointermove", { bubbles: true, clientX: x, clientY: y });
    Object.defineProperty(event, "pointerType", { value: pointerType });
    target.dispatchEvent(event);
  };

  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("writes the pointer position into the card under a fine pointer", () => {
    media({ "(hover: hover) and (pointer: fine)": true });
    const { card, inner, outside } = setup();
    move(inner, 150, 25);
    expect(card).toHaveAttribute("data-surface-active");
    expect(card.style.getPropertyValue("--px")).toBe("150.0px");
    expect(card.style.getPropertyValue("--py")).toBe("25.0px");
    expect(card.style.getPropertyValue("--tx")).toBe("0.500");
    expect(card.style.getPropertyValue("--ty")).toBe("-0.500");

    move(outside, 10, 10);
    expect(card).not.toHaveAttribute("data-surface-active");
    expect(card.style.getPropertyValue("--tx")).toBe("");
  });

  it("ignores touch, coarse pointers and reduced motion", () => {
    media({ "(hover: hover) and (pointer: fine)": true });
    const first = setup();
    move(first.inner, 50, 50, "touch");
    expect(first.card).not.toHaveAttribute("data-surface-active");
    first.unmount();

    vi.restoreAllMocks();
    media({ "(hover: hover) and (pointer: fine)": true, "(prefers-reduced-motion: reduce)": true });
    const second = setup();
    move(second.inner, 50, 50);
    expect(second.card).not.toHaveAttribute("data-surface-active");
    second.unmount();

    vi.restoreAllMocks();
    media({});
    const third = setup();
    move(third.inner, 50, 50);
    expect(third.card).not.toHaveAttribute("data-surface-active");
  });

  it("stops listening when unmounted", () => {
    media({ "(hover: hover) and (pointer: fine)": true });
    const { card, inner, unmount } = setup();
    move(inner, 20, 20);
    expect(card).toHaveAttribute("data-surface-active");
    unmount();
    expect(card).not.toHaveAttribute("data-surface-active");
    move(inner, 30, 30);
    expect(card).not.toHaveAttribute("data-surface-active");
  });
});
