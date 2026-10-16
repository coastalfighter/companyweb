export type Fetch = typeof fetch;

export class IntegrationError extends Error {
  constructor(
    readonly integration: string,
    message: string,
    readonly status?: number,
  ) {
    super(`${integration}: ${message}`);
    this.name = "IntegrationError";
  }
}

const TIMEOUT_MS = 8000;

/** POST with a timeout; throws IntegrationError on network failure or non-2xx. */
export async function post(
  integration: string,
  fetchImpl: Fetch,
  url: string,
  init: { headers?: Record<string, string>; body: string },
): Promise<Response> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: init.headers,
      body: init.body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new IntegrationError(integration, error instanceof Error ? error.message : "network error");
  }
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new IntegrationError(integration, `HTTP ${response.status} ${detail}`.trim(), response.status);
  }
  return response;
}
