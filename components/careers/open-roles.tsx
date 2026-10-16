import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { EMPLOYMENT_LABEL, TEAMS } from "@/lib/careers/labels";
import { type Job } from "@/lib/careers/types";

export interface OpenRolesListProps {
  jobs: readonly Job[];
  /** "/careers" on the live site; the design preview passes its own route. */
  basePath: string;
}

/** Teams present in the list, known teams first in blueprint order, then any others. */
export function teamsOf(jobs: readonly Job[]): string[] {
  const present = new Set(jobs.map((j) => j.team));
  const known = TEAMS.filter((t) => present.has(t));
  const other = [...present].filter((t) => !(TEAMS as readonly string[]).includes(t)).sort();
  return [...known, ...other];
}

/**
 * CSS for the team filter: one rule per team, keyed by its index, so no ATS text
 * ever reaches a selector. Checking team N hides every row of another team.
 */
export function teamFilterCss(teamCount: number): string {
  return Array.from(
    { length: teamCount },
    (_, i) =>
      `.open-roles:has(#team-${i + 1}:checked) li[data-team]:not([data-team="${i + 1}"]){display:none}`,
  ).join("");
}

/**
 * Open roles (blueprint 12.5): a list, not cards, with team filters. The filter is
 * a native radio group plus CSS `:has()`, so it ships no JavaScript and works with
 * the keyboard. Filters only appear when there's more than one team; where `:has()`
 * isn't supported, every role stays listed.
 */
export function OpenRolesList({ jobs, basePath }: OpenRolesListProps) {
  const teams = teamsOf(jobs);
  const index = (team: string) => teams.indexOf(team) + 1;

  return (
    <div className="open-roles flex flex-col gap-6">
      {teams.length > 1 ? (
        <>
          <style>{teamFilterCss(teams.length)}</style>
          <fieldset className="-mx-(--gutter) min-w-0 overflow-x-auto px-(--gutter)">
            <legend className="sr-only">Filter by team</legend>
            <div className="flex gap-1">
              {["All", ...teams].map((label, i) => (
                <label
                  key={label}
                  className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-md px-3.5 text-body-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg has-[:checked]:bg-surface-3 has-[:checked]:text-fg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
                >
                  <input
                    type="radio"
                    name="team"
                    id={i === 0 ? "team-all" : `team-${i}`}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : null}
      <ul aria-label="Open roles" className="border-t border-line">
        {jobs.map((job) => (
          <li key={job.id} data-team={index(job.team)} className="group relative border-b border-line">
            <div className="grid items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[minmax(0,2fr)_1fr_1.2fr_1fr_auto]">
              <h3 className="text-h5 font-semibold text-fg">
                <Link
                  href={`${basePath}/${job.slug}`}
                  className="outline-none after:absolute after:inset-0 focus-visible:underline"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="text-body-sm text-fg-muted">{job.team}</p>
              <p className="text-body-sm text-fg-muted">{job.location || (job.remote ? "Remote" : "")}</p>
              <p className="text-body-sm text-fg-muted">
                {job.employmentType ? EMPLOYMENT_LABEL[job.employmentType] : null}
              </p>
              <ArrowRightIcon
                aria-hidden
                className="hidden size-5 text-accent-text transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px] md:block"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
