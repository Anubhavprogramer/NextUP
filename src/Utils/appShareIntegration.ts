/**
 * App-Level Share Intent Integration
 * 
 * Add this to your root App.tsx or index component
 */

import React, { useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { isValidInstagramReelUrl, normalizeInstagramUrl } from './helpers';
import { logger } from './debugger';

/**
 * Hook to set up share intent listener
 * Call this in your App component useEffect
 */
export function useSetupShareIntentListener() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    try {
      logger.debug('AppShareIntegration', 'Setting up share intent listener');

      // Create event emitter for native events
      const eventEmitter = new NativeEventEmitter(
        NativeModules.ShareIntentHandler || {}
      );

      // Listen for incoming shares from Android
      const subscription = eventEmitter.addListener('INCOMING_SHARE', (sharedData: string) => {
        logger.debug('AppShareIntegration', 'Received share intent', { data: sharedData });

        // Validate and process the shared URL
        if (isValidInstagramReelUrl(sharedData)) {
          const normalizedUrl = normalizeInstagramUrl(sharedData);
          logger.info('AppShareIntegration', 'Valid Instagram reel URL detected', {
            url: normalizedUrl,
          });

          // Navigate to ReelShare screen
          navigation.navigate('ReelShare', {
            reelUrl: normalizedUrl,
            collectionStatus: 'will_watch',
          });
        } else {
          logger.warn('AppShareIntegration', 'Non-reel URL shared', { data: sharedData });
        }
      });

      return () => {
        subscription.remove();
        logger.debug('AppShareIntegration', 'Cleaned up share intent listener');
      };
    } catch (error) {
      logger.error('AppShareIntegration', 'Error setting up share intent listener', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [navigation]);
}

/**
 * Example implementation in your App.tsx
 */

/*
import AppNavigator from './src/Navigation/AppNavigator';
import { useSetupShareIntentListener } from './src/Utils/appShareIntegration';

export default function App() {
  // Set up share intent listener
  useSetupShareIntentListener();

  return (
    <AppNavigator />
  );
}
*/
