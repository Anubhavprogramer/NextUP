/**
 * Instagram Reel API Service
 * Handles fetching reel details from backend API
 */

import { logger } from '../Utils/debugger';

export interface ReelDetailsResponse {
  success: boolean;
  message: string;
  data: {
    platform: string;
    reelId: string;
    originalUrl: string;
    canonicalUrl: string;
    fetchedAt: string;
    title: string;
    description: string;
    thumbnail: string;
    author: string;
    authorHandle: string;
    isVerified: boolean;
    hashtags: string[];
    movieNames: string[];
    likes: number;
    comments: number;
    shares: number | null;
    views: number | null;
    duration: number | null;
    captionText: string;
    sound: string;
    soundCreator: string;
    createdAt: string;
    source: string;
    accessible: boolean;
  };
}

export interface ReelFetchError {
  code: string;
  message: string;
  status?: number;
}

const REELS_API_BASE = 'https://nextupbakend-production.up.railway.app/api/reels';

/**
 * Fetch reel details from Instagram URL
 * @param reelUrl - Instagram reel URL
 * @returns Reel details or error
 */
export const fetchReelDetails = async (
  reelUrl: string
): Promise<ReelDetailsResponse | ReelFetchError> => {
  try {
    logger.debug('ReelsAPI', 'Fetching reel details', { reelUrl });

    if (!reelUrl || !reelUrl.includes('instagram.com')) {
      const error: ReelFetchError = {
        code: 'INVALID_URL',
        message: 'Invalid Instagram URL provided',
      };
      logger.error('ReelsAPI', 'Invalid reel URL', { reelUrl });
      return error;
    }

    const response = await fetch(`${REELS_API_BASE}/detailsapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reelUrl: reelUrl.trim(),
      }),
    });

    logger.debug('ReelsAPI', 'Response received', { status: response.status });

    if (!response.ok) {
      const error: ReelFetchError = {
        code: 'API_ERROR',
        message: `Failed to fetch reel details (${response.status})`,
        status: response.status,
      };
      logger.error('ReelsAPI', 'API error', error);
      return error;
    }

    const data: ReelDetailsResponse = await response.json();

    if (!data.success) {
      const error: ReelFetchError = {
        code: 'API_FAILURE',
        message: data.message || 'Failed to fetch reel details',
      };
      logger.error('ReelsAPI', 'API returned failure', error);
      return error;
    }

    logger.info('ReelsAPI', 'Reel details fetched successfully', {
      movieNames: data.data.movieNames,
      author: data.data.author,
    });

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('ReelsAPI', 'Failed to fetch reel details', {
      error: errorMessage,
      reelUrl,
    });

    return {
      code: 'NETWORK_ERROR',
      message: `Network error: ${errorMessage}`,
    };
  }
};

/**
 * Extract movie name from reel details
 * @param reelDetails - Reel details response
 * @returns First movie name or null
 */
export const extractMovieName = (
  reelDetails: ReelDetailsResponse
): string | null => {
  const movieNames = reelDetails.data.movieNames;

  if (!movieNames || movieNames.length === 0) {
    logger.warn('ReelsAPI', 'No movie names found in reel');
    return null;
  }

  const movieName = movieNames[0];
  logger.info('ReelsAPI', 'Extracted movie name', { movieName });
  return movieName;
};

/**
 * Extract hashtags from reel details
 * @param reelDetails - Reel details response
 * @returns Array of hashtags
 */
export const extractHashtags = (reelDetails: ReelDetailsResponse): string[] => {
  return reelDetails.data.hashtags || [];
};

/**
 * Get reel metadata
 * @param reelDetails - Reel details response
 * @returns Reel metadata object
 */
export const getReelMetadata = (reelDetails: ReelDetailsResponse) => {
  return {
    platform: reelDetails.data.platform,
    reelId: reelDetails.data.reelId,
    originalUrl: reelDetails.data.originalUrl,
    canonicalUrl: reelDetails.data.canonicalUrl,
    thumbnail: reelDetails.data.thumbnail,
    author: reelDetails.data.author,
    authorHandle: reelDetails.data.authorHandle,
    isVerified: reelDetails.data.isVerified,
    likes: reelDetails.data.likes,
    comments: reelDetails.data.comments,
    captionText: reelDetails.data.captionText,
    fetchedAt: reelDetails.data.fetchedAt,
  };
};
