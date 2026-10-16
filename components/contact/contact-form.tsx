"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { submitContact } from "@/app/contact/actions";
import { readStoredAttribution } from "@/components/layout/attribution-tracker";
import { track } from "@/lib/analytics/track";
import { readSavedCalculatorRaw } from "@/lib/calculator/saved";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type ContactPrefill } from "@/lib/contact/prefill";
import {
  COMPANY_SIZES,
  DETAILS_MAX,
  HONEYPOT_FIELD,
  SERVICE_OPTIONS,
  TIMELINES,
  isPersonalEmail,
  validateContact,
  validateField,
  type ContactField,
  type ContactInput,
  type FieldErrors,
  type ServiceOption,
} from "@/lib/contact/schema";
import { initialContactState } from "@/lib/contact/state";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "./turnstile-widget";

export const DRAFT_STORAGE_KEY = "akros:contact-draft";
export const RESULT_STORAGE_KEY = "akros:contact-result";

const FIELD_ORDER: ContactField[] = [
  "firstName",
  "lastName",
  "email",
  "company",
  "companySize",
  "services",
  "details",
  "phone",
];
const FIELD_LABELS: Record<ContactField, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Work email",
  company: "Company",
  companySize: "Company size",
  services: "What should we take off your plate?",
  details: "Details",
  timeline: "Timeline",
  nda: "NDA",
  phone: "Phone",
};

const fieldId = (field: ContactField) => `contact-${field}`;

const emptyInput: ContactInput = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  companySize: "" as ContactInput["companySize"],
  services: [],
  details: "",
  timeline: undefined,
  nda: false,
  phone: "",
};

function initialValues(prefill: ContactPrefill, restore: boolean): ContactInput {
  const base: ContactInput = {
    ...emptyInput,
    services: prefill.services,
    nda: prefill.nda,
    details: prefill.details,
  };
  if (!restore) return base;
  try {
    const draft = JSON.parse(
      sessionStorage.getItem(DRAFT_STORAGE_KEY) ?? "null",
    ) as Partial<ContactInput> | null;
    if (!draft) return base;
    // An explicit prefill (a service page CTA, ?topic=security) wins over the draft.
    return {
      ...base,
      ...draft,
      services: prefill.services.length ? prefill.services : (draft.services ?? []),
      nda: prefill.nda || Boolean(draft.nda),
      details: prefill.details || (draft.details ?? ""),
    };
  } catch {
    return base;
  }
}

export interface ContactFormProps {
  prefill: ContactPrefill;
  /** Restore an unsent draft from this session. Only safe when rendered client-side. */
  restoreDraft?: boolean;
  /** Marks the interactive (client) instance with data-ready, for tests and analytics. */
  ready?: boolean;
  turnstileSiteKey?: string;
}

/**
 * Contact form (docs/blueprint/06-cta-conversion.md, F3). Controlled inputs (so
 * nothing is lost on errors), validation on blur with the shared schema, an error
 * summary on submit, and the server action as the source of truth.
 */
