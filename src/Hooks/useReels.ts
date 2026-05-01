/**
 * useReels Hook
 * Manages Instagram reel sharing and movie addition to collections
 */

import { useState, useCallback } from 'react';
import { reelManager, ReelImportResult } from '../Manager/ReelManager';
import { dataManager } from '../Manager';
import { MediaItem } from '../Types';
import { logger } from '../Utils/debugger';

export interface UseReelsResult {
  // State
  loading: boolean;
  error: string | null;
  
  // Methods
  addReelMovie: (reelUrl: string, collectionStatus?: 'will_watch' | 'watching' | 'watched') => Promise<MediaItem | null>;
  clearError: () => void;
}

/**
 * Hook for managing Instagram reel imports
 * @returns Object with loading state, error, and methods
 */
export const useReels = (): UseReelsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReelMovie = useCallback(
    async (
      reelUrl: string,
      collectionStatus: 'will_watch' | 'watching' | 'watched' = 'will_watch'
    ): Promise<MediaItem | null> => {
      try {
        setLoading(true);
        setError(null);

        logger.debug('useReels', 'Processing reel', { reelUrl, collectionStatus });

        // Process the reel and extract movie
        const result: ReelImportResult = await reelManager.processReelAndExtractMovie(reelUrl);

        if (!result.success) {
          const errorMsg = result.error || result.message;
          logger.warn('useReels', 'Failed to process reel', { error: errorMsg });
          setError(errorMsg || 'Failed to process reel');
          return null;
        }

        if (!result.movieItem) {
          logger.warn('useReels', 'No movie found in reel');
          setError('No movie found in reel');
          return null;
        }

        // Add the movie to the specified collection
        logger.debug('useReels', 'Adding movie to collection', {
          movieTitle: result.movieItem.title,
          collectionStatus,
        });

        await dataManager.addItem(result.movieItem, collectionStatus);

        logger.info('useReels', 'Movie added to collection', {
          movieTitle: result.movieItem.title,
          collectionStatus,
        });

        setError(null);
        return result.movieItem;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        logger.error('useReels', 'Error adding reel movie', { error: errorMessage });
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    addReelMovie,
    clearError,
  };
};

export default useReels;
