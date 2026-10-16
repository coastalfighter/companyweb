import { ArrowSquareOutIcon } from "@phosphor-icons/react/ssr";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { blocksToText } from "@/lib/careers/html-text";
import { EMPLOYMENT_LABEL } from "@/lib/careers/labels";
import { type Job, type JobBlock } from "@/lib/careers/types";
import { siteConfig } from "@/lib/site";
import { HowWeHire } from "./careers-sections";

export interface JobDetailProps {
  job: Job;
  /** "/careers" on the live site; the design preview passes its own route. */
  basePath: string;
}

/** schema.org JobPosting for Google for Jobs (blueprint 12.7). */
export function jobPostingJsonLd(job: Job): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@type": "JobPosting",
    title: job.title,
    description: blocksToText(job.description) || job.title,
    datePosted: job.publishedAt,
    identifier: { "@type": "PropertyValue", name: siteConfig.name, value: job.id },
    hiringOrganization: { "@type": "Organization", name: siteConfig.name, sameAs: siteConfig.url },
    directApply: false,
    url: job.applyUrl,
  };
  if (job.employmentType) data.employmentType = job.employmentType;
  if (job.remote) {
    data.jobLocationType = "TELECOMMUTE";
    // "Remote (Philippines)" → Philippines. Google wants a country; with none named, leave it out.
    const country = job.location.replace(/^\s*remote\s*[-–(,]?\s*|\)\s*$/gi, "").trim();
    if (country) data.applicantLocationRequirements = { "@type": "Country", name: country };
  } else if (job.location) {
    data.jobLocation = {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    };
  }
  if (job.salary?.currency && (job.salary.min !== undefined || job.salary.max !== undefined)) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary.currency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary.min !== undefined ? { minValue: job.salary.min } : {}),
        ...(job.salary.max !== undefined ? { maxValue: job.salary.max } : {}),
        ...(job.salary.unit ? { unitText: job.salary.unit } : {}),
      },
    };
  }
  return data;
}

function Blocks({ blocks }: { blocks: readonly JobBlock[] }) {
  return (
    <div className="flex flex-col gap-5 text-body-lg text-fg-muted">
      {blocks.map((block, i) =>
        block.kind === "heading" ? (
          <h2 key={i} className="mt-6 font-display text-h4 font-semibold text-fg first:mt-0">
            {block.text}
          </h2>
        ) : block.kind === "list" ? (
          <ul key={i} className="flex list-disc flex-col gap-2 pl-6 marker:text-accent-text">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block.text}</p>
        ),
      )}
    </div>
  );
}

function ApplyButton({ job }: { job: Job }) {
  return (
    <Button asChild size="lg" className="max-sm:w-full">
      <a href={job.applyUrl} rel="noopener">
        Apply for this role
        <ArrowSquareOutIcon aria-hidden className="size-4" />
        <span className="sr-only">(opens our job board)</span>
      </a>
    </Button>
  );
}

/** Job detail template (blueprint 12.7). */
export function JobDetail({ job, basePath }: JobDetailProps) {
  const meta = [
    ["Team", job.team],
    ["Location", job.location || (job.remote ? "Remote" : "")],
    ["Type", job.employmentType ? EMPLOYMENT_LABEL[job.employmentType] : ""],
    ["Salary", job.salary?.text ?? ""],
  ].filter(([, value]) => value) as [string, string][];

  return (
    <article aria-labelledby="job-title">
      <header className="pt-32 pb-12 md:pt-40">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
          <Breadcrumb
            items={[
              { label: "Careers", href: basePath },
              { label: job.title, href: `${basePath}/${job.slug}` },
            ]}
          />
          <h1 id="job-title" className="max-w-[24ch] font-display text-h1 font-semibold text-fg">
            {job.title}
          </h1>
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {meta.map(([term, value]) => (
              <div key={term} className="flex flex-col gap-0.5">
                <dt className="text-caption text-fg-muted">{term}</dt>
                <dd className="text-body font-medium text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2">
            <ApplyButton job={job} />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-16 border-t border-line px-(--gutter) py-16">
        <div className="max-w-(--container-prose)">
          {job.description.length > 0 ? (
            <Blocks blocks={job.description} />
          ) : (
            <p className="text-body-lg text-fg-muted">The full description is on the application page.</p>
          )}
        </div>
        <HowWeHire headingLevel="h2" />
        <div className="flex flex-col items-start gap-4 rounded-xl border border-line-strong bg-surface-2 p-8">
          <p className="text-h5 font-semibold text-fg">Sound like you?</p>
          <ApplyButton job={job} />
        </div>
      </div>
    </article>
  );
}
