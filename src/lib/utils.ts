/**
 * Tiny class-name joiner. Filters out falsy values so conditional classes can be
 * passed inline without pulling in extra dependencies.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
