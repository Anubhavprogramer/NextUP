/**
 * Share Intent Handler
 * Handles incoming share intents from other apps (e.g., Instagram)
 */

import { useEffect } from 'react';
import { Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Types';
import { isValidInstagramReelUrl, normalizeInstagramUrl } from '../Utils/helpers';
import { logger } from '../Utils/debugger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Hook to handle share intents
 * Usage: Call this in your root App component
 */
export const useShareIntentHandler = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    logger.debug('ShareIntentHandler', 'Initializing share intent handler');

    // Listen for share intent from other apps
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      logger.debug('ShareIntentHandler', 'Share intent listener attached');
    });

    return () => {
      unsubscribe();
      logger.debug('ShareIntentHandler', 'Share intent listener cleaned up');
    };
  }, [navigation]);

  /**
   * Handle incoming share intent
   * This is called when user shares from Instagram or other apps
   */
  const handleIncomingShare = (sharedData: string) => {
    try {
      logger.debug('ShareIntentHandler', 'Handling incoming share', { data: sharedData });

      // Check if it's an Instagram reel URL
      if (isValidInstagramReelUrl(sharedData)) {
        const normalizedUrl = normalizeInstagramUrl(sharedData);
        logger.info('ShareIntentHandler', 'Valid reel URL detected', { url: normalizedUrl });

        // Navigate to ReelShare screen
        navigation.navigate('ReelShare', {
          reelUrl: normalizedUrl,
          collectionStatus: 'will_watch',
        });
      } else {
        logger.warn('ShareIntentHandler', 'Invalid or non-reel URL', { data: sharedData });
      }
    } catch (error) {
      logger.error('ShareIntentHandler', 'Error handling share intent', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return { handleIncomingShare };
};

/**
 * Alternative: Handle share intent at app startup
 * This checks if the app was opened via a share intent
 * Usage: Call in useEffect at app root
 */
export const getInitialShare = async (): Promise<string | null> => {
  try {
    // This would need to be implemented at the native level
    // to capture the initial share intent
    logger.debug('ShareIntentHandler', 'Checking for initial share intent');
    return null;
  } catch (error) {
    logger.error('ShareIntentHandler', 'Error getting initial share', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

export default useShareIntentHandler;
