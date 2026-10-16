import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { careersFacts, cultureItems, joinList } from "@/content/careers";
import { sampleCareersFacts, sampleJobs } from "@/content/samples";
import { type Job } from "@/lib/careers/types";
import { BenefitsSection, CultureSection, OpenRoles, talentPoolHref, TeamQuote } from "./careers-sections";
import { JobDetail, jobPostingJsonLd } from "./job-detail";
import { teamsOf } from "./open-roles";

const [bookkeeper, engineer] = sampleJobs as [Job, Job, Job, Job];

describe("careers facts gating", () => {
  it("ships with no unconfirmed facts", () => {
    expect(careersFacts.benefits).toHaveLength(0);
    expect(careersFacts.learningBudget).toBeNull();
    expect(careersFacts.workCountries).toHaveLength(0);
    expect(careersFacts.quote).toBeNull();
  });

  it("renders no benefits grid or team quote until confirmed", () => {
    const { container } = render(
      <>
        <BenefitsSection />
        <TeamQuote />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps culture copy free of unconfirmed specifics, and folds them in when confirmed", () => {
    const generic = cultureItems()
      .map((i) => i.body)
      .join(" ");
    expect(generic).not.toMatch(/\$|Philippines|Colombia|Poland/);
    const specific = cultureItems(sampleCareersFacts)
      .map((i) => i.body)
      .join(" ");
    expect(specific).toContain("$1,500 a year");
    expect(specific).toContain("the Philippines, Colombia and Poland");
  });

  it("renders the confirmed sections from sample data (preview)", () => {
    render(
      <>
        <CultureSection facts={sampleCareersFacts} />
        <BenefitsSection facts={sampleCareersFacts} />
        <TeamQuote facts={sampleCareersFacts} />
      </>,
    );
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(9);
    expect(screen.getByText(/Nobody hands me tickets/)).toBeInTheDocument();
  });
});

describe("joinList", () => {
  it("joins with commas and a final 'and'", () => {
    expect(joinList([])).toBe("");
    expect(joinList(["A"])).toBe("A");
    expect(joinList(["A", "B"])).toBe("A and B");
    expect(joinList(["A", "B", "C"])).toBe("A, B and C");
  });
});

describe("talentPoolHref", () => {
  it("uses an https ATS link, otherwise email", () => {
    expect(talentPoolHref("https://jobs.ashbyhq.com/akros/talent")).toBe(
      "https://jobs.ashbyhq.com/akros/talent",
    );
    expect(talentPoolHref("javascript:alert(1)")).toMatch(/^mailto:.*subject=Talent%20pool$/);
    expect(talentPoolHref("")).toMatch(/^mailto:/);
  });
});

describe("<OpenRoles />", () => {
  it("shows the talent-pool empty state with no ATS", () => {
    render(<OpenRoles result={{ status: "unconfigured", jobs: [] }} basePath="/careers" />);
    expect(screen.getByText(/No open roles right now/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the talent pool" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:/),
    );
  });

  it("links to the job board, not 'no roles', when the ATS is down", () => {
    render(
      <OpenRoles
        result={{ status: "error", jobs: [], boardUrl: "https://jobs.lever.co/akros" }}
        basePath="/careers"
      />,
    );
    expect(screen.queryByText(/No open roles/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open the job board" })).toHaveAttribute(
      "href",
      "https://jobs.lever.co/akros",
    );
  });

  it("lists roles and filters by team", () => {
    render(<OpenRoles result={{ status: "ok", jobs: [...sampleJobs] }} basePath="/careers" />);
    expect(screen.getByRole("list", { name: "4 open roles" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: bookkeeper.title })).toHaveAttribute(
      "href",
      `/careers/${bookkeeper.slug}`,
    );
    const filters = screen.getByRole("group", { name: "Filter by team" });
    fireEvent.click(within(filters).getByRole("button", { name: "Finance" }));
    expect(within(filters).getByRole("button", { name: "Finance" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("list", { name: "1 open role" })).toBeInTheDocument();
    fireEvent.click(within(filters).getByRole("button", { name: "All" }));
    expect(screen.getByRole("list", { name: "4 open roles" })).toBeInTheDocument();
  });

  it("orders teams as in the blueprint, then others", () => {
    expect(teamsOf([{ ...engineer, team: "Marketing" }, bookkeeper, engineer])).toEqual([
      "Engineering",
      "Finance",
      "Marketing",
    ]);
  });
});

describe("<JobDetail />", () => {
  it("renders the meta row, description, hiring steps and apply links", () => {
    render(<JobDetail job={bookkeeper} basePath="/careers" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Senior Bookkeeper");
    expect(screen.getByText("$1.8K – $2.4K per month")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What you'll do" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How we hire" })).toBeInTheDocument();
    const apply = screen.getAllByRole("link", { name: /Apply for this role/ });
    expect(apply).toHaveLength(2);
    apply.forEach((a) => expect(a).toHaveAttribute("href", bookkeeper.applyUrl));
  });
});

describe("jobPostingJsonLd", () => {
  it("describes a remote role with salary for Google for Jobs", () => {
    expect(jobPostingJsonLd(bookkeeper)).toMatchObject({
      "@type": "JobPosting",
      title: "Senior Bookkeeper",
      datePosted: bookkeeper.publishedAt,
      employmentType: "FULL_TIME",
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: "Philippines" },
      baseSalary: { currency: "USD", value: { minValue: 1800, maxValue: 2400, unitText: "MONTH" } },
      directApply: false,
    });
  });

  it("uses a place for on-site roles and omits what isn't known", () => {
    const data = jobPostingJsonLd({
      ...engineer,
      remote: false,
      location: "Bogotá",
      salary: undefined,
      employmentType: undefined,
    });
    expect(data.jobLocation).toEqual({
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: "Bogotá" },
    });
    expect(data).not.toHaveProperty("baseSalary");
    expect(data).not.toHaveProperty("employmentType");
    expect(data).not.toHaveProperty("jobLocationType");
  });
});
