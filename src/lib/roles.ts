import type { MembershipType, ProgramType, UserRole, TEAM } from "@prisma/client";

/**
 * Roles live on three axes:
 *
 *   User.role                 permission — one per person, gates /admin
 *   User.team                 team affiliation — optional, links Officers/Directors to teams
 *   Membership.membershipType program participation — many per person, dated
 *
 * This module is the single source of truth across the app.
 */

/** Permission roles that may reach /admin. */
export const ADMIN_ROLES = ["OFFICER", "DIRECTOR", "EXECUTIVE"] as const satisfies readonly UserRole[];

/** Roles permitted to assign or modify user roles and team affiliations. */
export const ROLE_MANAGER_ROLES = ["EXECUTIVE", "DIRECTOR"] as const satisfies readonly UserRole[];

/** Roles permitted to create, edit or publish program applications. */
export const APPLICATION_MANAGER_ROLES = ["EXECUTIVE", "DIRECTOR"] as const satisfies readonly UserRole[];

/** All valid permission roles. */
export const ALL_USER_ROLES = ["MEMBER", "OFFICER", "DIRECTOR", "EXECUTIVE"] as const satisfies readonly UserRole[];

/** Assignable permission roles, in the order the editor dropdown lists them. */
export const ASSIGNABLE_USER_ROLES = ["MEMBER", "OFFICER", "DIRECTOR", "EXECUTIVE"] as const satisfies readonly UserRole[];

/** Assignable programs, in the order the editor dropdown lists them. */
export const ASSIGNABLE_PROGRAMS = [
  "AIM_MENTOR",
  "AIM_MENTEE",
  "AI_ACADEMY",
  "INNOVATION_LABS",
] as const satisfies readonly MembershipType[];

/** Assignable organizational teams for Officers & Directors. */
export const ASSIGNABLE_TEAMS = [
  "AI_ACADEMY",
  "AI_INNOVATION",
  "AIM",
  "MARKETING",
  "OPERATIONS",
  "FINANCE",
  "INDUSTRY",
  "TECHNOLOGY",
  "EXECUTIVE",
] as const satisfies readonly TEAM[];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: "Member",
  OFFICER: "Officer",
  DIRECTOR: "Director",
  EXECUTIVE: "Executive",
};

export const PROGRAM_LABELS: Record<MembershipType, string> = {
  AIM_MENTOR: "AIM Mentor",
  AIM_MENTEE: "AIM Mentee",
  AI_ACADEMY: "AI Academy",
  INNOVATION_LABS: "Innovation Labs",
};

export const TEAM_LABELS: Record<TEAM, string> = {
  AI_ACADEMY: "AI Academy",
  AI_INNOVATION: "AI Innovation",
  AIM: "AIM",
  MARKETING: "Marketing",
  OPERATIONS: "Operations",
  FINANCE: "Finance",
  INDUSTRY: "Industry",
  TECHNOLOGY: "Technology",
  EXECUTIVE: "Executive",
};

/**
 * Whether a value is a valid role recognized by the current schema.
 * Checked against ALL_USER_ROLES so DIRECTORS are recognized as valid.
 */
export function isKnownRole(role: unknown): role is UserRole {
  return typeof role === "string" && (ALL_USER_ROLES as readonly string[]).includes(role);
}

/** Accepts a plain string so callers holding unvalidated Clerk metadata can check admin access. */
export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

export function canManageRoles(role: string | null | undefined): boolean {
  return !!role && (ROLE_MANAGER_ROLES as readonly string[]).includes(role);
}

/** Create, edit or publish program applications. Reviewing is a separate axis. */
export function canManageApplications(role: string | null | undefined): boolean {
  return !!role && (APPLICATION_MANAGER_ROLES as readonly string[]).includes(role);
}

export function isAssignableUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (ASSIGNABLE_USER_ROLES as readonly string[]).includes(value);
}

export function isAssignableProgram(value: unknown): value is MembershipType {
  return typeof value === "string" && (ASSIGNABLE_PROGRAMS as readonly string[]).includes(value);
}

export function isAssignableTeam(value: unknown): value is TEAM {
  return typeof value === "string" && (ASSIGNABLE_TEAMS as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* Application review access                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Postings an AIM mentor may review. Mentors read the applications for the
 * program they mentor in — not the mentor postings themselves.
 */
export const AIM_MENTOR_PROGRAM_TYPES = [
  "AI_MENTORSHIP_MENTEE",
] as const satisfies readonly ProgramType[];

/** True when the member holds an active AIM mentor program membership. */
export function hasAimMentorProgram(
  programs: readonly MembershipType[] | null | undefined
): boolean {
  return !!programs?.includes("AIM_MENTOR");
}

/**
 * Whether someone may reach the applications review UI at all.
 *
 * Admin roles qualify by role. AIM mentors qualify by program membership alone —
 * their User.role stays MEMBER, so this is the only thing that lets them in.
 */
export function canReviewApplications(
  role: string | null | undefined,
  programs: readonly MembershipType[] | null | undefined
): boolean {
  return isAdminRole(role) || hasAimMentorProgram(programs);
}

/**
 * True only for someone who reaches the review surface purely through a
 * program membership, never by role — an AIM mentor. Admin roles have their
 * own "Admin" entry point and are excluded here even if they also happen to
 * hold an AIM_MENTOR membership.
 */
export function isApplicationReviewerOnly(
  role: string | null | undefined,
  programs: readonly MembershipType[] | null | undefined
): boolean {
  return !isAdminRole(role) && hasAimMentorProgram(programs);
}

/**
 * Which postings a reviewer may see, as a program-type allow-list.
 *
 * `null` means unrestricted — every posting — and is what admin roles get. An
 * array narrows the reviewer to those program types; an empty array means no
 * access at all. Callers must check the requested posting against this rather
 * than trusting the UI to have filtered it.
 */
export function reviewableProgramTypes(
  role: string | null | undefined,
  programs: readonly MembershipType[] | null | undefined
): ProgramType[] | null {
  if (isAdminRole(role)) return null;
  return hasAimMentorProgram(programs) ? [...AIM_MENTOR_PROGRAM_TYPES] : [];
}

/** Whether a specific posting falls inside a reviewer's allow-list. */
export function canReviewProgramType(
  allowed: ProgramType[] | null,
  programType: ProgramType | null | undefined
): boolean {
  if (allowed === null) return true;
  return !!programType && allowed.includes(programType);
}
