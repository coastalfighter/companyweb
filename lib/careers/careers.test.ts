import { describe, expect, it, vi } from "vitest";
import { blocksToText, decodeEntities, htmlToBlocks, plainToBlocks } from "./html-text";
import { fetchJobs, readAtsConfig } from "./jobs";
import {
  boardApiUrl,
  boardPageUrl,
  formatSalary,
  jobSlug,
  normaliseEmployment,
  normaliseTeam,
  parseAshby,
  parseGreenhouse,
  parseLever,
} from "./providers";

describe("decodeEntities", () => {
  it("decodes named and numeric entities and leaves unknown ones", () => {
    expect(decodeEntities("Q&amp;A &lt;3 &#8212; &#x2019; &nbsp;x &bogus;")).toBe("Q&A <3 — ’  x &bogus;");
  });
});

describe("htmlToBlocks", () => {
  it("keeps headings, paragraphs and lists, and drops markup", () => {
    const html = `
      <h2>About the role</h2>
      <p>You'll <em>own</em> the close.<br>Every month.</p>
      <p><strong>What you'll do:</strong></p>
      <ul><li>Reconcile <b>daily</b></li><li>Write SOPs</li></ul>
      <script>alert(1)</script><style>p{}</style>
      <p><img src=x onerror=alert(1)>Plain text only</p>`;
    expect(htmlToBlocks(html)).toEqual([
      { kind: "heading", text: "About the role" },
      { kind: "paragraph", text: "You'll own the close." },
      { kind: "paragraph", text: "Every month." },
      { kind: "heading", text: "What you'll do" },
      { kind: "list", items: ["Reconcile daily", "Write SOPs"] },
      { kind: "paragraph", text: "Plain text only" },
    ]);
  });

  it("handles Greenhouse's entity-encoded HTML", () => {
    expect(
      htmlToBlocks("&lt;p&gt;Hello &amp;amp; welcome&lt;/p&gt;&lt;ul&gt;&lt;li&gt;One&lt;/li&gt;&lt;/ul&gt;"),
    ).toEqual([
      { kind: "paragraph", text: "Hello & welcome" },
      { kind: "list", items: ["One"] },
    ]);
  });

  it("never lets a tag through as text", () => {
    const text = blocksToText(
      htmlToBlocks('<p>a <a href="javascript:x">link</a></p><div onclick="x">b</div>'),
    );
    expect(text).not.toMatch(/[<>]/);
    expect(text).toBe("a link\n\nb");
  });
});

describe("plainToBlocks", () => {
  it("splits paragraphs, bullet lists and headed lists", () => {
    expect(plainToBlocks("Intro line one\nline two\n\nYou bring:\n- A\n- B\n\n• C\n• D")).toEqual([
      { kind: "paragraph", text: "Intro line one line two" },
      { kind: "heading", text: "You bring" },
      { kind: "list", items: ["A", "B"] },
      { kind: "list", items: ["C", "D"] },
    ]);
  });
});

describe("normalisers", () => {
  it("builds stable, unique slugs", () => {
    expect(jobSlug("Senior Bookkeeper (Remote)", "a1b2c3d4-e5f6")).toBe("senior-bookkeeper-remote-a1b2c3d4");
    expect(jobSlug("Ingeniero de Software Señor", "9")).toBe("ingeniero-de-software-senor-9");
    expect(jobSlug("!!!", "x1")).toBe("role-x1");
  });

  it("maps departments to the careers teams", () => {
    expect(normaliseTeam("Software Engineering")).toBe("Engineering");
    expect(normaliseTeam("Talent Acquisition")).toBe("Recruiting");
    expect(normaliseTeam("Executive Assistance")).toBe("Assistance");
    expect(normaliseTeam("Accounting & Payroll")).toBe("Finance");
    expect(normaliseTeam("Contract Management")).toBe("Legal Ops");
    expect(normaliseTeam("Marketing")).toBe("Marketing");
    expect(normaliseTeam(undefined)).toBe("Other");
  });

  it("formats salary ranges and rejects incomplete ones", () => {
    expect(formatSalary(60000, 80000, "USD", "YEAR")?.text).toBe("$60K – $80K per year");
    expect(formatSalary(2000, undefined, "USD", "MONTH")?.text).toBe("$2K per month");
    expect(formatSalary(1, 2, undefined, "YEAR")).toBeUndefined();
    expect(formatSalary(1, 2, "NOT-A-CURRENCY", "YEAR")).toBeUndefined();
  });

  it("maps employment types", () => {
    expect(normaliseEmployment("FullTime")).toBe("FULL_TIME");
    expect(normaliseEmployment("Part-time")).toBe("PART_TIME");
    expect(normaliseEmployment("Seasonal")).toBeUndefined();
  });
});

