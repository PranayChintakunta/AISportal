/**
 * Tiny class-name joiner. Filters out falsy values so conditional classes can be
 * passed inline without pulling in extra dependencies.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// Formats date and time in a legible, neat format: Mon, Aug. 20 - 6:00PM
export function formatEventDate(
  dateString: string,
  includeDayOfWeek = false,
  timeZone = "America/Chicago"
) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  // 1. Explicitly format date components using fixed timeZone
  const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });

  const yearFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone,
  });

  const dateFormatted = monthDayFormatter.format(date);
  const timeFormatted = timeFormatter.format(date);

  // 2. Add Day of Week if requested
  if (includeDayOfWeek) {
    const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone,
    });
    const weekday = weekdayFormatter.format(date);
    return `${weekday}, ${dateFormatted} · ${timeFormatted}`;
  }

  // 3. Format as "MMM D · H:MM AM/PM"
  return `${dateFormatted} · ${timeFormatted}`;
}

export function getRelativeTimeString(eventStartTime: Date): { 
  relativeText: string; 
  headlineText: string;
} {
  const now = new Date();
  const eventDate = new Date(eventStartTime);
  
  // Difference in milliseconds
  const diffMs = eventDate.getTime() - now.getTime();
  
  // Fallback if event is already in the past
  if (diffMs <= 0) {
    return { 
      relativeText: "starting right now", 
      headlineText: "Event Started!" 
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  // Scenario 1: Less than 24 hours away
  if (diffHours < 24) {
    const hoursText = diffHours <= 1 ? "1 hour" : `${diffHours} hours`;
    return {
      relativeText: `today in ${hoursText}`,
      headlineText: `Starting today in ${hoursText}!`,
    };
  }

  // Scenario 2: 24 hours or more away
  const daysText = diffDays === 1 ? "1 day" : `${diffDays} days`;
  return {
    relativeText: `in ${daysText}`,
    headlineText: `Happening in ${daysText}!`,
  };
}