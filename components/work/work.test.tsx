import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  caseStudies,
  getCaseStudy,
  industriesOf,
  relatedCaseStudies,
  sortCaseStudies,
} from "@/content/case-studies";
import { sampleCaseStudies } from "@/content/samples";
import { applyWorkFilter, NO_FILTER, parseWorkFilter, workFilterHref } from "@/lib/work/filter";
import { CaseStudyArticle } from "./case-study-article";
import { CaseStudyCard } from "./case-study-card";
import { WorkIndex } from "./work-index";

const nav = vi.hoisted(() => ({
  search: "",
  pathname: "/work",
  replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.search),
  usePathname: () => nav.pathname,
  useRouter: () => ({ replace: nav.replace, push: vi.fn(), prefetch: vi.fn() }),
}));

beforeEach(() => {
  nav.search = "";
  nav.replace.mockReset();
});

const [tidemark, bramblecrest, larkspur] = sampleCaseStudies as [
  (typeof sampleCaseStudies)[number],
  (typeof sampleCaseStudies)[number],
  (typeof sampleCaseStudies)[number],
];

describe("case study content", () => {
  it("ships with no unpublished case studies", () => {
    expect(caseStudies).toHaveLength(0);
  });

  it("has unique sample slugs and well-formed dates", () => {
    expect(new Set(sampleCaseStudies.map((s) => s.slug)).size).toBe(sampleCaseStudies.length);
    for (const s of sampleCaseStudies) expect(s.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("finds by slug in the list it is given", () => {
    expect(getCaseStudy("tidemark-health")).toBeUndefined();
    expect(getCaseStudy("tidemark-health", sampleCaseStudies)).toBe(tidemark);
  });

  it("sorts newest first", () => {
    expect(sortCaseStudies([larkspur, tidemark, bramblecrest]).map((s) => s.slug)).toEqual([
      "tidemark-health",
      "bramblecrest-analytics",
      "larkspur-freight",
    ]);
  });

  it("relates by shared service, never itself, and drops unrelated studies", () => {
    // Tidemark (accounting + VA) shares VA with Larkspur, nothing with Bramblecrest.
    expect(relatedCaseStudies(tidemark, sampleCaseStudies).map((s) => s.slug)).toEqual(["larkspur-freight"]);
    expect(relatedCaseStudies(bramblecrest, sampleCaseStudies)).toEqual([]);
  });

  it("lists industries alphabetically", () => {
    expect(industriesOf(sampleCaseStudies)).toEqual(["Healthcare", "Logistics", "SaaS"]);
  });
});

describe("work filter", () => {
  const parse = (q: string) => parseWorkFilter(new URLSearchParams(q), sampleCaseStudies);

  it("reads known services and industries, ignores the rest", () => {
    expect(parse("service=legal&industry=Logistics")).toEqual({ service: "legal", industry: "Logistics" });
    expect(parse("service=crypto&industry=Mining")).toEqual(NO_FILTER);
  });

  it("filters by service and industry together", () => {
    expect(
      applyWorkFilter(sampleCaseStudies, { service: "virtual-assistance", industry: null }),
    ).toHaveLength(2);
    expect(
      applyWorkFilter(sampleCaseStudies, { service: "virtual-assistance", industry: "Healthcare" }),
    ).toEqual([tidemark]);
    expect(
      applyWorkFilter(sampleCaseStudies, { service: "web-development", industry: "Healthcare" }),
    ).toEqual([]);
  });

  it("builds stable, shareable URLs", () => {
    expect(workFilterHref("/work", NO_FILTER)).toBe("/work");
    expect(workFilterHref("/work", { service: "legal", industry: "SaaS" })).toBe(
      "/work?service=legal&industry=SaaS",
    );
  });
});

describe("<CaseStudyCard />", () => {
  it("is one link with the outcome headline, services and stats", () => {
    render(<CaseStudyCard study={tidemark} href="/work/tidemark-health" />);
    expect(screen.getByRole("link", { name: tidemark.title })).toHaveAttribute(
      "href",
      "/work/tidemark-health",
    );
    expect(screen.getByText("Accounting")).toBeInTheDocument();
    expect(screen.getByText("days to close")).toBeInTheDocument();
  });

  it("drops media and stats in the mini variant", () => {
    render(<CaseStudyCard study={tidemark} href="/x" variant="mini" />);
    expect(screen.queryByText("days to close")).not.toBeInTheDocument();
  });
});

describe("<WorkIndex />", () => {
  it("shows only the honest empty state when nothing is published", () => {
    render(<WorkIndex studies={[]} basePath="/work" />);
    expect(screen.queryByRole("navigation", { name: "Filter by service" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ask us for a private reference call" })).toHaveAttribute(
      "href",
      "/contact?topic=reference",
    );
  });

  it("features the newest study and links tabs to shareable URLs", () => {
    render(<WorkIndex studies={sampleCaseStudies} basePath="/work" />);
    const list = screen.getByRole("list", { name: "3 case studies" });
    const items = within(list).getAllByRole("listitem", { name: undefined });
    expect(within(items[0]!).getByRole("link", { name: tidemark.title })).toBeInTheDocument();
    const tabs = screen.getByRole("navigation", { name: "Filter by service" });
    expect(within(tabs).getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
    expect(within(tabs).getByRole("link", { name: "Legal" })).toHaveAttribute("href", "/work?service=legal");
  });

  it("applies the URL filter and shows the filtered empty state", () => {
    nav.search = "service=web-development&industry=Healthcare";
    render(<WorkIndex studies={sampleCaseStudies} basePath="/work" />);
    expect(screen.getByText("No published case studies for this filter yet.")).toBeInTheDocument();
  });

  it("updates the URL when the industry changes", () => {
    nav.search = "service=virtual-assistance";
    render(<WorkIndex studies={sampleCaseStudies} basePath="/work" />);
    expect(screen.getByRole("list", { name: "2 case studies" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Industry" }), { target: { value: "Logistics" } });
    expect(nav.replace).toHaveBeenCalledWith("/work?service=virtual-assistance&industry=Logistics", {
      scroll: false,
    });
  });
});

describe("<CaseStudyArticle />", () => {
  it("renders T1–T9 with the snapshot and section nav", () => {
    render(<CaseStudyArticle study={tidemark} related={[larkspur]} basePath="/work" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tidemark.title);
    for (const name of ["The situation", "What we did", "Results", "What's next", "Related case studies"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["#situation", "#what-we-did", "#results", "#whats-next"]);
    expect(screen.getAllByText("NetSuite, Bill.com, Ramp, Rippling, Slack")).toHaveLength(2);
    expect(screen.getByText(/I expected to spend the first three months/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Want results like Tidemark Health's?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Book a 20-minute call/ })).toHaveAttribute(
      "href",
      "/contact?service=accounting",
    );
  });

  it("omits the quote and related sections when there are none", () => {
    render(<CaseStudyArticle study={larkspur} related={[]} basePath="/work" />);
    expect(screen.queryByRole("heading", { name: "Related case studies" })).not.toBeInTheDocument();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });
});