describe("board URLs", () => {
  it("targets each provider's public API and board page", () => {
    expect(boardApiUrl({ provider: "ashby", board: "akros" })).toBe(
      "https://api.ashbyhq.com/posting-api/job-board/akros?includeCompensation=true",
    );
    expect(boardApiUrl({ provider: "greenhouse", board: "akros" })).toBe(
      "https://boards-api.greenhouse.io/v1/boards/akros/jobs?content=true",
    );
    expect(boardApiUrl({ provider: "lever", board: "akros" })).toBe(
      "https://api.lever.co/v0/postings/akros?mode=json",
    );
    expect(boardPageUrl({ provider: "lever", board: "akros" })).toBe("https://jobs.lever.co/akros");
  });
});

const ashbyFixture = {
  jobs: [
    {
      id: "a1b2c3d4-0000",
      title: "Senior Bookkeeper",
      department: "Finance",
      team: "Accounting",
      employmentType: "FullTime",
      location: "Remote (Philippines)",
      isRemote: true,
      isListed: true,
      publishedAt: "2026-10-01T09:00:00.000+00:00",
      jobUrl: "https://jobs.ashbyhq.com/akros/a1b2",
      applyUrl: "https://jobs.ashbyhq.com/akros/a1b2/application",
      descriptionHtml: "<p>Own the close.</p>",
      compensation: {
        summaryComponents: [
          {
            compensationType: "Salary",
            interval: "1 MONTH",
            currencyCode: "USD",
            minValue: 1800,
            maxValue: 2400,
          },
        ],
      },
    },
    {
      id: "unlisted",
      title: "Hidden",
      isListed: false,
      publishedAt: "2026-10-01",
      applyUrl: "https://x.test",
    },
    { id: "bad", title: 42 },
    { id: "insecure", title: "HTTP only", publishedAt: "2026-10-01", applyUrl: "http://jobs.example.com/x" },
  ],
};

describe("parseAshby", () => {
  it("normalises listed postings and skips unlisted, malformed and non-https ones", () => {
    const jobs = parseAshby(ashbyFixture);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      id: "a1b2c3d4-0000",
      slug: "senior-bookkeeper-a1b2c3d4",
      team: "Finance",
      remote: true,
      employmentType: "FULL_TIME",
      salary: { text: "$1.8K – $2.4K per month", min: 1800, max: 2400, currency: "USD", unit: "MONTH" },
      publishedAt: "2026-10-01T09:00:00.000Z",
      applyUrl: "https://jobs.ashbyhq.com/akros/a1b2/application",
      description: [{ kind: "paragraph", text: "Own the close." }],
    });
  });

  it("returns nothing for an unexpected payload", () => {
    expect(parseAshby({ nope: true })).toEqual([]);
    expect(parseAshby(null)).toEqual([]);
  });
});

