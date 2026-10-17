import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { countFrame } from "@/components/home/count-up";
import { MotionToggle } from "@/components/layout/motion-toggle";
import { bootScript, markBooted, STORAGE_KEY } from "@/lib/motion/boot";
import { prefersReducedMotion } from "@/lib/motion/gsap";
import {
  hasReducedMotionPref,
  setReducedMotionPref,
  STORAGE_KEY as MOTION_KEY,
} from "@/lib/motion/preference";
import { duration, ease, motionTokens, tilt } from "@/lib/motion/tokens";
import { cursorLabel } from "./custom-cursor";
import { GlitchText } from "./glitch-text";
import { magneticPull } from "./magnetic-field";
import { Marquee } from "./marquee";
import { surfacePoint } from "./pointer-surfaces";
import { READINESS, scrambleGlyph, trackReadiness, whenBooted } from "./preloader";
import { REVEAL_FROM } from "./scroll-reveal";
import { ScrollRail, railStyles, railTimeline } from "./scroll-rail";
import { SectionDivider } from "./section-divider";
import { transitionTarget } from "./route-transition";

const html = document.documentElement;

describe("motion tokens", () => {
  it("keep the brief's numbers", () => {
    // The boot screen lifts on real readiness, within a floor and a ceiling.
    expect(duration.preloaderMin).toBeLessThan(1);
    expect(duration.preloaderMax).toBeLessThanOrEqual(2);
    expect(duration.curtainCover + duration.curtainHalf).toBeLessThanOrEqual(0.6);
    expect(ease.curtain).toBe("power4.inOut");
    expect(ease.entrance).toBe("power3.out");
    expect(tilt.max).toBeLessThanOrEqual(10);
    expect(motionTokens.stagger.base).toBeGreaterThanOrEqual(0.08);
    expect(motionTokens.stagger.base).toBeLessThanOrEqual(0.12);
  });

  it("define the reveal vocabulary: text materializes, cards travel further", () => {
    expect(REVEAL_FROM.text).toMatchObject({ y: 48, opacity: 0, filter: "blur(8px)" });
    expect(REVEAL_FROM.card).toMatchObject({ y: 80, opacity: 0 });
    expect(REVEAL_FROM.fade).toEqual({ opacity: 0 });
  });
});

describe("boot script", () => {
  const run = () => new Function(bootScript)();
  const media = (reduce: boolean) =>
    vi
      .spyOn(window, "matchMedia")
      .mockImplementation(
        (query: string) => ({ matches: query.includes("reduce") ? reduce : false }) as MediaQueryList,
      );

  beforeEach(() => {
    sessionStorage.clear();
    html.removeAttribute("data-motion");
    html.removeAttribute("data-boot");
  });
  afterEach(() => vi.restoreAllMocks());

  it("plays the preloader on the first page of a session only", () => {
    media(false);
    run();
    expect(html.dataset.motion).toBe("on");
    expect(html.dataset.boot).toBe("pending");
    markBooted();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("1");
    html.removeAttribute("data-boot");
    run();
    expect(html.dataset.boot).toBe("done");
  });

  it("never draws it with reduced motion", () => {
    media(true);
    run();
    expect(html.dataset.motion).toBeUndefined();
    expect(html.dataset.boot).toBeUndefined();
  });

  it("whenBooted resolves at once unless the preloader is playing", async () => {
    await expect(whenBooted()).resolves.toBeUndefined();
    html.setAttribute("data-boot", "pending");
    let done = false;
    void whenBooted().then(() => (done = true));
    await Promise.resolve();
    expect(done).toBe(false);
    window.dispatchEvent(new Event("akros:booted"));
    await Promise.resolve();
    expect(done).toBe(true);
  });
});

describe("scrambleGlyph", () => {
  it("never returns the target letter, so every letter visibly locks in", () => {
    for (let i = 0; i < 200; i++) expect(scrambleGlyph("A")).not.toBe("A");
    // A random source that hits the target first still moves on.
    const seq = [0.29, 0.5];
    expect(scrambleGlyph("A", () => seq.shift() ?? 0.9)).not.toBe("A");
  });
});

describe("transitionTarget", () => {
  const location = new URL("/services", window.location.origin) as unknown as Location;
  const click = (anchor: Partial<HTMLAnchorElement> & { href: string }, init: MouseEventInit = {}) => {
    const a = document.createElement("a");
    a.href = anchor.href;
    if (anchor.target) a.target = anchor.target;
    if (anchor.download) a.setAttribute("download", "");
    document.body.append(a);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
    Object.defineProperty(event, "target", { value: a });
    return { event, a };
  };
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("curtains plain clicks on links to another page of this site", () => {
    expect(transitionTarget(click({ href: "/about" }).event, location)?.pathname).toBe("/about");
    expect(transitionTarget(click({ href: "/contact?service=legal#form" }).event, location)?.search).toBe(
      "?service=legal",
    );
  });

  it("leaves everything else to the browser", () => {
    expect(transitionTarget(click({ href: "/services#faq" }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "https://elsewhere.example/" }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "/about", target: "_blank" }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "/about" }, { metaKey: true }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "/about" }, { button: 1 }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "/report.pdf" }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "/api/calculator/report" }).event, location)).toBeNull();
    expect(transitionTarget(click({ href: "mailto:hello@akrosstech.com" }).event, location)).toBeNull();
    const { event } = click({ href: "/about" });
    event.preventDefault();
    expect(transitionTarget(event, location)).toBeNull();
  });
});

