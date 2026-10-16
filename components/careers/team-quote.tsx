import { careersFacts as verifiedFacts, type CareersFacts } from "@/content/careers";
import { initials } from "@/content/company";

/** 12.6: a real employee's words only. */
export function TeamQuote({ facts = verifiedFacts }: { facts?: CareersFacts }) {
  const quote = facts.quote;
  if (!quote) return null;
  return (
    <section aria-label="From the team" className="border-y border-line bg-surface-1 py-(--section-y)">
      <figure className="mx-auto flex max-w-(--container-prose) flex-col gap-8 px-(--gutter)">
        <blockquote className="font-display text-h3 font-medium text-fg">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <figcaption className="flex items-center gap-4">
          {quote.photo ? (
            // A 56px avatar: a plain <img> keeps next/image's client code (~7 KB) off /careers.
            // Supply the photo pre-sized (112×112 for 2× screens).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={quote.photo}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="size-14 rounded-full object-cover grayscale"
            />
          ) : (
            <span
              aria-hidden
              className="grid size-14 place-items-center rounded-full bg-surface-3 font-display text-body font-semibold text-fg-muted"
            >
              {initials(quote.name)}
            </span>
          )}
          <span className="flex flex-col">
            <span className="text-body font-semibold text-fg">{quote.name}</span>
            <span className="text-body-sm text-fg-muted">{quote.role}</span>
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