describe("parseGreenhouse", () => {
  it("normalises jobs with encoded content", () => {
    const jobs = parseGreenhouse({
      jobs: [
        {
          id: 4012345,
          title: "Technical Recruiter",
          updated_at: "2026-09-20T10:00:00-04:00",
          absolute_url: "https://job-boards.greenhouse.io/akros/jobs/4012345",
          location: { name: "Remote - Poland" },
          content: "&lt;p&gt;Source senior engineers.&lt;/p&gt;",
          departments: [{ name: "Talent" }],
        },
      ],
    });
    expect(jobs).toEqual([
      {
        id: "4012345",
        slug: "technical-recruiter-4012345",
        title: "Technical Recruiter",
        team: "Recruiting",
        location: "Remote - Poland",
        remote: true,
        publishedAt: "2026-09-20T14:00:00.000Z",
        applyUrl: "https://job-boards.greenhouse.io/akros/jobs/4012345",
        description: [{ kind: "paragraph", text: "Source senior engineers." }],
      },
    ]);
  });
});

describe("parseLever", () => {
  it("normalises postings with lists and salary", () => {
    const [job] = parseLever([
      {
        id: "f00d-cafe",
        text: "Executive Assistant",
        createdAt: Date.UTC(2026, 8, 10),
        hostedUrl: "https://jobs.lever.co/akros/f00d-cafe",
        applyUrl: "https://jobs.lever.co/akros/f00d-cafe/apply",
        workplaceType: "remote",
        categories: { team: "Assistance", location: "Manila", commitment: "Part-time" },
        descriptionPlain: "Support a CFO.",
        lists: [{ text: "What you'll do", content: "<li>Calendar</li><li>Board packs</li>" }],
        salaryRange: { min: 1200, max: 1500, currency: "USD", interval: "per-month-salary" },
      },
    ]);
    expect(job).toMatchObject({
      slug: "executive-assistant-f00dcafe",
      team: "Assistance",
      remote: true,
      employmentType: "PART_TIME",
      salary: { text: "$1.2K – $1.5K per month", unit: "MONTH" },
      applyUrl: "https://jobs.lever.co/akros/f00d-cafe/apply",
      description: [
        { kind: "paragraph", text: "Support a CFO." },
        { kind: "heading", text: "What you'll do" },
        { kind: "list", items: ["Calendar", "Board packs"] },
      ],
    });
  });
});

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("readAtsConfig", () => {
  it("needs a known provider and a slug-like board", () => {
    expect(readAtsConfig(env({ ATS_PROVIDER: "Ashby", ATS_BOARD: " akros " }))).toEqual({
      provider: "ashby",
      board: "akros",
    });
    expect(readAtsConfig(env({ ATS_PROVIDER: "workday", ATS_BOARD: "akros" }))).toBeNull();
    expect(readAtsConfig(env({ ATS_PROVIDER: "lever" }))).toBeNull();
    expect(readAtsConfig(env({ ATS_PROVIDER: "lever", ATS_BOARD: "../admin" }))).toBeNull();
  });
});

describe("fetchJobs", () => {
  const config = { provider: "ashby", board: "akros" } as const;

  it("reports an unconfigured ATS without fetching", async () => {
    const fetchImpl = vi.fn();
    await expect(fetchJobs(null, fetchImpl)).resolves.toEqual({ status: "unconfigured", jobs: [] });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns parsed jobs newest first", async () => {
    const older = {
      ...ashbyFixture.jobs[0],
      id: "older-0001",
      title: "Older",
      publishedAt: "2026-01-01T00:00:00Z",
    };
    const fetchImpl = vi.fn(async () => Response.json({ jobs: [older, ashbyFixture.jobs[0]] }));
    const result = await fetchJobs(config, fetchImpl as unknown as typeof fetch);
    expect(result.status).toBe("ok");
    expect(result.jobs.map((j) => j.title)).toEqual(["Senior Bookkeeper", "Older"]);
    expect(fetchImpl).toHaveBeenCalledWith(
      boardApiUrl(config),
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it("turns HTTP and network failures into an error with the board link", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const down = vi.fn(async () => new Response("nope", { status: 503 }));
    await expect(fetchJobs(config, down as unknown as typeof fetch)).resolves.toEqual({
      status: "error",
      jobs: [],
      boardUrl: "https://jobs.ashbyhq.com/akros",
    });
    const offline = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(fetchJobs(config, offline as unknown as typeof fetch)).resolves.toMatchObject({
      status: "error",
    });
    quiet.mockRestore();
  });
});
