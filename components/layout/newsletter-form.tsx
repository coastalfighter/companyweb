"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, CircleNotchIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Footer newsletter (§9). Rendered only when HUBSPOT_NEWSLETTER_FORM_ID is set, so
 * the site never shows a sign-up that goes nowhere. The submit arrow slides in when
 * the field has focus; states are announced (aria-live) and the error names the fix.
 */
export function NewsletterForm() {
  const id = useId();
  const [state, setState] = useState<State>({ kind: "idle" });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!EMAIL.test(email)) {
      setState({ kind: "error", message: "Enter a valid email address, like name@company.com." });
      return;
    }
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: String(form.get("website") ?? ""),
          page: window.location.pathname,
        }),
      });
      if (response.ok) {
        setState({ kind: "done" });
        return;
      }
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setState({ kind: "error", message: data.error ?? "That didn't go through. Try again in a minute." });
    } catch {
      setState({ kind: "error", message: "You seem to be offline. Try again when you're connected." });
    }
  };

  if (state.kind === "done") {
    return (
      <p role="status" className="flex items-center gap-2 text-body-sm text-fg">
        <CheckIcon aria-hidden weight="bold" className="size-4 text-volt-500" />
        Subscribed. One email a month, unsubscribe any time.
      </p>
    );
  }

  const error = state.kind === "error" ? state.message : null;
  return (
    <form
      noValidate
      onSubmit={(e) => void onSubmit(e)}
      className="newsletter flex w-full max-w-sm flex-col gap-2"
    >
      <label htmlFor={`${id}-email`} className="text-body-sm font-medium text-fg">
        The monthly ops note
      </label>
      <div
        className={cn(
          "flex h-12 items-center rounded-md border bg-surface-1 pr-1 pl-4 transition-colors duration-200 focus-within:border-volt-500",
          error ? "border-error" : "border-line-strong",
        )}
      >
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint`}
          className="min-w-0 flex-1 bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle"
        />
        {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={state.kind === "sending"}
          className="newsletter-submit inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-sm bg-accent px-3 text-body-sm font-medium text-on-accent disabled:opacity-70"
        >
          {state.kind === "sending" ? <CircleNotchIcon aria-hidden className="size-4 animate-spin" /> : null}
          Subscribe
          {state.kind === "sending" ? null : <ArrowRightIcon aria-hidden className="size-4" />}
        </button>
      </div>
      <p
        id={`${id}-hint`}
        aria-live="polite"
        className={cn("text-caption", error ? "text-error" : "text-fg-subtle")}
      >
        {error ?? (
          <>
            One email a month: what we&apos;re seeing in back-office work. See our{" "}
            <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-fg">
              privacy policy
            </Link>
            .
          </>
        )}
      </p>
    </form>
  );
}
