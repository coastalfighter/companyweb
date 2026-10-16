import Link from "next/link";
import { prefetchFor } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70svh] flex-col justify-center pt-32 pb-24">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-6 max-w-[16ch] font-display text-h1 font-semibold text-fg">
        This page isn&apos;t part of the operation.
      </h1>
      <p className="mt-6 max-w-[52ch] text-body-lg text-fg-muted">
        It may have moved, or it was one of the spam pages we removed from the old site. Everything we do is
        one click away.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" iconRight="arrow">
          <Link href="/">Back to the homepage</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/contact" prefetch={prefetchFor("/contact")}>
            Talk to us
          </Link>
        </Button>
      </div>
    </Container>
  );
}
