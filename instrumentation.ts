import type { Instrumentation } from "next";

/**
 * Server errors (renders, route handlers, server actions, proxy) go to Sentry when
 * SENTRY_DSN is set. Errors are still logged by Next.js either way.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (!process.env.SENTRY_DSN) return;
  const { reportError } = await import("./lib/monitoring/sentry");
  await reportError(error, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
