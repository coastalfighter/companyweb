"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { EMPLOYMENT_LABEL, TEAMS } from "@/lib/careers/labels";
import { type Job } from "@/lib/careers/types";
import { cn } from "@/lib/utils";

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
 * Open roles (blueprint 12.5): a list, not cards, with team filters. Filters only
 * appear when there's more than one team; without JS every role is listed.
 */
export function OpenRolesList({ jobs, basePath }: OpenRolesListProps) {
  const [team, setTeam] = useState<string | null>(null);
  const teams = teamsOf(jobs);
  const shown = team ? jobs.filter((j) => j.team === team) : jobs;

  return (
    <div className="flex flex-col gap-6">
      {teams.length > 1 ? (
        <div
          role="group"
          aria-label="Filter by team"
          className="-mx-(--gutter) flex gap-1 overflow-x-auto px-(--gutter)"
        >
          {[null, ...teams].map((value) => (
            <button
              key={value ?? "all"}
              type="button"
              aria-pressed={team === value}
              onClick={() => setTeam(value)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center rounded-md px-3.5 text-body-sm font-medium transition-colors",
                team === value ? "bg-surface-3 text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {value ?? "All"}
            </button>
          ))}
        </div>
      ) : null}
      <ul
        aria-label={`${shown.length} open ${shown.length === 1 ? "role" : "roles"}`}
        className="border-t border-line"
      >
        {shown.map((job) => (
          <li key={job.id} className="group relative border-b border-line">
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
