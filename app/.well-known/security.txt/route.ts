import { cacheLife } from "next/cache";
import { siteConfig } from "@/lib/site";

/**
 * RFC 9116 security.txt. `Expires` must be under a year away and is required, so
 * it's computed at most daily rather than hard-coded and left to lapse.
 */
async function securityTxt(): Promise<string> {
  "use cache";
  cacheLife("days");
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  return [
    `Contact: mailto:${siteConfig.email}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, ".000Z")}`,
    "Preferred-Languages: en",
    `Canonical: ${siteConfig.url}/.well-known/security.txt`,
    `Policy: ${siteConfig.url}/about/security#disclosure`,
    "",
  ].join("\n");
}

export async function GET() {
  return new Response(await securityTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
