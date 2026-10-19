import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { serviceContent } from "@/content/services";
import { glyphCount } from "@/lib/motion/hero-math";
import { BuildVisual, CODE } from "./build-visual";
import { headlineWords, ServiceHeroFrame } from "./hero-frame";
import { BARS, CLOSE_STEPS, FIGURES, LedgerVisual, trendPath } from "./ledger-visual";
import { connectorPath, PipelineVisual, STAGES } from "./pipeline-visual";
import { SEAL_TEXT, SealVisual } from "./seal-visual";
import { cardFit, SwarmVisual, TASKS } from "./swarm-visual";

// The static markup is the contract (reduced motion, no-JS, first paint); GSAP is not under test here.
vi.mock("@/lib/motion/use-gsap", () => ({ useGsap: () => {}, useReducedMotion: () => false }));

describe("ServiceHeroFrame", () => {
  const props = {
    breadcrumb: [
      { label: "Services", href: "/services" },
      { label: "Legal Assistance", href: "/services/legal" },
    ],
    eyebrow: "05 · Legal Assistance",
    title: "Compliant. Protected. Moving.",
    subtitle: "Contracts, compliance, and legal ops, handled in the background.",
    primary: { label: "Book a legal ops scoping call", href: "/contact?service=legal" },
    secondary: { label: "Our legal stack", href: "#tools-title" },
    note: "Akrostech is not a law firm.",
    visual: <div aria-hidden data-testid="visual" />,
  };

  it("renders one labelled H1, both CTAs and the note", () => {
    render(<ServiceHeroFrame {...props} layout="split-reverse" headline="serif" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAccessibleName("Compliant. Protected. Moving.");
    expect(h1.closest("section")).toHaveAttribute("aria-labelledby", "service-title");
    expect(h1).toHaveClass("font-serif-legal");
    expect(screen.getByRole("link", { name: "Book a legal ops scoping call" })).toHaveAttribute(
      "href",
      "/contact?service=legal",
    );
    expect(screen.getByRole("link", { name: "Our legal stack" })).toHaveAttribute("href", "#tools-title");
    expect(screen.getByText("Akrostech is not a law firm.")).toBeInTheDocument();
  });

  it("never hides the copy behind the entrance, only the visual", () => {
    render(<ServiceHeroFrame {...props} layout="split-reverse" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.closest(".hero-enter")).toBeNull();
    expect(screen.getByTestId("visual").parentElement).toHaveClass("hero-enter");
  });

  it("adds the scan line and ledger rules only for those treatments", () => {
    const { container, rerender } = render(<ServiceHeroFrame {...props} headline="scan" />);
    expect(container.querySelector(".hero-scan")).not.toBeNull();
    expect(container.querySelector(".ledger-rule")).toBeNull();
    rerender(<ServiceHeroFrame {...props} headline="ledger" />);
    expect(container.querySelectorAll(".ledger-rule")).toHaveLength(1);
    expect(container.querySelector(".hero-scan")).toBeNull();
  });

  it("splits headlines into words", () => {
    expect(headlineWords("  We Ship.  Fast. ")).toEqual(["We", "Ship.", "Fast."]);
  });
});

describe("service hero visuals", () => {
  it("are all decorative", () => {
    for (const Visual of [BuildVisual, PipelineVisual, SwarmVisual, LedgerVisual, SealVisual]) {
      const { container, unmount } = render(<Visual />);
      expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
      unmount();
    }
  });

  it("The Build: code fits a 320px screen and each line knows its glyph count", () => {
    for (const line of CODE) expect(glyphCount(line)).toBeLessThanOrEqual(38);
    const { container } = render(<BuildVisual />);
    const lines = container.querySelectorAll<HTMLElement>(".code-line");
    expect(lines).toHaveLength(CODE.length);
    expect(lines[1]!.dataset.glyphs).toBe(String(glyphCount(CODE[1]!)));
    expect(container.querySelectorAll(".wire-shape").length).toBeGreaterThan(3);
  });

  it("The Pipeline: labelled as an example, narrowing stage by stage", () => {
    const { container } = render(<PipelineVisual />);
    expect(container).toHaveTextContent("Example");
    expect(container.querySelectorAll(".pipe-node")).toHaveLength(STAGES.length);
    expect(container.querySelectorAll(".pipe-link")).toHaveLength(STAGES.length - 1);
    const counts = STAGES.map((s) => s.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    expect(connectorPath({ x: 0, y: 0 }, { x: 10, y: 20 })).toBe("M0 0 C5 0 5 20 10 20");
  });

  it("The Swarm: one card per task, resting positions in CSS", () => {
    const { container } = render(<SwarmVisual />);
    const cards = container.querySelectorAll<HTMLElement>(".swarm-card");
    expect(cards).toHaveLength(TASKS.length);
    expect(cards[0]!.style.getPropertyValue("--ox")).not.toBe("");
    expect(new Set([...cards].map((c) => c.dataset.depth)).size).toBeGreaterThan(1);
    expect(cardFit(1200)).toBe(1);
    expect(cardFit(480)).toBe(0.75);
    expect(cardFit(200)).toBe(0.72);
  });

  it("The Ledger: illustrative figures, finished state in the markup", () => {
    const { container } = render(<LedgerVisual />);
    expect(container).toHaveTextContent("Illustrative");
    expect(container).toHaveTextContent("128,400");
    const net = FIGURES.find((f) => f.label === "Net")!.value;
    expect(FIGURES[0].value - FIGURES[1].value).toBe(net);
    expect(container.querySelectorAll(".ledger-bar")).toHaveLength(BARS.length);
    expect(container.querySelectorAll(".ledger-step[data-done]")).toHaveLength(CLOSE_STEPS.length);
    expect(trendPath([0, 1])).toMatch(/^M\d+(\.\d)? 100\.0 L\d+(\.\d)? 4\.0$/);
  });

  it("The Seal: never claims legal approval", () => {
    expect(SEAL_TEXT).not.toMatch(/approved|certified|legal advice|guarantee/i);
    const { container } = render(<SealVisual />);
    expect(container.querySelector("textPath")).toHaveTextContent(SEAL_TEXT.trim());
  });
});

describe("service hero copy", () => {
  it("each service has a real secondary destination", () => {
    for (const content of Object.values(serviceContent)) {
      const { href } = content.hero.secondary;
      expect(href === "/pricing" || href.startsWith("#") || href.startsWith("/services")).toBe(true);
    }
  });
});
