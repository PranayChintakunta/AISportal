// utils/url.ts
export function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Check if it already has a protocol (http://, https://, etc.)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Prepend https:// by default
  return `https://${trimmed}`;
}