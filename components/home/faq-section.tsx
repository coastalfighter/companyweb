import { PlusIcon } from "@phosphor-icons/react/ssr";
import { type FaqItem } from "@/content/faq";
import { serializeJsonLd } from "@/lib/json-ld";
import { Eyebrow } from "@/components/ui/eyebrow";

export type { FaqItem } from "@/content/faq";

/**
 * Homepage FAQ copy (blueprint 1.12). "Where is your team located?" is held back
 * until the locations are confirmed. Answers state policies Akrostech must confirm
 * (see README "Claims to confirm").
 */
export const homeFaqs: readonly FaqItem[] = [
  {
    id: "fit",
    question: "What if the person assigned to us isn't a fit?",
    answer:
      "Tell your lead. We'll replace them within 5 business days at no cost, with a proper handover. It's happened; it's in our process.",
  },
  {
    id: "pricing",
    question: "How do you price?",
    answer:
      "A fixed monthly fee per dedicated role, or a monthly retainer for a pool of hours. No setup fees. You'll have a written quote within 48 hours of your scoping call.",
  },
  {
    id: "contract",
    question: "Do we have to sign a long contract?",
    answer:
      "No. 90-day initial term, then month-to-month with 30 days' notice. If we're not earning the renewal, we shouldn't get it.",
  },
  {
    id: "access",
    question: "How do you handle access to our systems?",
    answer:
      "Through accounts you create and control, with SSO where you have it. We follow least-privilege access, log everything, and revoke access within an hour of any change.",
  },
  {
    id: "tools",
    question: "Can you work in our tools?",
    answer:
      "Yes, that's the default. We already work in Slack, Teams, Jira, Linear, Asana, HubSpot, Salesforce, QuickBooks, Xero, NetSuite, Gusto, Rippling, Greenhouse, Lever, Ironclad and DocuSign, among others.",
  },
  {
    id: "firm",
    question: "Are you a law firm or an accounting firm?",
    answer:
      "No. Our legal team supports your counsel; it doesn't replace them. Our accounting team runs your bookkeeping and payroll; audits and tax filings stay with your CPA. We make both of them faster and cheaper to work with.",
  },
];

/** schema.org FAQPage, escaped per the Next.js JSON-LD guide. */
export function faqJsonLd(items: readonly FaqItem[]): string {
  return serializeJsonLd({
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}

/**
 * Homepage 1.12. Native <details name="faq"> gives a single-open accordion with no JS
 * (blueprint G5); the first item starts open; each item is deep-linkable (#faq-<id>).
 */
export interface FaqSectionProps {
  items?: readonly FaqItem[];
  title?: string;
}

export function FaqSection({
  items = homeFaqs,
  title = "Questions buyers ask us on the first call.",
}: FaqSectionProps) {
  return (
    <section aria-labelledby="faq-title" className="py-(--section-y)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(items) }} />
      <div className="mx-auto grid max-w-(--container-content) gap-10 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div data-reveal className="flex flex-col gap-5 lg:sticky lg:top-32">
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="faq-title" className="font-display text-h2 font-semibold text-fg">
              {title}
            </h2>
          </div>
        </div>
        <div data-reveal className="border-t border-line lg:col-span-7 lg:col-start-6">
          {items.map((item, i) => (
            <details
              key={item.id}
              id={`faq-${item.id}`}
              name="faq"
              open={i === 0}
              className="faq group border-b border-line"
            >
              <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-h5 font-semibold text-fg [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-150 group-hover:bg-ink-800"
                >
                  <PlusIcon className="size-4 text-fg-subtle transition-transform duration-200 ease-out-expo group-open:rotate-45" />
                </span>
              </summary>
              <p className="max-w-[68ch] pb-6 text-body text-fg-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
