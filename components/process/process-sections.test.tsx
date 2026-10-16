import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { guarantees, pendingGuarantees, phases, processFaqs } from "@/content/process";
import { measure, PhaseTracker } from "./phase-tracker";
import { ArtifactsGallery, GuaranteesSection, PhaseSection, ProcessHero } from "./process-sections";

describe("process content", () => {
  it("has five phases with unique ids", () => {
    expect(phases).toHaveLength(5);
    expect(new Set(phases.map((p) => p.id)).size).toBe(5);
  });

  it("never publishes a guarantee that is still pending sign-off", () => {
    const pending = new Set(pendingGuarantees.map((g) => g.id));
    expect(guarantees.some((g) => pending.has(g.id))).toBe(false);
  });

  it("has unique FAQ ids", () => {
    expect(new Set(processFaqs.map((f) => f.id)).size).toBe(processFaqs.length);
  });
});

describe("measure", () => {
  const tops = [100, 900, 1700, 2500, 3300];

  it("picks the last phase above the reading line", () => {
    expect(measure(tops, { top: 100, height: 4000 }, 360).current).toBe(0);
    expect(
      measure(
        tops.map((t) => t - 1000),
        { top: -900, height: 4000 },
        360,
      ).current,
    ).toBe(1);
    expect(
      measure(
        tops.map((t) => t - 3000),
        { top: -2900, height: 4000 },
        360,
      ).current,
    ).toBe(4);
  });

  it("clamps progress to 0–1", () => {
    expect(measure(tops, { top: 2000, height: 4000 }, 360).progress).toBe(0);
    expect(measure(tops, { top: -9000, height: 4000 }, 360).progress).toBe(1);
    expect(measure(tops, { top: -1640, height: 4000 }, 360).progress).toBeCloseTo(0.5);
    expect(measure(tops, { top: 0, height: 0 }, 360).progress).toBe(0);
  });
});

describe("ProcessHero", () => {
  it("links each rail node to its phase", () => {
    render(<ProcessHero />);
    const rail = screen.getByRole("navigation", { name: "The five phases" });
    const links = within(rail).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(phases.map((p) => `#phase-${p.id}`));
  });
});

describe("PhaseSection", () => {
  it("renders an article per phase with what you get and what you do", () => {
    render(<PhaseSection />);
    for (const phase of phases) {
      const article = screen.getByRole("article", { name: phase.name });
      expect(article).toHaveAttribute("id", `phase-${phase.id}`);
      expect(within(article).getByText(phase.youGet)).toBeInTheDocument();
      expect(within(article).getByText(phase.youDo)).toBeInTheDocument();
    }
  });

  it("marks the first phase current before any scroll", () => {
    render(<PhaseTracker phases={phases} containerId="missing" />);
    const current = screen.getAllByRole("link", { current: "step" });
    // One in the desktop column, one in the mobile stepper.
    expect(current).toHaveLength(2);
    current.forEach((link) => expect(link).toHaveAttribute("href", `#phase-${phases[0]!.id}`));
  });
});

describe("ArtifactsGallery", () => {
  it("opens an illustrative, labelled preview for each document", () => {
    render(<ArtifactsGallery />);
    const triggers = screen.getAllByRole("button", { name: /^Preview the / });
    expect(triggers).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Preview the Operating Brief" }));
    const dialog = screen.getByRole("dialog", { name: "Operating Brief (example)" });
    expect(within(dialog).getByText(/illustrative/)).toBeInTheDocument();
    expect(within(dialog).getAllByText("redacted").length).toBeGreaterThan(0);
  });
});

describe("GuaranteesSection", () => {
  it("renders only signed-off guarantees by default", () => {
    render(<GuaranteesSection />);
    for (const g of guarantees) expect(screen.getByRole("heading", { name: g.title })).toBeInTheDocument();
    for (const g of pendingGuarantees) expect(screen.queryByText(g.title)).not.toBeInTheDocument();
  });

  it("renders nothing with no guarantees", () => {
    const { container } = render(<GuaranteesSection items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
