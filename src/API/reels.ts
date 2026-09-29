import { NEXTUP_API } from '../Config/env';
import { MediaItem } from '../Types';

export type ReelErrorCode =
  | 'UNSUPPORTED_URL'
  | 'PRIVATE_OR_REMOVED'
  | 'NO_MATCH'
  | 'RATE_LIMITED'
  | 'SCRAPE_BLOCKED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface ReelCandidate {
  media: MediaItem;
  confidence: number;
  matchedOn: string;
  query: string;
}

export interface ResolvedReel {
  reelId: string;
  canonicalUrl: string;
  caption: string;
  author: string;
  thumbnail: string;
  candidates: ReelCandidate[];
}

export class ReelError extends Error {
  constructor(public code: ReelErrorCode, message: string, public keywords: string[] = []) {
    super(message);
    this.name = 'ReelError';
  }
}

// The backend adds originalTitle/popularity; keep only MediaItem fields so
// stored collection items match the app's type exactly.
const toMediaItem = (media: any): MediaItem => ({
  id: media.id,
  title: media.title,
  overview: media.overview || '',
  posterPath: media.posterPath ?? null,
  backdropPath: media.backdropPath ?? null,
  releaseDate: media.releaseDate || '',
  voteAverage: typeof media.voteAverage === 'number' ? media.voteAverage : 0,
  genreIds: media.genreIds || [],
  mediaType: media.mediaType === 'tv' ? 'tv' : 'movie',
  originalLanguage: media.originalLanguage || 'en',
});

const KNOWN_CODES: ReelErrorCode[] = [
  'UNSUPPORTED_URL',
  'PRIVATE_OR_REMOVED',
  'NO_MATCH',
  'RATE_LIMITED',
  'SCRAPE_BLOCKED',
];

/** Ask the backend which movies/shows a shared reel is about. */
export async function resolveReel(sharedText: string): Promise<ResolvedReel> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NEXTUP_API.RESOLVE_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${NEXTUP_API.BASE_URL}/api/reels/resolve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': NEXTUP_API.API_KEY },
      body: JSON.stringify({ url: sharedText }),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ReelError('TIMEOUT', 'This is taking too long. Please try again.');
    }
    throw new ReelError('NETWORK_ERROR', 'Could not reach NextUP. Check your connection.');
  } finally {
    clearTimeout(timer);
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error page (e.g. a gateway timeout).
  }

  if (!response.ok || !body?.success) {
    const code: ReelErrorCode = KNOWN_CODES.includes(body?.code)
      ? body.code
      : response.status === 504
      ? 'TIMEOUT'
      : 'UNKNOWN';
    throw new ReelError(code, body?.message || `Request failed (${response.status})`, body?.keywords || []);
  }

  const data = body.data;
  return {
    reelId: data.reelId,
    canonicalUrl: data.canonicalUrl,
    caption: data.caption || '',
    author: data.author || '',
    thumbnail: data.thumbnail || '',
    candidates: (data.candidates || []).map((candidate: any) => ({
      media: toMediaItem(candidate.media),
      confidence: candidate.confidence,
      matchedOn: candidate.matchedOn,
      query: candidate.query,
    })),
  };
}
