import { type ServiceSlug } from "@/lib/services";
import { accounting } from "./accounting";
import { legal } from "./legal";
import { recruitment } from "./recruitment";
import { type ServiceContent } from "./types";
import { virtualAssistance } from "./virtual-assistance";
import { webDevelopment } from "./web-development";

export type { ServiceContent } from "./types";

export const serviceContent: Record<ServiceSlug, ServiceContent> = {
  "web-development": webDevelopment,
  recruitment,
  "virtual-assistance": virtualAssistance,
  accounting,
  legal,
};

export function getServiceContent(slug: string): ServiceContent | undefined {
  return Object.hasOwn(serviceContent, slug) ? serviceContent[slug as ServiceSlug] : undefined;
}
