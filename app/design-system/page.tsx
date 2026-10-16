import type { Metadata } from "next";
import { CalendarBlankIcon } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "Volt 500 · brand", token: "--volt-500", hex: "#A3E635", note: "13.13:1 on Ink" },
  { name: "Volt 300 · hover", token: "--volt-300", hex: "#C6F56B", note: "Ink on it 15.72:1" },
  { name: "Volt 600 · pressed", token: "--volt-600", hex: "#84CC16", note: "Ink on it 10.02:1" },
  { name: "Volt 700 · text on light", token: "--volt-700", hex: "#4D7C0F", note: "4.78:1 on Paper" },
  { name: "Ink 950 · brand", token: "--ink-950", hex: "#0A0A0A", note: "Canvas" },
  { name: "Ink 850 · card", token: "--ink-850", hex: "#141416", note: "Elevation 1" },
  { name: "Ink 800 · input", token: "--ink-800", hex: "#1C1C1F", note: "Elevation 2" },
  { name: "Ink 600 · hairline", token: "--ink-600", hex: "#2E2E33", note: "Decorative only" },
  { name: "Ink 300 · tertiary", token: "--ink-300", hex: "#8A8A94", note: "5.79:1" },
  { name: "Ink 200 · secondary", token: "--ink-200", hex: "#A3A3AD", note: "7.92:1" },
  { name: "Ink 50 · primary text", token: "--ink-50", hex: "#F5F5F4", note: "18.15:1" },
  { name: "Paper", token: "--paper", hex: "#FAFAF9", note: "Light canvas" },
] as const;

const typeScale = [
  { label: "display-xl", className: "text-display-xl", sample: "Operations, handled." },
  { label: "h1", className: "text-h1", sample: "No mystery. Here's what happens." },
  { label: "h2", className: "text-h2", sample: "Five teams. One contract." },
  { label: "h3", className: "text-h3", sample: "Books closed by business day 5." },
  { label: "h4", className: "text-h4", sample: "Dedicated lead" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-16">
      <h2 className="mb-10 font-display text-h3 font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <Container className="pt-32 pb-24">
      <Eyebrow>Internal · not indexed</Eyebrow>
      <h1 className="mt-6 font-display text-h1 font-semibold text-fg">Design system</h1>
      <p className="mt-4 max-w-[60ch] text-body-lg text-fg-muted">
        Tokens and base components from M0. Spec:{" "}
        <code className="font-mono text-body-sm">docs/blueprint</code> sections A and G.
      </p>

      <Section title="Color">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {swatches.map((s) => (
            <li key={s.token} className="overflow-hidden rounded-lg border border-line bg-surface-1">
              <div className="h-20" style={{ background: `var(${s.token})` }} />
              <div className="p-3">
                <p className="text-body-sm font-medium text-fg">{s.name}</p>
                <p className="font-mono text-micro text-fg-subtle">{s.hex}</p>
                <p className="text-micro text-fg-subtle">{s.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-8">
          {typeScale.map((t) => (
            <div key={t.label} className="grid gap-2 md:grid-cols-[120px_1fr] md:items-baseline">
              <span className="font-mono text-caption text-fg-subtle">{t.label}</span>
              <p className={`font-display font-semibold text-fg ${t.className}`}>{t.sample}</p>
            </div>
          ))}
          <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-baseline">
            <span className="font-mono text-caption text-fg-subtle">body-lg</span>
            <p className="max-w-[60ch] text-body-lg text-fg-muted">
              Every task is logged, timestamped, and visible to you the moment it moves.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-baseline">
            <span className="font-mono text-caption text-fg-subtle">stat</span>
            <p className="tabular font-display text-stat font-medium text-fg">
              3h 41<span className="text-volt-500">m</span>
            </p>
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button iconRight="arrow">Book a call</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Read the story</Button>
            <Button variant="destructive">Remove</Button>
            <Button variant="ghost" size="icon" aria-label="Pick a date">
              <CalendarBlankIcon aria-hidden />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl" iconRight="arrow">
              Extra large
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button loading>Sending…</Button>
            <Button disabled>Disabled</Button>
            <Button variant="ghost" disabled>
              Disabled ghost
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-volt-500 p-8">
            <Button variant="primary-ink" size="lg" iconRight="arrow">
              Book a 20-minute call
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge>Accounting</Badge>
          <Badge variant="volt">Most chosen</Badge>
          <Badge variant="success">Done</Badge>
          <Badge variant="warning">Blocked</Badge>
          <Badge variant="error">Failed</Badge>
          <Badge variant="mono">FIN</Badge>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardTitle>Elevation 1</CardTitle>
            <CardDescription className="mt-2">Default card surface.</CardDescription>
          </Card>
          <Card elevation={2} edgeLight>
            <CardTitle>Elevation 2 + edge light</CardTitle>
            <CardDescription className="mt-2">Featured or hovered surfaces.</CardDescription>
          </Card>
          <Card interactive>
            <CardTitle>
              <a href="#cards" className="after:absolute after:inset-0">
                Interactive
              </a>
            </CardTitle>
            <CardDescription className="mt-2">Stretched-link pattern, lifts on hover.</CardDescription>
          </Card>
        </div>
      </Section>

      <Section title="Form fields">
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
          <Field label="Work email" required hint="We'll reply within 4 business hours.">
            <Input type="email" autoComplete="email" placeholder="you@company.com" />
          </Field>
          <Field label="Company" required error="We'd like to know who we're talking to.">
            <Input autoComplete="organization" defaultValue="" />
          </Field>
          <Field label="Disabled">
            <Input disabled defaultValue="Not editable" />
          </Field>
          <Field label="Read-only">
            <Input readOnly defaultValue="akrosstech.com" />
          </Field>
          <Field label="What's eating your team's week?" hint="Optional" className="md:col-span-2">
            <Textarea placeholder="e.g., Our month-end close takes 12 days and our controller is leaving in March." />
          </Field>
        </div>
      </Section>
    </Container>
  );
}
