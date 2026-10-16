import Link from "next/link";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import { proof } from "@/content/proof";
import { ctas, prefetchFor } from "@/lib/site";

const columns = ["Freelancers", "Typical offshore BPO", "In-house hire", "Akrostech"] as const;

type Row = { label: string; values: readonly [string, string, string, string] };

function rows(soc2: boolean): readonly Row[] {
  return [
    { label: "Time to start", values: ["1–3 weeks", "4–8 weeks", "6–12 weeks", "10 business days"] },
    {
      label: "Who manages the work",
      values: ["You", "An account manager", "You", "A dedicated Akrostech lead"],
    },
    {
      label: "Coverage when someone's out",
      values: ["None", "Varies", "None", "Built-in backup on every role"],
    },
    {
      label: "Visibility",
      values: ["Whatever they tell you", "Monthly report", "Daily standup", "Live task log + Friday report"],
    },
    {
      label: "Security controls",
      values: [
        "Unknown",
        "Varies",
        "Yours",
        soc2 ? "SOC 2 controls, NDA, access logs" : "NDA, least-privilege access, access logs",
      ],
    },
    {
      label: "Commitment",
      values: ["Per project", "12–36 months", "Permanent", "Month-to-month after 90 days"],
    },
    { label: "Fully loaded cost", values: ["$$", "$", "$$$$", "$$"] },
  ];
}

/** Homepage 1.9: "You have options. Here's how we stack up." */
export function ComparisonSection() {
  const data = rows(proof.certifications.soc2Type2);
  return (
    <section aria-labelledby="compare-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="compare-title"
          eyebrow="The honest comparison"
          title="You have options. Here's how we stack up."
        />

        <div data-reveal className="relative">
          <div
            role="region"
            aria-label="Comparison table, scrolls horizontally"
            tabIndex={0}
            className="compare-scroll overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-focus"
          >
            <table className="w-full min-w-[760px] border-collapse text-left text-body-sm">
              <caption className="sr-only">
                Akrostech compared with freelancers, offshore BPOs and in-house hires
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 w-[22%] bg-bg p-4 font-medium text-fg-subtle">
                    <span className="sr-only">Criteria</span>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className={
                        col === "Akrostech"
                          ? "border-t-2 border-volt-500 bg-volt-950 p-4 font-display text-h5 font-semibold text-volt-500"
                          : "p-4 font-medium text-fg-muted"
                      }
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.label} className="group border-t border-line">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-bg p-4 font-medium text-fg group-hover:bg-surface-1"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, i) => (
                      <td
                        key={columns[i]}
                        className={
                          i === 3
                            ? "bg-volt-950 p-4 font-medium text-fg"
                            : "p-4 text-fg-muted group-hover:bg-surface-1"
                        }
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p aria-hidden className="mt-3 text-caption text-fg-subtle lg:hidden">
            Swipe to compare →
          </p>
        </div>

        <div data-reveal>
          <Button
            asChild
            variant="secondary"
            size="lg"
            iconRight="arrow"
            className="max-sm:h-auto max-sm:min-h-14 max-sm:w-full max-sm:py-3 max-sm:text-center max-sm:whitespace-normal"
          >
            <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
              Run the numbers for your team
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
