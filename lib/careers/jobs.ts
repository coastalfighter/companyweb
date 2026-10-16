import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { boardApiUrl, boardPageUrl, parseBoard } from "./providers";
import { type AtsConfig, type AtsProvider, type Job, type JobsResult } from "./types";

const PROVIDERS: readonly AtsProvider[] = ["ashby", "greenhouse", "lever"];
const TIMEOUT_MS = 8000;

/** `ATS_PROVIDER` + `ATS_BOARD` (see .env.example). Anything incomplete means "no ATS". */
export function readAtsConfig(env: NodeJS.ProcessEnv = process.env): AtsConfig | null {
  const provider = env.ATS_PROVIDER?.trim().toLowerCase() as AtsProvider | undefined;
  const board = env.ATS_BOARD?.trim();
  if (!provider || !board || !PROVIDERS.includes(provider)) return null;
  // Board names are slugs; refuse anything that could change the request path.
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(board)) return null;
  return { provider, board };
}

/** Fetches and normalises a board. Never throws: failures become `status: "error"`. */
export async function fetchJobs(
  config: AtsConfig | null,
  fetchImpl: typeof fetch = fetch,
): Promise<JobsResult> {
  if (!config) return { status: "unconfigured", jobs: [] };
  try {
    const response = await fetchImpl(boardApiUrl(config), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const jobs = parseBoard(config.provider, await response.json());
    jobs.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return { status: "ok", jobs };
  } catch (error) {
    console.error(`[careers] ${config.provider} board "${config.board}" failed:`, error);
    return { status: "error", jobs: [], boardUrl: boardPageUrl(config) };
  }
}

/**
 * Open roles, cached and refreshed hourly in the background (blueprint 12.5:
 * "ISR revalidate 1h"). `revalidateTag("jobs")` from an ATS webhook refreshes sooner.
 */
export async function getJobs(): Promise<JobsResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("jobs");
  return fetchJobs(readAtsConfig());
}

export async function getJob(slug: string): Promise<Job | undefined> {
  const { jobs } = await getJobs();
  return jobs.find((job) => job.slug === slug);
}
