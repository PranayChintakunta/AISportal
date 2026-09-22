/**
 * Turns a recording URL into something renderable.
 *
 * Admins paste whatever link they have — a YouTube watch URL, a Vimeo page, a
 * direct .mp4 — and none of those are interchangeable in markup: a `<video>`
 * tag cannot play a YouTube page, and not every host allows framing at all.
 */

export type VideoEmbed = {
  kind: "file" | "iframe" | "link";
  src: string;
};

const FILE_EXTENSIONS = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m4v"];

function youTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    return url.pathname.slice(1) || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");

    const embedded = url.pathname.match(/^\/(?:embed|v|shorts|live)\/([^/?]+)/);
    if (embedded) return embedded[1];
  }

  return null;
}

function vimeoId(url: URL): string | null {
  if (url.hostname.replace(/^www\./, "") !== "vimeo.com") return null;

  const match = url.pathname.match(/^\/(\d+)/);
  return match ? match[1] : null;
}

export function resolveVideoEmbed(rawUrl: string | null | undefined): VideoEmbed | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const youtube = youTubeId(url);
  if (youtube) {
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}`,
    };
  }

  const vimeo = vimeoId(url);
  if (vimeo) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${encodeURIComponent(vimeo)}`,
    };
  }

  const path = url.pathname.toLowerCase();
  if (FILE_EXTENSIONS.some((ext) => path.endsWith(ext))) {
    return { kind: "file", src: url.toString() };
  }

  // Google Drive, Notion, a university media portal — playable for a human, but
  // not something we can safely frame, so send them out to it.
  return { kind: "link", src: url.toString() };
}
