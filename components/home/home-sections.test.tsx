import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { proof } from "@/content/proof";
import { sampleProof } from "@/content/samples";
import { CalculatorTeaser } from "./calculator-teaser";
import { parseCountable } from "./count-up";
import { FaqSection, faqJsonLd, homeFaqs } from "./faq-section";
import { LogoBar, ProofSection, StatsBand } from "./proof-sections";
import { SecurityBand } from "./security-band";

describe("proof gating", () => {
  it("ships with no unverified proof", () => {
    expect(proof.clientLogos).toHaveLength(0);
    expect(proof.stats).toHaveLength(0);
    expect(proof.testimonials).toHaveLength(0);
    expect(proof.featuredCaseStudy).toBeNull();
    expect(proof.certifications).toEqual({ soc2Type2: false, iso27001: false });
  });

  it("renders nothing for empty proof", () => {
    const { container } = render(
      <>
        <LogoBar />
        <StatsBand />
        <ProofSection />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render a logo bar with too few logos", () => {
    const { container } = render(
      <LogoBar proof={{ ...sampleProof, clientLogos: sampleProof.clientLogos.slice(0, 3) }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders sample proof when it is passed explicitly (preview page)", () => {
    render(
      <>
        <LogoBar proof={sampleProof} />
        <StatsBand proof={sampleProof} />
        <ProofSection proof={sampleProof} />
      </>,
    );
    expect(screen.getByRole("region", { name: "Clients" })).toBeInTheDocument();
    expect(screen.getByText("client retention after year one")).toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Tidemark Health/ })).toHaveAttribute(
      "href",
      "/work/tidemark-health",
    );
  });

  it("only lists certifications that are held", () => {
    const { rerender } = render(<SecurityBand certifications={{ soc2Type2: false, iso27001: false }} />);
    expect(screen.queryByText(/SOC 2/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Request our SOC 2 report" })).not.toBeInTheDocument();
    rerender(<SecurityBand certifications={{ soc2Type2: true, iso27001: false }} />);
    expect(screen.getByText("SOC 2 Type II audited")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request our SOC 2 report" })).toBeInTheDocument();
    expect(screen.queryByText(/27001/)).not.toBeInTheDocument();
  });
});

describe("FAQ", () => {
  it("is a single-open native accordion with the first item open", () => {
    const { container } = render(<FaqSection />);
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(homeFaqs.length);
    items.forEach((item) => expect(item).toHaveAttribute("name", "faq"));
    expect(items[0]).toHaveAttribute("open");
    expect(items[1]).not.toHaveAttribute("open");
  });

  it("emits FAQPage JSON-LD matching the visible questions, with < escaped", () => {
    const json = faqJsonLd([{ id: "x", question: "</script><b>?", answer: "a" }]);
    expect(json).not.toContain("<");
    const parsed = JSON.parse(json);
    expect(parsed["@type"]).toBe("FAQPage");
    expect(parsed.mainEntity[0].name).toBe("</script><b>?");

    const all = JSON.parse(faqJsonLd(homeFaqs));
    expect(all.mainEntity.map((q: { name: string }) => q.name)).toEqual(homeFaqs.map((f) => f.question));
  });
});

describe("<CalculatorTeaser />", () => {
  it("recomputes when the function or hours change, and carries them to the full calculator", () => {
    render(<CalculatorTeaser />);
    const result = () => screen.getByText(/≈/).textContent;
    const initial = result();

    fireEvent.click(screen.getByLabelText("Web"));
    expect(result()).not.toBe(initial);

    fireEvent.change(screen.getByLabelText("Hours per week spent on it"), { target: { value: "40" } });
    // Engineer: 170,000 × 1.3 / 2080 × 40 × 48 = 204,000
    expect(result()).toContain("$204,000");
    expect(screen.getByRole("link", { name: "Get the full breakdown" })).toHaveAttribute(
      "href",
      "/resources/back-office-calculator?fn=web&hours=40",
    );
  });

  it("shows its assumptions", () => {
    render(<CalculatorTeaser />);
    const details = screen.getByText("How we calculate this").closest("details")!;
    expect(within(details).getByText(/controller on a \$145,000 salary, plus 30%/)).toBeInTheDocument();
  });
});

describe("parseCountable", () => {
  it("splits a trailing number from its prefix", () => {
    expect(parseCountable("96")).toEqual({ prefix: "", target: 96, decimals: 0 });
    expect(parseCountable("3h 41")).toEqual({ prefix: "3h ", target: 41, decimals: 0 });
    expect(parseCountable("98.6")).toEqual({ prefix: "", target: 98.6, decimals: 1 });
    expect(parseCountable("n/a")).toBeNull();
  });
});
