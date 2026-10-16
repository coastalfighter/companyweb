import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";

const pains = [
  {
    persona: "CTO",
    title: "11:40 pm, reviewing a freelancer's pull request.",
    body: "Your principal engineer is QA'ing a marketing site instead of shipping the roadmap.",
    vignette: (
      <div className="font-mono text-[0.6875rem] text-fg-subtle">
        <p className="text-fg">PR #482 · marketing-site</p>
        <p className="mt-1">
          <span className="text-error">47 comments</span> · changes requested
        </p>
      </div>
    ),
  },
  {
    persona: "CFO",
    title: "Day 14 of month-end close.",
    body: "Your controller is chasing receipts and fixing coding errors when they should be forecasting cash.",
    vignette: (
      <div className="font-mono text-[0.6875rem] text-fg-subtle">
        <div className="flex gap-0.5" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="h-3 w-1.5 rounded-[1px] bg-error/50" />
          ))}
        </div>
        <p className="mt-1.5">Close · 14 days and counting</p>
      </div>
    ),
  },
  {
    persona: "COO",
    title: "312 applications, one hiring manager.",
    body: "Your ops lead spent the week screening resumes. The role is still open.",
    vignette: (
      <div className="font-mono text-[0.6875rem] text-fg-subtle">
        <p className="font-display text-h4 font-semibold text-fg">312</p>
        <p>unreviewed applicants</p>
      </div>
    ),
  },
] as const;

/** Homepage 1.3: "the expensive-hands problem". */
export function ProblemSection() {
  return (
    <section aria-labelledby="problem-title" className="py-(--section-y)">
      <div className="mx-auto grid max-w-(--container-content) gap-12 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div data-reveal className="flex flex-col gap-5 lg:sticky lg:top-32">
            <Eyebrow>The problem</Eyebrow>
            <h2 id="problem-title" className="font-display text-h2 font-semibold text-fg">
              Your best people are doing their worst work.
            </h2>
            <p className="max-w-[48ch] text-body-lg text-fg-muted">
              Every growing company hits the same wall. The people you hired to think are buried in tasks that
              need doing, but not by them. That&apos;s not a talent problem. It&apos;s a routing problem.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-6 lg:col-start-7">
          {pains.map((pain) => (
            <article
              data-reveal="card"
              key={pain.persona}
              className="surface reading-focus flex flex-col gap-6 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 sm:flex-row sm:items-start sm:justify-between md:p-8"
            >
              <div className="flex max-w-md flex-col gap-3">
                <Badge className="self-start">{pain.persona}</Badge>
                <h3 className="font-display text-h4 font-semibold text-fg">{pain.title}</h3>
                <p className="text-body-sm text-fg-muted">{pain.body}</p>
              </div>
              <div aria-hidden className="shrink-0 rounded-md border border-line bg-ink-900 p-3 sm:w-44">
                {pain.vignette}
              </div>
            </article>
          ))}
          <p data-reveal className="pt-6 font-display text-h4 font-semibold text-fg">
            We take the work. You keep the hours.
          </p>
        </div>
      </div>
    </section>
  );
}