describe("cursorLabel", () => {
  it("says View on links, Click on buttons, and honours data-cursor", () => {
    document.body.innerHTML = `
      <a id="a" href="/x"><span id="inner">x</span></a>
      <button id="b">b</button>
      <div data-cursor="Drag"><span id="c">c</span></div>
      <p id="p">p</p>`;
    expect(cursorLabel(document.getElementById("inner")!)).toBe("View");
    expect(cursorLabel(document.getElementById("b")!)).toBe("Click");
    expect(cursorLabel(document.getElementById("c")!)).toBe("Drag");
    expect(cursorLabel(document.getElementById("p")!)).toBe("");
    document.body.innerHTML = "";
  });
});

describe("magneticPull", () => {
  const rect = { left: 100, top: 100, width: 100, height: 40 };

  it("leans toward the pointer within reach, capped at 12px", () => {
    const right = magneticPull(rect, 260, 120);
    expect(right.inside).toBe(true);
    expect(right.x).toBeGreaterThan(0);
    expect(right.x).toBeLessThanOrEqual(12);
    expect(right.y).toBe(0);
    const far = magneticPull(rect, 400, 120);
    expect(far).toEqual({ x: 0, y: 0, inside: false });
    const edge = magneticPull(rect, 279, 120);
    expect(edge.inside).toBe(true);
    expect(Math.abs(magneticPull(rect, 150, -100).y)).toBe(0);
  });

  it("is still at the centre", () => {
    expect(magneticPull(rect, 150, 120)).toMatchObject({ x: 0, y: 0, inside: true });
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

describe("countFrame", () => {
  it("counts the number and keeps its prefix and decimals", () => {
    expect(countFrame("98.6", 0)).toBe("0.0");
    expect(countFrame("98.6", 1)).toBe("98.6");
    expect(countFrame("3h 41", 0.5)).toBe("3h 21");
    expect(countFrame("500", 2)).toBe("500");
    expect(countFrame("n/a", 0.5)).toBe("n/a");
  });
});

describe("<GlitchText />", () => {
  it("copies its text into data-text for the split layers", () => {
    render(<GlitchText text="Rebuilt." as="strong" />);
    const el = screen.getByText("Rebuilt.");
    expect(el.tagName).toBe("STRONG");
    expect(el).toHaveAttribute("data-text", "Rebuilt.");
    expect(el).toHaveClass("glitch");
  });
});

describe("<Marquee />", () => {
  it("is decoration: two identical tracks, hidden from assistive tech", () => {
    const { container } = render(<Marquee items={["WEB DEV", "LEGAL"]} />);
    const band = container.firstElementChild as HTMLElement;
    expect(band).toHaveAttribute("aria-hidden", "true");
    const tracks = band.querySelectorAll(".marquee-band-track");
    expect(tracks).toHaveLength(2);
    expect(tracks[0]?.textContent).toBe("WEB DEVLEGAL");
    expect(tracks[1]?.textContent).toBe(tracks[0]?.textContent);
  });

  it("renders nothing without words", () => {
    const { container } = render(<Marquee items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("<SectionDivider />", () => {
  it("is a drawn line the reveal engine can scrub", () => {
    const { container } = render(<SectionDivider />);
    const line = container.querySelector("line");
    expect(line).toHaveAttribute("data-draw");
    expect(line).toHaveAttribute("pathLength", "1");
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});

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

describe("Reduce motion switch", () => {
  const os = (reduce: boolean) =>
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("reduce") ? reduce : false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    html.removeAttribute("data-motion-pref");
    html.removeAttribute("data-motion");
    html.removeAttribute("data-boot");
  });
  afterEach(() => vi.restoreAllMocks());

  it("is a labelled switch that saves the choice and counts as reduced motion", () => {
    os(false);
    render(<MotionToggle />);
    const toggle = screen.getByRole("switch", { name: "Reduce motion" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    act(() => fireEvent.click(toggle));
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(hasReducedMotionPref()).toBe(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(localStorage.getItem(MOTION_KEY)).toBe("reduced");
    act(() => fireEvent.click(toggle));
    expect(hasReducedMotionPref()).toBe(false);
    expect(localStorage.getItem(MOTION_KEY)).toBeNull();
    expect(html.dataset.motion).toBe("on");
  });

  it("says so, instead of offering a choice, when the device already reduces motion", () => {
    os(true);
    render(<MotionToggle />);
    const toggle = screen.getByRole("switch", { name: "Motion reduced (device setting)" });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("is honoured by the boot script before first paint", () => {
    os(false);
    setReducedMotionPref(true);
    html.removeAttribute("data-motion-pref");
    new Function(bootScript)();
    expect(html.dataset.motionPref).toBe("reduced");
    expect(html.dataset.motion).toBeUndefined();
    expect(html.dataset.boot).toBeUndefined();
  });
});

describe("trackReadiness", () => {
  it("reports fonts, then load, as real stages", async () => {
    const stages: number[] = [];
    await trackReadiness((p) => stages.push(p));
    expect(stages).toEqual([READINESS.fonts, READINESS.load]);
    expect(READINESS.ready).toBe(100);
  });
});
