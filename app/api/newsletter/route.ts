import { headers } from "next/headers";
import { handleSubscription, readNewsletterConfig } from "@/lib/newsletter";

const MAX_BODY_BYTES = 2 * 1024;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST /api/newsletter: footer sign-up → HubSpot. Same-origin JSON only. */
export async function POST(request: Request) {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return json(403, { error: "Cross-origin requests aren't accepted." });
  }
  if (!requestHeaders.get("content-type")?.startsWith("application/json")) {
    return json(415, { error: "Send JSON." });
  }
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json(413, { error: "That request is too large." });
    body = JSON.parse(text);
  } catch {
    return json(400, { error: "That request didn't look right. Refresh and try again." });
  }
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    undefined;
  const outcome = await handleSubscription(body, { ip, config: readNewsletterConfig() });
  if (outcome.status === "ok") return json(200, { ok: true });
  if (outcome.status === "invalid") return json(422, { error: outcome.message });
  return json(outcome.httpStatus, { error: outcome.message });
}
