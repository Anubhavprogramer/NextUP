const INSTAGRAM_URL =
  /https?:\/\/(?:www\.|m\.)?instagram\.com\/(?:[\w.]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i;

/** Deep link the iOS share extension and Android share intent open the app with. */
export const IMPORT_LINK_PREFIX = 'nextup://import';

/**
 * Find an Instagram reel/post link in shared text (which may include the
 * caption) and return its canonical URL, or null.
 */
export const findInstagramReelUrl = (text: string | null | undefined): string | null => {
  if (!text) return null;
  const match = text.match(INSTAGRAM_URL);
  return match ? `https://www.instagram.com/reel/${match[1]}/` : null;
};

/**
 * Extract the shared text from `nextup://import?url=<encoded text>`.
 * Returns null for any other URL.
 */
export const parseImportLink = (url: string | null | undefined): string | null => {
  if (!url || !url.toLowerCase().startsWith(IMPORT_LINK_PREFIX)) return null;
  const query = url.split('?')[1] || '';
  for (const pair of query.split('&')) {
    const [key, value = ''] = pair.split('=');
    if (key === 'url') {
      try {
        return decodeURIComponent(value.replace(/\+/g, ' ')) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};
