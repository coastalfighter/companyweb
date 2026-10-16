import { type EmploymentType } from "./types";

/** Display labels shared by server and client code (kept free of zod, so the client bundle stays small). */

/** Careers filter teams (blueprint 12.5), matched from the ATS department/team name. */
export const TEAMS = ["Engineering", "Recruiting", "Assistance", "Finance", "Legal Ops"] as const;

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contract",
  TEMPORARY: "Temporary",
  INTERN: "Internship",
};
