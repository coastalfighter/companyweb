/**
 * Server error reporting to Sentry (docs/blueprint/09-tech-stack.md, Monitoring)
 * through its envelope API, instead of the full SDK: a few dozen lines, no client
 * bundle cost. What's sent is deliberately small: the error, the route and the
 * path without its query string. Never headers, cookies or request bodies.
 */

export interface SentryDsn {
  publicKey: string;
  host: string;
  projectId: string;
  /** The full DSN, echoed in the envelope header. */
  raw: string;
}

/** `https://<key>@<host>/<projectId>` → parts; null for anything else. */
export function parseDsn(dsn: string | undefined): SentryDsn | null {
  if (!dsn?.trim()) return null;
  try {
    const url = new URL(dsn.trim());
    const projectId = url.pathname.replace(/^\/+|\/+$/g, "");
    if (url.protocol !== "https:" || !url.username || !/^\d+$/.test(projectId)) return null;
    return { publicKey: url.username, host: url.host, projectId, raw: dsn.trim() };
  } catch {
    return null;
  }
}

export interface ErrorContext {
  path: string;
  method: string;
  routePath?: string;
  routeType?: string;
  renderSource?: string;
}

function describe(error: unknown): { type: string; value: string; stack?: string; digest?: string } {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;
  if (error instanceof Error) {
    return { type: error.name || "Error", value: error.message.slice(0, 1000), stack: error.stack, digest };
  }
  return { type: "Error", value: String(error).slice(0, 1000), digest };
}

/** Stack frames in Sentry's format (oldest first), parsed from a V8 stack string. */
export function parseStack(
  stack: string | undefined,
): { function?: string; filename: string; lineno?: number; colno?: number }[] {
  if (!stack) return [];
  const frames = stack
    .split("\n")
    .slice(1)
    .map((line) => /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({
      ...(m[1] ? { function: m[1] } : {}),
      filename: m[2]!,
      lineno: Number(m[3]),
      colno: Number(m[4]),
    }));
  return frames.slice(0, 50).reverse();
}

export function buildEnvelope(
  error: unknown,
  context: ErrorContext,
  dsn: SentryDsn,
  options: { environment?: string; release?: string; now?: Date; eventId?: string } = {},
): string {
  const now = options.now ?? new Date();
  const eventId = (options.eventId ?? crypto.randomUUID()).replace(/-/g, "");
  const detail = describe(error);
  const path = context.path.split("?")[0]!.slice(0, 500);
  const frames = parseStack(detail.stack);

  const event = {
    event_id: eventId,
    timestamp: now.getTime() / 1000,
    platform: "node",
    level: "error",
    environment: options.environment ?? "production",
    ...(options.release ? { release: options.release } : {}),
    transaction: context.routePath ?? path,
    exception: {
      values: [
        {
          type: detail.type,
          value: detail.value,
          ...(frames.length > 0 ? { stacktrace: { frames } } : {}),
        },
      ],
    },
    request: { url: path, method: context.method },
    tags: {
      ...(context.routeType ? { route_type: context.routeType } : {}),
      ...(context.renderSource ? { render_source: context.renderSource } : {}),
      ...(detail.digest ? { digest: detail.digest } : {}),
    },
  };

  return [
    JSON.stringify({ event_id: eventId, sent_at: now.toISOString(), dsn: dsn.raw }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
  ].join("\n");
}

/** Sends one error; never throws and gives up after 3 seconds. */
export async function reportError(
  error: unknown,
  context: ErrorContext,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const dsn = parseDsn(env.SENTRY_DSN);
  if (!dsn) return false;
  try {
    const response = await fetchImpl(`https://${dsn.host}/api/${dsn.projectId}/envelope/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${dsn.publicKey}, sentry_client=akrostech-web/1.0`,
      },
      body: buildEnvelope(error, context, dsn, {
        environment: env.NODE_ENV,
        release: env.VERCEL_GIT_COMMIT_SHA || env.SOURCE_VERSION || undefined,
      }),
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
