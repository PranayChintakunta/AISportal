import type { MemberFilter, MemberSort } from "./query-params";

export const FILTER_LABELS: Record<MemberFilter, string> = {
  all: "All",
  officers: "Officers",
  mentors: "Mentors",
  mentees: "Mentees",
  academy: "Academy",
  inno: "Inno Labs",
};

export const SORT_LABELS: Record<MemberSort, string> = {
  recent: "sort: newest",
  oldest: "sort: oldest",
  az: "sort: A–Z",
  za: "sort: Z–A",
};

/** Cycles when the sort pill is clicked. */
export const NEXT_SORT: Record<MemberSort, MemberSort> = {
  recent: "oldest",
  oldest: "az",
  az: "za",
  za: "recent",
};
