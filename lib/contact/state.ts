import { type FieldErrors } from "./schema";

/** What the contact action returns to the form. Only what the UI needs. */
export type ContactState =
  | { status: "idle" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "error"; message: string }
  | { status: "success"; firstName: string; services: string[] };

export const initialContactState: ContactState = { status: "idle" };
