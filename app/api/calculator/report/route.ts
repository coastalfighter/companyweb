import { headers } from "next/headers";
import { rateCard } from "@/content/rate-card";
import { handleReportRequest, REPORT_FILENAME } from "@/lib/calculator/report-request";
import { siteConfig } from "@/lib/site";

/** Requests larger than this are not a calculator report. */
const MAX_BODY_BYTES = 16 * 1024;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/calculator/report → the PDF report (blueprint F4, gated by name + work
 * email). JSON in, application/pdf out; validation errors come back as JSON.
 */
export async function POST(request: Request) {
  const requestHeaders = await headers();

  // Same-origin only: browsers send Origin on POST; a cross-site form can't forge it.
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return json(403, { error: "Cross-origin requests aren't accepted." });
  }
  if (!requestHeaders.get("content-type")?.startsWith("application/json")) {
    return json(415, { error: "Send JSON." });
  }
  const length = Number(requestHeaders.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) return json(413, { error: "That request is too large." });

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
  try {
    const outcome = await handleReportRequest(body, { ip, rateCard });
    if (outcome.status === "invalid") return json(422, { errors: outcome.errors });
    if (outcome.status === "error") return json(outcome.httpStatus, { error: outcome.message });
    return new Response(Buffer.from(outcome.pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${REPORT_FILENAME}"`,
        "Cache-Control": "no-store",
        "X-Report-Emailed": outcome.emailed ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("[calculator] report failed", error);
    return json(500, { error: `The report didn't generate. Try again, or email ${siteConfig.email}.` });
  }
}
