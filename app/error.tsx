"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { siteConfig } from "@/lib/site";

/** Branded 500 inside the site chrome (header and footer still work). */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  // Show the server-log reference (error.digest), never the message.
  const reference =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;
  return (
    <Container className="flex min-h-[70svh] flex-col justify-center pt-32 pb-24">
      <Eyebrow>Error</Eyebrow>
      <h1 className="mt-6 max-w-[18ch] font-display text-h1 font-semibold text-fg">
        Something broke on our side.
      </h1>
      <p className="mt-6 max-w-[52ch] text-body-lg text-fg-muted">
        It&apos;s been logged and it&apos;s ours to fix. Try again, or email{" "}
        <a href={`mailto:${siteConfig.email}`} className="text-fg underline underline-offset-4">
          {siteConfig.email}
        </a>{" "}
        and we&apos;ll answer directly.
      </p>
      {reference ? <p className="mt-4 font-mono text-caption text-fg-muted">Reference: {reference}</p> : null}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button type="button" size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/">Back to the homepage</Link>
        </Button>
      </div>
    </Container>
  );
}
