/**
 * Reel Manager
 * Handles reel data processing and integration with the app
 */

import { logger } from '../Utils/debugger';
import { fetchReelDetails, extractMovieName, getReelMetadata } from '../API/reels';
import { searchMulti } from '../API/tmdb';
import { MediaItem, APIError } from '../Types';

export interface ReelImportResult {
  success: boolean;
  movieItem?: MediaItem;
  message: string;
  reelMetadata?: any;
  error?: string;
}

class ReelManager {
  private static instance: ReelManager;

  private constructor() {}

  static getInstance(): ReelManager {
    if (!ReelManager.instance) {
      ReelManager.instance = new ReelManager();
    }
    return ReelManager.instance;
  }

  /**
   * Process Instagram reel and extract movie
   * @param reelUrl - Instagram reel URL
   * @returns Movie item to add to collection
   */
  async processReelAndExtractMovie(reelUrl: string): Promise<ReelImportResult> {
    try {
      logger.debug('ReelManager', 'Processing reel', { reelUrl });

      // Step 1: Fetch reel details
      const reelResponse = await fetchReelDetails(reelUrl);

      if ('code' in reelResponse) {
        logger.error('ReelManager', 'Failed to fetch reel', reelResponse);
        return {
          success: false,
          message: 'Failed to fetch reel details',
          error: reelResponse.message,
        };
      }

      logger.info('ReelManager', 'Reel details fetched', {
        author: reelResponse.data.author,
      });

      // Step 2: Extract movie name
      const movieName = extractMovieName(reelResponse);

      if (!movieName) {
        logger.warn('ReelManager', 'No movie name found in reel');
        return {
          success: false,
          message: 'No movie information found in this reel',
          reelMetadata: getReelMetadata(reelResponse),
        };
      }

      logger.debug('ReelManager', 'Movie name extracted', { movieName });

      // Step 3: Search for the movie
      const movieSearchResult = await this.searchAndFetchMovie(movieName);

      if (!movieSearchResult.success) {
        logger.warn('ReelManager', 'Movie not found', { movieName });
        return {
          success: false,
          message: `Movie "${movieName}" not found in database`,
          reelMetadata: getReelMetadata(reelResponse),
          error: movieSearchResult.error,
        };
      }

      logger.info('ReelManager', 'Movie found and processed', {
        movieTitle: movieSearchResult.movieItem?.title,
      });

      return {
        success: true,
        movieItem: movieSearchResult.movieItem,
        message: `Successfully found "${movieSearchResult.movieItem?.title}" from the reel!`,
        reelMetadata: getReelMetadata(reelResponse),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('ReelManager', 'Error processing reel', {
        error: errorMessage,
        reelUrl,
      });

      return {
        success: false,
        message: 'An error occurred while processing the reel',
        error: errorMessage,
      };
    }
  }

  /**
   * Search for movie and get full details
   * @param movieName - Movie title to search
   * @returns Movie item with full details
   */
  private async searchAndFetchMovie(
    movieName: string
  ): Promise<{ success: boolean; movieItem?: MediaItem; error?: string }> {
    try {
      logger.debug('ReelManager', 'Searching for movie', { movieName });

      const searchResponse = await searchMulti(movieName.trim());

      if (!searchResponse.results || searchResponse.results.length === 0) {
        logger.warn('ReelManager', 'No search results found', { movieName });
        return {
          success: false,
          error: 'No results found',
        };
      }

      // searchMulti already transforms results to MediaItem format
      // Just use the first result
      const movieItem = searchResponse.results[0];

      if (!movieItem) {
        logger.warn('ReelManager', 'No media result found in search results', {
          movieName,
        });
        return {
          success: false,
          error: 'No movies or TV shows found',
        };
      }

      logger.info('ReelManager', 'Movie found', {
        movieTitle: movieItem.title,
        mediaType: movieItem.mediaType,
      });

      return {
        success: true,
        movieItem,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('ReelManager', 'Error searching for movie', {
        error: errorMessage,
        movieName,
      });

      if (error instanceof APIError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const reelManager = ReelManager.getInstance();
export default ReelManager;