export function ContactForm({
  prefill,
  restoreDraft = false,
  ready = false,
  turnstileSiteKey,
}: ContactFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitContact, initialContactState);
  const [values, setValues] = useState<ContactInput>(() => initialValues(prefill, restoreDraft));
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [editedSinceSubmit, setEditedSinceSubmit] = useState<ReadonlySet<ContactField>>(new Set());
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [showPhone, setShowPhone] = useState(() => values.phone !== "");
  const [turnstileWanted, setTurnstileWanted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const servicesLegendId = useId();

  const serverErrors: FieldErrors = state.status === "invalid" ? state.errors : {};
  const errorFor = (field: ContactField) =>
    editedSinceSubmit.has(field) ? clientErrors[field] : (clientErrors[field] ?? serverErrors[field]);
  const visibleErrors = FIELD_ORDER.filter((f) => errorFor(f));

  // Persist the draft for this session, once the visitor has actually typed something,
  // so a refresh or a failed send loses nothing.
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Storage unavailable: drafts are a convenience.
    }
  }, [values, dirty]);

  // React to the server's answer.
  useEffect(() => {
    if (state.status === "success") {
      track("form_submit", { form: "contact", services: state.services.length });
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        sessionStorage.setItem(
          RESULT_STORAGE_KEY,
          JSON.stringify({ firstName: state.firstName, services: state.services, at: Date.now() }),
        );
      } catch {
        // The thank-you page falls back to a generic greeting.
      }
      router.push("/contact/thank-you");
    } else if (state.status === "invalid") {
      summaryRef.current?.focus();
    } else if (state.status === "error") {
      alertRef.current?.focus();
    }
  }, [state, router]);

  // Move focus to the error summary after a blocked submit.
  useEffect(() => {
    if (submitAttempt > 0) summaryRef.current?.focus();
  }, [submitAttempt]);

  const update = <K extends keyof ContactInput>(field: K, value: ContactInput[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (!dirty) track("form_start", { form: "contact" });
    setDirty(true);
    setEditedSinceSubmit((prev) => new Set(prev).add(field as ContactField));
    // Once a field has shown an error, re-validate as the visitor fixes it.
    if (clientErrors[field as ContactField] !== undefined || serverErrors[field as ContactField]) {
      setClientErrors((prev) => ({ ...prev, [field]: validateField(field as ContactField, next) }));
    }
  };

  const blur = (field: ContactField) => {
    const error = validateField(field, values);
    // The field's name only, never its value.
    if (error && clientErrors[field] === undefined) track("form_field_error", { form: "contact", field });
    setClientErrors((prev) => ({ ...prev, [field]: error }));
  };

  const text = (field: "firstName" | "lastName" | "email" | "company" | "details" | "phone") => ({
    name: field,
    value: values[field],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, e.target.value),
    onBlur: () => blur(field),
  });

  const toggleService = (service: ServiceOption, checked: boolean) => {
    const set = new Set(values.services);
    if (checked) set.add(service);
    else set.delete(service);
    update(
      "services",
      SERVICE_OPTIONS.map((s) => s.value).filter((v) => set.has(v)),
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateContact(values);
    setEditedSinceSubmit(new Set());
    if (!result.ok) {
      setClientErrors(result.errors);
      setSubmitAttempt((n) => n + 1);
      return;
    }
    setClientErrors({});
    const data = new FormData(event.currentTarget);
    // Attribution recorded earlier in the session (no cookies).
    const stored = readStoredAttribution();
    for (const [key, value] of Object.entries(stored)) if (value) data.set(key, String(value));
    const hutk = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)?.[1];
    if (hutk) data.set("hutk", hutk);
    if (prefill.services[0]) data.set("service_param", prefill.services.join(","));
    // Calculator inputs, if they ran it (blueprint F4); the server re-validates them.
    const calculator = readSavedCalculatorRaw();
    if (calculator) data.set("calculator", calculator);
    // Not a native form action, so React doesn't reset the (controlled) fields.
    startTransition(() => action(data));
  };

  const emailWarning = !errorFor("email") && values.email.includes("@") && isPersonalEmail(values.email);

  return (
    <form
      noValidate
      data-ready={ready || undefined}
      onSubmit={onSubmit}
      onFocusCapture={() => setTurnstileWanted(true)}
      aria-describedby="contact-consent"
      className="flex flex-col gap-6"
    >
      {visibleErrors.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 p-4 text-body-sm text-ink-100 outline-none focus-visible:outline-2 focus-visible:outline-error"
        >
          <p className="flex items-center gap-2 font-medium text-error">
            <WarningCircleIcon aria-hidden className="size-4" />
            {visibleErrors.length === 1 ? "One thing to fix:" : `${visibleErrors.length} things to fix:`}
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-6">
            {visibleErrors.map((field) => (
              <li key={field}>
                <a
                  href={`#${fieldId(field)}`}
                  className="underline underline-offset-4 hover:text-fg"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(fieldId(field))?.focus();
                  }}
                >
                  {FIELD_LABELS[field]}: {errorFor(field)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={fieldId("firstName")} label="First name" required error={errorFor("firstName")}>
          <Input autoComplete="given-name" {...text("firstName")} />
        </Field>
        <Field id={fieldId("lastName")} label="Last name" required error={errorFor("lastName")}>
          <Input autoComplete="family-name" {...text("lastName")} />
        </Field>
      </div>

      <Field
        id={fieldId("email")}
        label="Work email"
        required
        error={errorFor("email")}
        hint={emailWarning ? "A work email helps us prepare. Personal is fine too." : undefined}
      >
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...text("email")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={fieldId("company")} label="Company" required error={errorFor("company")}>
          <Input autoComplete="organization" {...text("company")} />
        </Field>
        <Field id={fieldId("companySize")} label="Company size" required error={errorFor("companySize")}>
          <NativeSelect
            name="companySize"
            required
            placeholder="Choose one"
            value={values.companySize}
            onChange={(e) => update("companySize", e.target.value as ContactInput["companySize"])}
            onBlur={() => blur("companySize")}
          >
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} people
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>

      <fieldset
        id={fieldId("services")}
        tabIndex={-1}
        aria-describedby={errorFor("services") ? `${fieldId("services")}-error` : undefined}
        aria-invalid={errorFor("services") ? true : undefined}
        className="flex flex-col gap-3 outline-none"
      >
        <legend id={servicesLegendId} className="mb-3 text-body-sm font-medium text-ink-100">
          What should we take off your plate?
          <span className="text-fg-subtle">
            <span aria-hidden> *</span>
            <span className="sr-only"> (required)</span>
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((option) => {
            const checked = values.services.includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3.5 text-body-sm font-medium transition-colors duration-150",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                  checked
                    ? "border-volt-500 bg-volt-950 text-fg"
                    : "border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg",
                )}
              >
                <input
                  type="checkbox"
                  name="services"
                  value={option.value}
                  checked={checked}
                  onChange={(e) => toggleService(option.value, e.target.checked)}
                  onBlur={() => blur("services")}
                  className="sr-only"
                />
                <svg
                  aria-hidden
                  viewBox="0 0 12 12"
                  className={cn("size-3 text-volt-500", !checked && "hidden")}
                >
                  <path
                    d="M2.5 6.2 5 8.7 9.5 3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {option.label}
              </label>
            );
          })}
        </div>
        {errorFor("services") ? (
          <p id={`${fieldId("services")}-error`} className="flex items-start gap-1.5 text-caption text-error">
            <WarningCircleIcon aria-hidden className="mt-px size-4 shrink-0" />
            {errorFor("services")}
          </p>
        ) : null}
      </fieldset>

      <Field
        id={fieldId("details")}
        label="What's eating your team's week?"
        hint="Optional"
        error={errorFor("details")}
      >
        <Textarea
          showCount
          maxLength={DETAILS_MAX}
          placeholder="e.g., Our month-end close takes 12 days and our controller is leaving in March."
          {...text("details")}
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-body-sm font-medium text-ink-100">
          When would you like to start? <span className="font-normal text-fg-subtle">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-1 rounded-md border border-line bg-ink-900 p-1 sm:grid-cols-4">
          {TIMELINES.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-sm px-2 py-2.5 text-center text-body-sm font-medium transition-colors duration-150",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                values.timeline === option.value ? "bg-ink-600 text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              <input
                type="radio"
                name="timeline"
                value={option.value}
                checked={values.timeline === option.value}
                onChange={() => update("timeline", option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Checkbox
        id={fieldId("nda")}
        name="nda"
        checked={values.nda}
        onChange={(e) => update("nda", e.target.checked)}
        label="Send me a mutual NDA before our call"
      />

      {showPhone ? (
        <Field
          id={fieldId("phone")}
          label="Phone"
          hint="Optional. We'll only call if you ask us to."
          error={errorFor("phone")}
        >
          <Input type="tel" inputMode="tel" autoComplete="tel" {...text("phone")} />
        </Field>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowPhone(true);
            requestAnimationFrame(() => document.getElementById(fieldId("phone"))?.focus());
          }}
          className="inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-accent-text"
        >
          <PlusIcon aria-hidden className="size-4" />
          Add a phone number
        </button>
      )}

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden className="absolute -left-[10000px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} load={turnstileWanted} /> : null}

      {state.status === "error" ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error/30 bg-error/10 p-4 text-body-sm text-ink-100 outline-none focus-visible:outline-2 focus-visible:outline-error"
        >
          <WarningCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-error" />
          <p>
            {state.message.split(siteConfig.email)[0]}
            {state.message.includes(siteConfig.email) ? (
              <>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-medium text-fg underline underline-offset-4"
                >
                  {siteConfig.email}
                </a>
                {state.message.split(siteConfig.email)[1]}
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="xl"
          fullWidth
          iconRight="arrow"
          loading={pending}
          // Long label: let it wrap on narrow screens instead of widening the layout.
          className="h-auto min-h-14 py-3 text-center whitespace-normal"
        >
          {pending ? "Sending…" : `Send. We'll reply within ${siteConfig.replySla}`}
        </Button>
        <p id="contact-consent" className="text-caption text-fg-muted">
          We&apos;ll use this to reply to you, and nothing else. No newsletters unless you ask.{" "}
          <a href="/legal/privacy" className="underline underline-offset-4 hover:text-fg">
            Privacy policy
          </a>
        </p>
      </div>
    </form>
  );
}
