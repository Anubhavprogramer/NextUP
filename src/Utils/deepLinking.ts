/**
 * Deep Linking Configuration
 * Handles deep links for navigating to different screens
 */

import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../Types';
import { normalizeInstagramUrl } from './helpers';
import { logger } from './debugger';

/**
 * Deep linking configuration for the app
 * Supports:
 * - nextup://reel/share/[reelUrl]
 * - nextup://media/[id]
 * - https://nextupapp.com/...
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['nextup://', 'https://nextupapp.com', 'http://nextupapp.com'],
  config: {
    screens: {
      Main: '/',
      Search: '/search',
      Collection: '/collection/:status',
      MediaDetail: '/media/:id',
      ReelShare: 'reel/share/:reelUrl',
      Settings: '/settings',
      Statistics: '/stats',
    },
  },
  
  // Optional: Custom handling of deep links
  async getInitialURL() {
    try {
      logger.debug('DeepLinking', 'Getting initial URL');
      
      // This is called when app is launched from a deep link
      // Return the path that was used to open the app
      return undefined;
    } catch (err) {
      logger.error('DeepLinking', 'Error getting initial URL', {
        error: err instanceof Error ? err.message : String(err),
      });
      return undefined;
    }
  },
  
  // Optional: Handle deep links that occur after the app is launched
  subscribe(listener) {
    try {
      logger.debug('DeepLinking', 'Subscribing to deep links');
      
      // Listen to deep link events here
      // When deep link is received, call listener(url)
      
      // For now, return empty unsubscribe function
      return () => {
        logger.debug('DeepLinking', 'Unsubscribing from deep links');
      };
    } catch (err) {
      logger.error('DeepLinking', 'Error subscribing to deep links', {
        error: err instanceof Error ? err.message : String(err),
      });
      return () => {};
    }
  },
};

/**
 * Helper to navigate to ReelShare screen
 * @param navigation - Navigation prop
 * @param reelUrl - Instagram reel URL
 * @param collectionStatus - Collection to add to (default: 'will_watch')
 */
export const navigateToReelShare = (
  navigation: any,
  reelUrl: string,
  collectionStatus: 'will_watch' | 'watching' | 'watched' = 'will_watch'
) => {
  try {
    const normalizedUrl = normalizeInstagramUrl(reelUrl);
    
    logger.debug('DeepLinking', 'Navigating to ReelShare', {
      reelUrl: normalizedUrl,
      collectionStatus,
    });
    
    navigation.navigate('ReelShare', {
      reelUrl: normalizedUrl,
      collectionStatus,
    });
  } catch (err) {
    logger.error('DeepLinking', 'Error navigating to ReelShare', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Helper to navigate to MediaDetail screen
 * @param navigation - Navigation prop
 * @param mediaItem - Media item to display
 */
export const navigateToMediaDetail = (navigation: any, mediaItem: any) => {
  try {
    logger.debug('DeepLinking', 'Navigating to MediaDetail', {
      mediaId: mediaItem.id,
      title: mediaItem.title,
    });
    
    navigation.navigate('MediaDetail', {
      mediaItem,
    });
  } catch (err) {
    logger.error('DeepLinking', 'Error navigating to MediaDetail', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Helper to navigate to Collection screen
 * @param navigation - Navigation prop
 * @param status - Collection status
 */
export const navigateToCollection = (
  navigation: any,
  status: 'will_watch' | 'watching' | 'watched'
) => {
  try {
    logger.debug('DeepLinking', 'Navigating to Collection', { status });
    
    navigation.navigate('Collection', { status });
  } catch (err) {
    logger.error('DeepLinking', 'Error navigating to Collection', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
