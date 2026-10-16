"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { NativeSelect } from "@/components/ui/select";
import { industriesOf, sortCaseStudies, type CaseStudy } from "@/content/case-studies";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";
import {
  applyWorkFilter,
  NO_FILTER,
  parseWorkFilter,
  workFilterHref,
  type WorkFilter,
} from "@/lib/work/filter";
import { CaseStudyCard } from "./case-study-card";

export interface WorkIndexProps {
  studies: readonly CaseStudy[];
  /** "/work" on the live site; the design preview passes its own route. */
  basePath: string;
}

const REFERENCE_HREF = "/contact?topic=reference";

export function EmptyResults({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-surface-1 p-8 md:p-12">
      <p className="max-w-[48ch] text-body-lg text-fg">
        {filtered
          ? "No published case studies for this filter yet."
          : "Our first published case studies are on their way."}{" "}
        <span className="text-fg-muted">
          Most clients prefer NDA silence, so we arrange private reference calls instead.
        </span>
      </p>
      <Link
        href={REFERENCE_HREF}
        className="link-sweep group inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
      >
        Ask us for a private reference call
        <ArrowRightIcon
          aria-hidden
          className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
        />
      </Link>
    </div>
  );
}

function Grid({ studies, basePath, filter }: WorkIndexProps & { filter: WorkFilter }) {
  const results = applyWorkFilter(sortCaseStudies(studies), filter);
  const filtered = filter.service !== null || filter.industry !== null;
  if (results.length === 0) return <EmptyResults filtered={filtered} />;
  return (
    <ul
      // Re-keyed per filter so the new results fade in (blueprint 10A layout transition).
      key={workFilterHref("", filter)}
      className="grid animate-fade-in gap-6 md:grid-cols-2"
      aria-label={`${results.length} case ${results.length === 1 ? "study" : "studies"}`}
    >
      {results.map((study, i) => (
        <li key={study.slug} className={cn(i === 0 && results.length > 1 && "md:col-span-2")}>
          <CaseStudyCard
            study={study}
            href={`${basePath}/${study.slug}`}
            variant={i === 0 && results.length > 1 ? "featured" : "grid"}
            as="h2"
          />
        </li>
      ))}
    </ul>
  );
}

function FilterBar({ studies, basePath, filter }: WorkIndexProps & { filter: WorkFilter }) {
  const router = useRouter();
  const pathname = usePathname();
  const industries = industriesOf(studies);
  const tabs = [{ slug: null, label: "All" }, ...services.map((s) => ({ slug: s.slug, label: s.shortName }))];

  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
      <nav aria-label="Filter by service" className="-mx-(--gutter) overflow-x-auto px-(--gutter)">
        <ul className="flex gap-1">
          {tabs.map((tab) => {
            const active = filter.service === tab.slug;
            return (
              <li key={tab.label}>
                <Link
                  href={workFilterHref(basePath, { ...filter, service: tab.slug })}
                  scroll={false}
                  replace
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-md px-3.5 text-body-sm font-medium whitespace-nowrap transition-colors",
                    active ? "bg-surface-3 text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {industries.length > 1 ? (
        <label className="flex items-center gap-3 text-body-sm text-fg-muted">
          Industry
          <NativeSelect
            className="h-10 w-48"
            value={filter.industry ?? ""}
            onChange={(event) =>
              router.replace(workFilterHref(pathname, { ...filter, industry: event.target.value || null }), {
                scroll: false,
              })
            }
          >
            <option value="">All industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </NativeSelect>
        </label>
      ) : null}
    </div>
  );
}

function FilteredIndex(props: WorkIndexProps) {
  const params = useSearchParams();
  const filter = parseWorkFilter(new URLSearchParams(params.toString()), props.studies);
  return (
    <div className="flex flex-col gap-10">
      <FilterBar {...props} filter={filter} />
      <Grid {...props} filter={filter} />
    </div>
  );
}

/**
 * Work index body (blueprint 10A). The page prerenders the unfiltered list; the
 * query-driven filters take over after hydration. With nothing published, there is
 * no filter bar, only the honest empty state.
 */
export function WorkIndex(props: WorkIndexProps) {
  if (props.studies.length === 0) return <EmptyResults filtered={false} />;
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-10">
          <FilterBar {...props} filter={NO_FILTER} />
          <Grid {...props} filter={NO_FILTER} />
        </div>
      }
    >
      <FilteredIndex {...props} />
    </Suspense>
  );
}
