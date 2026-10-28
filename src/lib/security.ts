const ACCEPTED_VIDEO_HOSTS = new Set([
  "drive.google.com",
  "drive.usercontent.google.com",
  "docs.google.com",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export function isAcceptedVideoLink(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && ACCEPTED_VIDEO_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}