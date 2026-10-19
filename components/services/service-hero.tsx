import { type ReactNode } from "react";
import { BuildVisual } from "@/components/services/heroes/build-visual";
import {
  ServiceHeroFrame,
  type HeadlineTreatment,
  type HeroLayout,
} from "@/components/services/heroes/hero-frame";
import { LedgerVisual } from "@/components/services/heroes/ledger-visual";
import { PipelineVisual } from "@/components/services/heroes/pipeline-visual";
import { SealVisual } from "@/components/services/heroes/seal-visual";
import { legalSerif } from "@/components/services/heroes/serif";
import { SwarmVisual } from "@/components/services/heroes/swarm-visual";
import { type ServiceContent } from "@/content/services";
import { services, servicesHubHref, type ServiceSlug } from "@/lib/services";
import { ctas } from "@/lib/site";

interface HeroDesign {
  layout: HeroLayout;
  headline: HeadlineTreatment;
  visual: ReactNode;
  titleClassName?: string;
}

/** Each service's hero has its own visual and headline voice (docs/blueprint/11-motion-system.md §3b–3f). */
const designs: Record<ServiceSlug, HeroDesign> = {
  "web-development": { layout: "split", headline: "plain", visual: <BuildVisual /> },
  recruitment: { layout: "split", headline: "scan", visual: <PipelineVisual /> },
  "virtual-assistance": { layout: "center", headline: "plain", visual: <SwarmVisual /> },
  accounting: { layout: "split", headline: "ledger", visual: <LedgerVisual /> },
  legal: {
    layout: "split-reverse",
    headline: "serif",
    titleClassName: legalSerif.variable,
    visual: (
      <div className={legalSerif.variable}>
        <SealVisual />
      </div>
    ),
  },
};

/** S1: the service hero. Copy and CTAs from content/services/*; design per slug above. */
export function ServiceHero({ content }: { content: ServiceContent }) {
  const service = services.find((s) => s.slug === content.slug)!;
  const design = designs[content.slug];
  return (
    <ServiceHeroFrame
      breadcrumb={[
        { label: "Services", href: servicesHubHref },
        { label: service.name, href: service.href },
      ]}
      eyebrow={content.hero.eyebrow}
      title={content.hero.title}
      subtitle={content.hero.subtitle}
      primary={{ label: content.hero.cta, href: `${ctas.primary.href}?service=${content.slug}` }}
      secondary={content.hero.secondary}
      note={content.hero.note}
      layout={design.layout}
      headline={design.headline}
      titleClassName={design.titleClassName}
      visual={design.visual}
    />
  );
}
