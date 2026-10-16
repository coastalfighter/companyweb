"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { addBusinessHours, formatReplyBy } from "@/lib/contact/reply-by";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";
import { RESULT_STORAGE_KEY } from "./contact-form";

interface StoredResult {
  firstName: string;
  services: string[];
  at: number;
}

function readResult(): string | null {
  try {
    return sessionStorage.getItem(RESULT_STORAGE_KEY);
  } catch {
    return null;
  }
}

const subscribe = () => () => {};

/**
 * Thank-you content (blueprint 11.5). Reads the first name the visitor just entered
 * from sessionStorage (no personal data in the URL), and estimates the reply time
 * from business hours. Falls back to a generic greeting on a direct visit.
 */
export function ThankYou() {
  const raw = useSyncExternalStore(subscribe, readResult, () => null);
  let result: StoredResult | null = null;
  try {
    result = raw ? (JSON.parse(raw) as StoredResult) : null;
  } catch {
    result = null;
  }

  const sentAt = result ? new Date(result.at) : null;
  const replyBy = sentAt ? formatReplyBy(addBusinessHours(sentAt, 4), sentAt) : null;
  const related = services.filter((s) => result?.services.includes(s.slug)).slice(0, 2);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-h1 font-semibold text-fg">
        {result?.firstName ? `Got it, ${result.firstName}.` : "Got it."} A real person is reading this now.
      </h1>
      <p className="max-w-[56ch] text-body-lg text-fg-muted">
        {replyBy
          ? `You'll hear from us by ${replyBy}, with a few times for a 20-minute call.`
          : `You'll hear from us within ${siteConfig.replySla}, with a few times for a 20-minute call.`}{" "}
        A confirmation is on its way to your inbox; if it isn&apos;t there in a few minutes, check spam or
        email{" "}
        <a href={`mailto:${siteConfig.email}`} className="text-fg underline underline-offset-4">
          {siteConfig.email}
        </a>
        .
      </p>
      <div className="flex flex-col gap-3">
        <h2 className="text-h5 font-semibold text-fg">While you wait</h2>
        <ul className="flex flex-col gap-2 text-body-sm">
          {related.map((service) => (
            <li key={service.slug}>
              <Link
                href={service.href}
                className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
              >
                How {service.name.toLowerCase()} works with us
                <ArrowRightIcon aria-hidden className="size-4 text-accent-text" />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/services#engagement-models"
              className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
            >
              How engagements are structured and billed
              <ArrowRightIcon aria-hidden className="size-4 text-accent-text" />
            </Link>
          </li>
          <li>
            <Link href="/" className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg">
              Back to the homepage
              <ArrowRightIcon aria-hidden className="size-4 text-accent-text" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
