"use server";

import { headers } from "next/headers";
import { type ContactState } from "@/lib/contact/state";
import { handleContactSubmission } from "@/lib/contact/submit";

function clientIp(h: Headers): string | undefined {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || undefined;
}

/** Contact form server action (blueprint F3). All logic lives in lib/contact/submit.ts. */
export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const h = await headers();
  return handleContactSubmission(form, {
    ip: clientIp(h),
    userAgent: h.get("user-agent")?.slice(0, 300) ?? undefined,
  });
}
