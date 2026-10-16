"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react/ssr";
import { TurnstileWidget } from "@/components/contact/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type CalculatorInput } from "@/lib/calculator/model";
import { siteConfig } from "@/lib/site";

export const REPORT_ENDPOINT = "/api/calculator/report";

type ReportField = "name" | "email" | "company";
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; emailed: boolean; email: string }
  | { kind: "error"; message: string };

export interface ReportFormProps {
  input: CalculatorInput;
  /** False until the calculator has a result worth reporting. */
  available: boolean;
  turnstileSiteKey?: string;
}

/** Saves a Blob as a file via a temporary object URL. */
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * "Email me the PDF" (blueprint F4): gated by name + work email only. The report
 * downloads straight away and, when email is configured, a copy is sent too; the
 * message says which actually happened.
 */
export function ReportForm({ input, available, turnstileSiteKey }: ReportFormProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Partial<Record<ReportField, string>>>({});
  const [turnstileWanted, setTurnstileWanted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => {
      const v = form.get(key);
      return typeof v === "string" ? v : "";
    };
    const payload = {
      name: value("name"),
      email: value("email"),
      company: value("company"),
      website: value("website"),
      turnstileToken: value("cf-turnstile-response") || undefined,
      input,
    };
    const local: Partial<Record<ReportField, string>> = {};
    if (!payload.name.trim()) local.name = "Add your name so we know who the report is for.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim()))
      local.email = "That doesn't look like an email address.";
    setErrors(local);
    if (Object.keys(local).length > 0) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${Object.keys(local)[0]}"]`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch(REPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        download(await response.blob(), "akrostech-back-office-cost-report.pdf");
        setStatus({
          kind: "done",
          emailed: response.headers.get("X-Report-Emailed") === "true",
          email: payload.email.trim(),
        });
        return;
      }
      const body = (await response.json().catch(() => ({}))) as {
        errors?: Partial<Record<ReportField, string>>;
        error?: string;
      };
      if (body.errors) {
        setErrors(body.errors);
        setStatus({ kind: "idle" });
        return;
      }
      setStatus({ kind: "error", message: body.error ?? "The report didn't generate. Try again." });
    } catch {
      setStatus({
        kind: "error",
        message: `We couldn't reach the server. Check your connection, or email ${siteConfig.email}.`,
      });
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="lg"
        fullWidth
        disabled={!available}
        aria-expanded={false}
        aria-controls={`${id}-form`}
        onClick={() => setOpen(true)}
      >
        <DownloadSimpleIcon aria-hidden className="size-4" />
        Email me the PDF
      </Button>
    );
  }

  return (
    <form
      id={`${id}-form`}
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={() => setTurnstileWanted(true)}
      aria-label="Get the PDF report"
      className="flex flex-col gap-4 rounded-lg border border-line bg-surface-1 p-5"
    >
      <p className="text-body-sm text-fg-muted">
        The full report with the method behind every number. Just your name and work email; no sales sequence.
      </p>
      <Field label="Name" required error={errors.name}>
        <Input name="name" autoComplete="name" maxLength={80} autoFocus />
      </Field>
      <Field label="Work email" required error={errors.email}>
        <Input name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} />
      </Field>
      <Field label="Company" hint="Optional. Printed on the report." error={errors.company}>
        <Input name="company" autoComplete="organization" maxLength={120} />
      </Field>
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} load={turnstileWanted} /> : null}
      <Button type="submit" size="lg" fullWidth disabled={status.kind === "sending" || !available}>
        {status.kind === "sending" ? "Preparing your report…" : "Get the PDF"}
      </Button>
      <p role="status" className="text-body-sm text-fg-muted empty:hidden">
        {status.kind === "done"
          ? status.emailed
            ? `Downloaded. A copy is on its way to ${status.email}.`
            : "Downloaded. Check your downloads folder."
          : ""}
      </p>
      {status.kind === "error" ? (
        <p role="alert" className="text-body-sm text-error">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
