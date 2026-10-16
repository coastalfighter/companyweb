import type { Metadata } from "next";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WorkIndex } from "@/components/work/work-index";
import { caseStudies } from "@/content/case-studies";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies published with our clients' permission: real numbers, the before and after, and how the work was done.",
  alternates: { canonical: "/work" },
};

/** Case studies index (docs/blueprint/03-page-blueprints.md, 10A). */
export default function WorkPage() {
  return (
    <>
      <WorkHero />
      <section aria-label="Case studies" className="pb-(--section-y)">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
          <WorkIndex studies={caseStudies} basePath="/work" />
          {caseStudies.length > 0 ? (
            <p className="text-body text-fg-muted">
              Want to talk to a client directly? We&apos;ll arrange a reference call after your scoping
              session.
            </p>
          ) : null}
        </div>
      </section>
      <VoltSlab
        heading="Your numbers could be the next ones here."
        subheading="20 minutes. No slides. A scoped plan whether you hire us or not."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}

function WorkHero() {
  return (
    <section aria-labelledby="work-title" className="pt-32 pb-12 md:pt-40 md:pb-16">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
        <Eyebrow>Work</Eyebrow>
        <h1 id="work-title" className="font-display text-h1 font-semibold text-fg">
          Proof, not promises.
        </h1>
        <p className="max-w-[56ch] text-body-lg text-fg-muted">
          Real clients, real numbers, published with permission. (Most of our clients prefer NDA silence;
          these generously didn&apos;t.)
        </p>
      </div>
    </section>
  );
}
