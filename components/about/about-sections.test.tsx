import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { company, initials, operatingRules, principles } from "@/content/company";
import { sampleCompany } from "@/content/samples";
import {
  AboutTeasers,
  LeadershipSection,
  NumbersBand,
  OriginSection,
  PrinciplesSection,
  WhereWeWork,
  WordRise,
} from "./about-sections";
import { formatHubTime, HubClocks } from "./hub-clocks";
import { landDots, MAP_COLUMNS, MAP_ROWS, project } from "./world-dots";

describe("company facts gating", () => {
  it("ships with no unverified company facts", () => {
    expect(company.originStory).toHaveLength(0);
    expect(company.originToday).toBeNull();
    expect(company.numbers).toHaveLength(0);
    expect(company.leadership).toHaveLength(0);
    expect(company.hubs).toHaveLength(0);
  });

  it("renders nothing for the fact-only sections when facts are empty", () => {
    const { container } = render(
      <>
        <NumbersBand />
        <LeadershipSection />
        <WhereWeWork />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the operating rules without an origin story", () => {
    render(<OriginSection />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(operatingRules.length);
    expect(screen.getByText("How we run")).toBeInTheDocument();
    expect(screen.queryByText(/began in/)).not.toBeInTheDocument();
  });

  it("renders the story, numbers, leaders and hubs when they are supplied", () => {
    render(
      <>
        <OriginSection company={sampleCompany} />
        <NumbersBand company={sampleCompany} />
        <LeadershipSection company={sampleCompany} />
        <WhereWeWork company={sampleCompany} />
      </>,
    );
    expect(screen.getByText("Our story")).toBeInTheDocument();
    expect(screen.getByText(sampleCompany.originToday!)).toBeInTheDocument();
    // Years are shown as-is, never counted up.
    expect(screen.getByText("2019")).toBeInTheDocument();
    for (const leader of sampleCompany.leadership) {
      expect(screen.getByRole("heading", { name: leader.name })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: /Distributed by design/ })).toBeInTheDocument();
    expect(screen.getAllByTestId("hub-time")).toHaveLength(sampleCompany.hubs.length);
  });
});

describe("PrinciplesSection", () => {
  it("renders the four principles as headed cards", () => {
    render(<PrinciplesSection />);
    for (const principle of principles) {
      expect(screen.getByRole("heading", { level: 3, name: principle.title })).toBeInTheDocument();
    }
  });
});

describe("WordRise", () => {
  it("keeps the headline text intact for assistive tech", () => {
    render(
      <h1>
        <WordRise text="We started Akrostech because outsourcing had a trust problem." />
      </h1>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "We started Akrostech because outsourcing had a trust problem.",
    );
  });
});

describe("AboutTeasers", () => {
  it("links to the security request and careers", () => {
    render(<AboutTeasers />);
    expect(screen.getByRole("link", { name: "Running a security review?" })).toHaveAttribute(
      "href",
      "/contact?topic=security",
    );
    expect(screen.getByRole("link", { name: /hiring operators/ })).toHaveAttribute("href", "/careers");
  });
});

describe("initials", () => {
  it("takes up to two initials", () => {
    expect(initials("Dana Whitfield")).toBe("DW");
    expect(initials("  ana  maria  de souza ")).toBe("AM");
    expect(initials("Cher")).toBe("C");
  });
});

describe("world dots", () => {
  it("places every sample hub on land", () => {
    const land = new Set(landDots.map((d) => `${d.col}-${d.row}`));
    for (const hub of sampleCompany.hubs) {
      const cell = project(hub.lat, hub.lon);
      expect(land.has(`${cell.col}-${cell.row}`), hub.city).toBe(true);
    }
  });

  it("clamps coordinates to the grid", () => {
    expect(project(90, -180)).toEqual({ col: 0, row: 0 });
    expect(project(-90, 180)).toEqual({ col: MAP_COLUMNS - 1, row: MAP_ROWS - 1 });
  });

  it("keeps every land dot inside the grid", () => {
    for (const dot of landDots) {
      expect(dot.col).toBeGreaterThanOrEqual(0);
      expect(dot.col).toBeLessThan(MAP_COLUMNS);
    }
  });
});

describe("HubClocks", () => {
  afterEach(() => vi.useRealTimers());

  it("formats local time per time zone", () => {
    const at = Date.UTC(2026, 9, 16, 14, 42);
    expect(formatHubTime("Asia/Manila", at)).toBe("10:42 PM");
    expect(formatHubTime("America/Bogota", at)).toBe("9:42 AM");
    expect(formatHubTime("Europe/Warsaw", at)).toBe("4:42 PM");
  });

  it("ticks on the minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 9, 16, 14, 42, 30));
    render(<HubClocks hubs={[{ city: "Manila", timeZone: "Asia/Manila", lat: 14.6, lon: 121 }]} />);
    const item = screen.getByRole("listitem");
    expect(within(item).getByTestId("hub-time")).toHaveTextContent("10:42 PM");
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(within(item).getByTestId("hub-time")).toHaveTextContent("10:43 PM");
  });
});
