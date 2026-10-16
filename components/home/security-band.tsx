import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "@phosphor-icons/react/ssr";
import { Eyebrow } from "@/components/ui/eyebrow";
import { proof } from "@/content/proof";
import { prefetchFor } from "@/lib/site";

/** Practices (shown). Certifications are added only when `proof.certifications` says they're held. */
const practices = [
  "Background-checked staff",
  "NDA signed before scoping",
  "SSO + hardware-key MFA on all staff accounts",
  "Least-privilege access, revoked within 1 hour of offboarding",
  "Encrypted at rest (AES-256) and in transit (TLS 1.3)",
  "GDPR / CCPA DPAs available",
] as const;

/** Homepage 1.10: a deliberate register shift to the Steel canvas. */
export function SecurityBand({
  certifications = proof.certifications,
}: {
  certifications?: typeof proof.certifications;
}) {
  const controls = [
    ...(certifications.soc2Type2 ? ["SOC 2 Type II audited"] : []),
    ...(certifications.iso27001 ? ["ISO/IEC 27001 certified"] : []),
    ...practices,
  ];

  return (
    <section aria-labelledby="security-title" className="bg-steel-900 py-(--section-y)">
      <div className="mx-auto grid max-w-(--container-content) gap-12 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div data-reveal className="flex flex-col gap-5 lg:col-span-5">
          <Eyebrow>Security</Eyebrow>
          <h2 id="security-title" className="heading-depth font-display text-h2 font-semibold text-fg">
            Your data is safer with us than in most inboxes.
          </h2>
          <p className="text-body-lg text-fg-muted">
            We handle payroll files, employment contracts and production code. So we built the controls before
            we built the sales team.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/about/security"
              prefetch={prefetchFor("/about/security")}
              className="link-sweep group inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
            >
              Visit the trust center
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
              />
            </Link>
            {certifications.soc2Type2 ? (
              <Link
                href="/contact?topic=security"
                prefetch={prefetchFor("/contact")}
                className="text-body-sm font-medium text-fg-muted underline underline-offset-4 hover:text-fg"
              >
                Request our SOC 2 report
              </Link>
            ) : null}
          </div>
        </div>

        <ul
          data-reveal
          className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2 lg:col-span-6 lg:col-start-7"
        >
          {controls.map((control) => (
            <li key={control} className="flex items-start gap-3 text-body-sm text-ink-100">
              <ShieldCheckIcon aria-hidden weight="light" className="mt-px size-5 shrink-0 text-volt-500" />
              {control}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
