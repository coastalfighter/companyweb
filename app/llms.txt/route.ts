import { serviceContent } from "@/content/services";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

/** llms.txt (llmstxt.org): a plain summary for AI search engines (blueprint 09, SEO). Static. */
export function GET() {
  const url = (path: string) => `${siteConfig.url}${path}`;
  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "Akrostech is not a law firm or a CPA firm: its legal team supports a client's counsel, and its accounting team runs bookkeeping and payroll while audits and tax filings stay with the client's CPA.",
    "",
    "## Services",
    "",
    ...services.map(
      (s) => `- [${s.name}](${url(s.href)}): ${serviceContent[s.slug]?.seo.description ?? s.outcome}`,
    ),
    "",
    "## How it works",
    "",
    `- [How it works](${url("/how-it-works")}): the five phases from scoping call to a running team, and the documents at each step.`,
    `- [Back-office cost calculator](${url("/resources/back-office-calculator")}): today's cost of the work and the hours returned, with the method shown.`,
    "",
    "## Company",
    "",
    `- [About](${url("/about")})`,
    `- [Security & trust](${url("/about/security")})`,
    `- [Case studies](${url("/work")})`,
    `- [Careers](${url("/careers")})`,
    `- [Contact](${url("/contact")}): ${siteConfig.email}`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
