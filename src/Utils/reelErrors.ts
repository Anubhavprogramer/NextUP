import { ReelErrorCode } from '../API/reels';

/** What to tell the user for each reel import failure, and whether retrying can help. */
export const REEL_ERROR_COPY: Record<ReelErrorCode, { title: string; retry: boolean }> = {
  UNSUPPORTED_URL: { title: "That doesn't look like an Instagram reel link", retry: false },
  PRIVATE_OR_REMOVED: { title: 'This reel is private or no longer available', retry: false },
  NO_MATCH: { title: "Couldn't find a movie or show in this reel", retry: false },
  RATE_LIMITED: { title: 'Too many imports, try again in a minute', retry: true },
  SCRAPE_BLOCKED: { title: "Instagram didn't let us read this reel right now", retry: true },
  TIMEOUT: { title: 'This is taking too long', retry: true },
  NETWORK_ERROR: { title: "Couldn't reach NextUP. Check your connection", retry: true },
  UNKNOWN: { title: 'Something went wrong', retry: true },
};
