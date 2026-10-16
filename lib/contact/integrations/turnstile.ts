import "server-only";
import { type Fetch } from "./http";

/** Verifies a Cloudflare Turnstile token. Any failure (network included) counts as not verified. */
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | undefined,
  fetchImpl: Fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
