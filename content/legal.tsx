import Link from "next/link";
import { type LegalSection } from "@/components/legal/legal-document";
import { proof } from "@/content/proof";
import { siteConfig } from "@/lib/site";
import {
  browserStorageItems,
  LEGAL_LAST_UPDATED,
  securityPractices,
  trustFacts,
  websiteProcessors,
  type TrustFacts,
} from "./trust";

/**
 * The words on /about/security and /legal/*. Drafted from what this website
 * actually does (forms, integrations, browser storage); every page must be
 * reviewed by counsel before launch (README "Launch checklist"). Commitments only
 * Akrostech can make come from `trustFacts` and are left out until set.
 */

export interface DocumentContent {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const who = (facts: TrustFacts) => facts.legalEntity?.name ?? siteConfig.name;
const privacyEmail = (facts: TrustFacts) => facts.privacyEmail ?? siteConfig.email;
const mail = (address: string) => <a href={`mailto:${address}`}>{address}</a>;

function processorTable(env: NodeJS.ProcessEnv, facts: TrustFacts): LegalSection["blocks"] {
  const processors = websiteProcessors(env, facts);
  if (processors.length === 0) {
    return [
      { kind: "p", text: "This website doesn't currently send personal data to any third-party service." },
    ];
  }
  return [
    {
      kind: "table",
      caption: "Services this website uses",
      head: ["Service", "What for", "What they receive"],
      rows: processors.map((p) => [p.name, p.purpose, p.data]),
    },
  ];
}

/* ---------- Privacy ---------- */

export function privacyContent(
  env: NodeJS.ProcessEnv = process.env,
  facts: TrustFacts = trustFacts,
): DocumentContent {
  const entity = facts.legalEntity;
  return {
    title: "Privacy policy",
    intro: `What this website collects about you, why, who else sees it, and how to make us change or delete it. Plain English first; nothing hidden in the small print.`,
    sections: [
      {
        id: "who-we-are",
        heading: "Who we are",
        blocks: [
          {
            kind: "p",
            text: (
              <>
                {who(facts)}
                {entity ? ` (${entity.address})` : ""} runs this website and decides how the personal data it
                collects is used. Questions or requests: {mail(privacyEmail(facts))}.
              </>
            ),
          },
          {
            kind: "p",
            text: "This policy covers the website. Data we handle for clients during an engagement is governed by our contract and Data Processing Addendum with that client.",
          },
        ],
      },
      {
        id: "what-we-collect",
        heading: "What we collect",
        blocks: [
          {
            kind: "list",
            items: [
              <>
                <strong>When you contact us:</strong> your name, work email, company, company size, the
                services you&apos;re interested in, your timeline, whether you want an NDA first, an optional
                phone number and your message. If you used the cost calculator first, the inputs you entered
                there are sent too.
              </>,
              <>
                <strong>When you ask for the calculator report:</strong> your name, email, optional company,
                and the calculator inputs.
              </>,
              <>
                <strong>Where you came from:</strong> campaign tags in the link you followed (UTM parameters),
                the referring site and your first page here. These are kept in your browser for the session
                and sent only with an enquiry.
              </>,
              <>
                <strong>Technical data:</strong> your IP address and browser details, used to stop spam and
                abuse and kept in our hosting provider&apos;s logs.
              </>,
              <>
                <strong>Job applications</strong> are made on our applicant-tracking provider&apos;s site,
                which shows its own notice.
              </>,
            ],
          },
          {
            kind: "p",
            text: "We don't ask for, and you shouldn't send us, sensitive data such as health information or government ID numbers through this website.",
          },
        ],
      },
      {
        id: "why",
        heading: "Why we use it",
        blocks: [
          {
            kind: "list",
            items: [
              "To reply to your enquiry and, if you ask, prepare a proposal (steps before a contract, and our legitimate interest in answering people who contact us).",
              "To send the calculator report you asked for.",
              "To keep the website and its forms secure, including rate limits and bot checks (legitimate interests).",
              "To understand which pages help people, only if you allow anonymous analytics (consent).",
            ],
          },
          {
            kind: "p",
            text: "We don't sell personal data, share it for cross-context behavioral advertising, or use it for automated decisions about you.",
          },
        ],
      },
      { id: "who-sees-it", heading: "Who else sees it", blocks: processorTable(env, facts) },
      {
        id: "how-long",
        heading: "How long we keep it",
        blocks: [
          {
            kind: "list",
            items: [
              "Enquiries and report requests: for as long as we need them to respond and to manage our relationship with you, then deleted.",
              "Rate-limit records (your IP address): one hour.",
              <>
                What&apos;s stored in your browser: see the{" "}
                <Link href="/legal/cookies">cookies and storage policy</Link>.
              </>,
            ],
          },
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights",
        blocks: [
          {
            kind: "p",
            text: "Depending on where you live (for example under the GDPR, UK GDPR or California's CCPA/CPRA), you can ask us to: show you the data we hold about you; correct it; delete it; stop or limit using it; give you a copy to take elsewhere; and withdraw any consent you gave. We won't treat you differently for asking.",
          },
          {
            kind: "p",
            text: (
              <>
                Email {mail(privacyEmail(facts))} from the address you used with us. If you&apos;re unhappy
                with our answer you can complain to your local data-protection authority.
              </>
            ),
          },
        ],
      },
      {
        id: "transfers",
        heading: "International transfers",
        blocks: [
          {
            kind: "p",
            text: "Some of the services above process data outside your country, including in the United States. Where the law requires it, we rely on safeguards such as the European Commission's Standard Contractual Clauses.",
          },
        ],
      },
      {
        id: "security",
        heading: "Security",
        blocks: [
          {
            kind: "p",
            text: (
              <>
                How we protect data, here and in client work, is set out in our{" "}
                <Link href="/about/security">trust center</Link>.
              </>
            ),
          },
        ],
      },
      {
        id: "children",
        heading: "Children",
        blocks: [
          { kind: "p", text: "This website is for businesses and isn't directed at children under 16." },
        ],
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        blocks: [
          {
            kind: "p",
            text: "When we change this policy we'll update the date at the top. Significant changes will be highlighted on this page.",
          },
        ],
      },
    ],
  };
}

/* ---------- Terms ---------- */

export function termsContent(facts: TrustFacts = trustFacts): DocumentContent {
  const sections: LegalSection[] = [
    {
      id: "about",
      heading: "About these terms",
      blocks: [
        {
          kind: "p",
          text: `These terms cover your use of this website, run by ${who(facts)}. Our services are provided under a separate written agreement; nothing here creates one.`,
        },
      ],
    },
    {
      id: "using-the-site",
      heading: "Using the site",
      blocks: [
        {
          kind: "list",
          items: [
            "Use it lawfully, and only to learn about us or to contact us.",
            "Don't try to break, overload or get around its security, or use automated tools to send forms.",
            <>
              Found a security issue? Please report it as described in our{" "}
              <Link href="/about/security#disclosure">disclosure policy</Link>.
            </>,
          ],
        },
      ],
    },
    {
      id: "no-advice",
      heading: "Estimates, not quotes or advice",
      blocks: [
        {
          kind: "p",
          text: "The cost calculator and its report are estimates from the figures you enter. They are not a quote, an offer or financial advice; prices are agreed only in a written proposal.",
        },
        {
          kind: "p",
          text: `${siteConfig.name} is not a law firm or a CPA firm. Nothing on this site is legal, accounting or tax advice; our legal team supports your counsel and our accounting team works alongside your CPA.`,
        },
      ],
    },
    {
      id: "ip",
      heading: "Our content",
      blocks: [
        {
          kind: "p",
          text: "The text, design, code and graphics on this site belong to us or our licensors. You may share links and quote short passages with credit; please ask before reusing anything else.",
        },
      ],
    },
    {
      id: "links",
      heading: "Other websites",
      blocks: [
        {
          kind: "p",
          text: "Links to other websites (for example, our job board) are for convenience. Those sites have their own terms and privacy policies.",
        },
      ],
    },
    {
      id: "liability",
      heading: "Our responsibility",
      blocks: [
        {
          kind: "p",
          text: "We work to keep the site accurate and available, but it is provided as it is. To the extent the law allows, we are not liable for losses from relying on its content or from it being unavailable. Nothing in these terms limits liability that can't be limited by law.",
        },
      ],
    },
  ];
  if (facts.legalEntity?.jurisdiction) {
    sections.push({
      id: "law",
      heading: "Governing law",
      blocks: [
        { kind: "p", text: `These terms are governed by the laws of ${facts.legalEntity.jurisdiction}.` },
      ],
    });
  }
  sections.push({
    id: "contact",
    heading: "Changes and contact",
    blocks: [
      {
        kind: "p",
        text: (
          <>
            We may update these terms; the date at the top shows the latest version. Questions:{" "}
            {mail(siteConfig.email)}.
          </>
        ),
      },
    ],
  });
  return {
    title: "Terms of use",
    intro:
      "The rules for using this website. Short, because the important promises are in the agreements we sign with clients.",
    sections,
  };
}

/* ---------- Cookies & storage ---------- */

export function cookiesContent(env: NodeJS.ProcessEnv = process.env): DocumentContent {
  const turnstile = Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
  return {
    title: "Cookies and browser storage",
    intro:
      "This website sets no cookies of its own. It keeps a few things in your browser so forms and the calculator don't lose your work; here is every one of them.",
    sections: [
      {
        id: "what-we-store",
        heading: "What we store in your browser",
        blocks: [
          {
            kind: "table",
            caption: "Browser storage used by this website",
            head: ["Name", "Where", "Why", "How long"],
            rows: browserStorageItems(env).map((item) => [
              <code key="k" className="font-mono text-caption">
                {item.key}
              </code>,
              item.where,
              item.purpose,
              item.lasts,
            ]),
          },
          {
            kind: "p",
            text: "None of this is sent to us unless you submit a form, and none of it is used for advertising.",
          },
        ],
      },
      ...(env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
        ? [
            {
              id: "analytics",
              heading: "Analytics",
              blocks: [
                {
                  kind: "p" as const,
                  text: "We use PostHog to count visits and see which pages and buttons help, and only if you choose “Allow”. It stores an anonymous ID in your browser (no cookies), records page views and a few named actions such as starting the cost calculator, and never records what you type into a form. Change your mind any time under “Analytics settings” at the bottom of every page; a Global Privacy Control signal from your browser counts as “No thanks”.",
                },
              ],
            },
          ]
        : []),
      {
        id: "third-parties",
        heading: "Third-party services",
        blocks: [
          {
            kind: "list",
            items: [
              ...(turnstile
                ? [
                    "Cloudflare Turnstile loads on our forms only once you start filling one in. It checks your browser to tell people from bots, under Cloudflare's own privacy terms.",
                  ]
                : []),
              "Our job board and booking pages are run by third parties and set their own cookies under their own policies.",
            ],
          },
        ],
      },
      {
        id: "control",
        heading: "Your control",
        blocks: [
          {
            kind: "p",
            text: "You can clear all of it from your browser settings at any time. In the calculator, “Start over” clears your saved inputs.",
          },
        ],
      },
    ],
  };
}

/* ---------- DPA ---------- */

export function dpaContent(): DocumentContent {
  return {
    title: "Data Processing Addendum",
    intro:
      "When we handle personal data for you, such as payroll files, candidate records or contracts, we do it under a Data Processing Addendum signed alongside our agreement.",
    sections: [
      {
        id: "who-needs-it",
        heading: "Who needs it",
        blocks: [
          {
            kind: "p",
            text: "Any client whose work with us involves personal data, which is most of them. It's signed before any data is shared, together with the mutual NDA.",
          },
        ],
      },
      {
        id: "what-it-covers",
        heading: "What it covers",
        blocks: [
          {
            kind: "list",
            items: [
              "We process your data only on your documented instructions, and for no other purpose.",
              "Everyone on your team is bound by confidentiality.",
              "The security measures we apply, and how we keep them current.",
              "Which sub-processors we use, and notice before we add one.",
              "Help with your obligations, including requests from the people whose data it is.",
              "Telling you about a personal data breach without undue delay.",
              "Returning or deleting your data when the engagement ends.",
              "Your right to audit our compliance.",
              "Standard Contractual Clauses for international transfers, where they apply.",
            ],
          },
        ],
      },
      {
        id: "get-it",
        heading: "Getting a copy",
        blocks: [
          {
            kind: "p",
            text: (
              <>
                Ask for it with your security review and we&apos;ll send it with our policies and
                sub-processor list: <Link href="/contact?topic=security">request the security pack</Link>.
              </>
            ),
          },
        ],
      },
    ],
  };
}

/* ---------- Accessibility ---------- */

export function accessibilityContent(): DocumentContent {
  return {
    title: "Accessibility statement",
    intro:
      "We want everyone to be able to use this website, including people who use a keyboard, a screen reader, magnification or reduced motion.",
    sections: [
      {
        id: "standard",
        heading: "Our standard",
        blocks: [
          {
            kind: "p",
            text: "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA.",
          },
        ],
      },
      {
        id: "how",
        heading: "How we check",
        blocks: [
          {
            kind: "list",
            items: [
              "Every page is scanned for WCAG 2.1 A and AA issues with axe on every change, on desktop and mobile, before it's merged.",
              "Everything works with a keyboard, with a visible focus outline and a “Skip to content” link.",
              "Text and controls meet AA contrast; colors are checked as design tokens, not page by page.",
              "Animation is decorative and stops when your device asks for reduced motion.",
              "Pages work at 320px wide and when zoomed to 200%, without sideways scrolling.",
              "Form errors are listed at the top, linked to their fields, and announced to screen readers.",
            ],
          },
        ],
      },
      {
        id: "known-issues",
        heading: "Known limitations",
        blocks: [
          {
            kind: "list",
            items: [
              "The PDF report from the cost calculator isn't yet tagged for screen readers. The same numbers and method are on the calculator page itself.",
              "Names in non-Latin scripts don't print correctly in that PDF yet.",
              "Our job applications and the bot check on our forms are provided by third parties, whose accessibility we don't control. If either blocks you, email us and we'll help directly.",
            ],
          },
        ],
      },
      {
        id: "feedback",
        heading: "Tell us",
        blocks: [
          {
            kind: "p",
            text: (
              <>
                If something doesn&apos;t work for you, email {mail(siteConfig.email)} with the page and what
                happened. A person reads every message, and we&apos;ll get you the information another way
                while we fix it.
              </>
            ),
          },
        ],
      },
    ],
  };
}

/* ---------- Trust Center ---------- */

const reportDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export function trustContent(
  env: NodeJS.ProcessEnv = process.env,
  facts: TrustFacts = trustFacts,
): DocumentContent {
  const sections: LegalSection[] = [];

  if (facts.certifications.length > 0) {
    sections.push({
      id: "certifications",
      heading: "Certifications",
      blocks: [
        {
          kind: "table",
          caption: "Certifications held",
          head: ["Certification", "Auditor", "Latest report"],
          rows: facts.certifications.map((c) => [
            c.name,
            c.auditor,
            reportDate.format(new Date(`${c.reportDate}T00:00:00Z`)),
          ]),
        },
      ],
    });
  }

  sections.push({
    id: "practices",
    heading: "How we protect your data",
    blocks: [
      { kind: "list", items: [...securityPractices] },
      ...(facts.staffVetting
        ? [
            {
              kind: "p" as const,
              text: (
                <>
                  <strong>Staff vetting:</strong> {facts.staffVetting}
                </>
              ),
            },
          ]
        : []),
      ...(facts.insurance
        ? [
            {
              kind: "p" as const,
              text: (
                <>
                  <strong>Insurance:</strong> {facts.insurance}
                </>
              ),
            },
          ]
        : []),
    ],
  });

  sections.push({
    id: "client-data",
    heading: "Client data",
    blocks: [
      {
        kind: "p",
        text: (
          <>
            We work inside your systems, through accounts you create and control. What we may do with personal
            data is set by our <Link href="/legal/dpa">Data Processing Addendum</Link>, signed before any data
            is shared.
          </>
        ),
      },
      ...(facts.clientDataRetention
        ? [
            {
              kind: "p" as const,
              text: (
                <>
                  <strong>Retention:</strong> {facts.clientDataRetention}
                </>
              ),
            },
          ]
        : []),
    ],
  });

  sections.push({
    id: "sub-processors",
    heading: "Sub-processors for this website",
    blocks: [
      ...processorTable(env, facts),
      {
        kind: "p",
        text: "The sub-processors used in client engagements are listed in our DPA, and you get notice before we add one.",
      },
    ],
  });

  if (facts.incidentResponse) {
    sections.push({
      id: "incidents",
      heading: "Incident response",
      blocks: [{ kind: "p", text: facts.incidentResponse }],
    });
  }

  if (proof.stats.length > 0) {
    sections.push({
      id: "methodology",
      heading: "How we measure our numbers",
      blocks: [
        {
          kind: "table",
          caption: "Sources for the figures on this site",
          head: ["Figure", "Source"],
          rows: proof.stats.map((s) => [`${s.value}${s.unit ?? ""} ${s.label}`, s.source]),
        },
        ...(proof.statsFootnote ? [{ kind: "p" as const, text: proof.statsFootnote }] : []),
      ],
    });
  }

  sections.push({
    id: "disclosure",
    heading: "Reporting a vulnerability",
    blocks: [
      {
        kind: "p",
        text: (
          <>
            If you think you&apos;ve found a security issue in this website or our systems, email{" "}
            {mail(siteConfig.email)} with the details and steps to reproduce it. Please don&apos;t access data
            that isn&apos;t yours, disrupt the service or make the issue public before we&apos;ve fixed it. We
            won&apos;t take legal action against good-faith research that follows these rules, and we&apos;ll
            keep you updated until it&apos;s resolved. Our{" "}
            <a href="/.well-known/security.txt">security.txt</a> has the same details.
          </>
        ),
      },
    ],
  });

  if (facts.statusPageUrl) {
    sections.push({
      id: "status",
      heading: "Service status",
      blocks: [
        {
          kind: "p",
          text: (
            <a href={facts.statusPageUrl} rel="noopener">
              Live status page
            </a>
          ),
        },
      ],
    });
  }

  sections.push({
    id: "documents",
    heading: "Security documents",
    blocks: [
      {
        kind: "p",
        text: (
          <>
            Running a security review? We&apos;ll send our DPA, access policy and sub-processor list
            {facts.certifications.length > 0 ? ", and our audit reports under NDA," : ""} before your first
            call: <Link href="/contact?topic=security">request the security pack</Link>.
          </>
        ),
      },
    ],
  });

  return {
    title: "Security & trust",
    intro: `We handle payroll files, employment contracts and production code, so this page sets out exactly how. Everything here is current as of ${reportDate.format(new Date(`${LEGAL_LAST_UPDATED}T00:00:00Z`))}.`,
    sections,
  };
}
