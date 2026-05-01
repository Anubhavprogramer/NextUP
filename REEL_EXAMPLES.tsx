/**
 * Example: How to use the Instagram Reel Sharing Feature
 * 
 * This file demonstrates how to integrate reel sharing into your app
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Types';
import { useReels } from '../Hooks/useReels';
import { navigateToReelShare } from '../Utils/deepLinking';
import { isValidInstagramReelUrl } from '../Utils/helpers';
import { logger } from '../Utils/debugger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Example 1: Button to share a reel
 */
export function ShareReelButton() {
  const navigation = useNavigation<NavigationProp>();
  
  const handleShareReel = () => {
    const reelUrl = 'https://www.instagram.com/reel/ABC123DEF456/';
    
    if (!isValidInstagramReelUrl(reelUrl)) {
      Alert.alert('Invalid URL', 'Please provide a valid Instagram reel URL');
      return;
    }
    
    // Navigate to ReelShareScreen with the reel URL
    navigateToReelShare(navigation, reelUrl, 'will_watch');
  };
  
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleShareReel}
    >
      <Text style={styles.buttonText}>Share Instagram Reel</Text>
    </TouchableOpacity>
  );
}

/**
 * Example 2: Using the useReels hook directly
 */
export function DirectReelProcessing() {
  const { addReelMovie, loading, error } = useReels();
  
  const handleProcessReel = async () => {
    const reelUrl = 'https://www.instagram.com/reel/ABC123DEF456/';
    
    logger.debug('Example', 'Processing reel directly', { reelUrl });
    
    const movie = await addReelMovie(reelUrl, 'will_watch');
    
    if (movie) {
      logger.info('Example', 'Movie added successfully', {
        title: movie.title,
        type: movie.mediaType,
      });
      Alert.alert('Success', `Added "${movie.title}" to Will Watch`);
    } else {
      logger.error('Example', 'Failed to add movie', { error });
      Alert.alert('Error', error || 'Failed to process reel');
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
      onPress={handleProcessReel}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Processing...' : 'Process Reel'}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Example 3: Handling reel URL from various sources
 */
export function HandleReelFromDifferentSources() {
  const navigation = useNavigation<NavigationProp>();
  
  // From clipboard
  const handlePasteReel = async () => {
    try {
      // In a real app, you would use react-native-clipboard
      const clipboardText = 'https://www.instagram.com/reel/ABC123DEF456/';
      
      if (isValidInstagramReelUrl(clipboardText)) {
        navigateToReelShare(navigation, clipboardText, 'will_watch');
      } else {
        Alert.alert('Invalid URL', 'Clipboard does not contain a valid Instagram reel URL');
      }
    } catch (error) {
      logger.error('Example', 'Error reading clipboard', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
  
  // From share intent
  const handleShareIntent = (reelUrl: string) => {
    if (isValidInstagramReelUrl(reelUrl)) {
      navigateToReelShare(navigation, reelUrl, 'will_watch');
    } else {
      Alert.alert('Invalid Reel URL', 'The shared URL is not a valid Instagram reel');
    }
  };
  
  // From push notification
  const handleNotificationDeepLink = (url: string) => {
    if (url.includes('/reel/')) {
      navigateToReelShare(navigation, url, 'will_watch');
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePasteReel}>
        <Text style={styles.buttonText}>Paste Reel from Clipboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleShareIntent('https://www.instagram.com/reel/ABC123DEF456/')}
      >
        <Text style={styles.buttonText}>Share from Intent</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleNotificationDeepLink('https://www.instagram.com/reel/ABC123DEF456/')}
      >
        <Text style={styles.buttonText}>Open from Notification</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Example 4: Complete flow with error handling
 */
export function CompleteReelFlow() {
  const navigation = useNavigation<NavigationProp>();
  const { addReelMovie, loading, error, clearError } = useReels();
  const [selectedCollection, setSelectedCollection] = React.useState<'will_watch' | 'watching' | 'watched'>('will_watch');
  
  const handleCompleteFlow = async (reelUrl: string) => {
    try {
      // Step 1: Validate URL
      if (!isValidInstagramReelUrl(reelUrl)) {
        throw new Error('Invalid Instagram reel URL');
      }
      
      logger.debug('Example', 'Starting complete flow', { reelUrl });
      
      // Step 2: Navigate to ReelShareScreen
      navigateToReelShare(navigation, reelUrl, selectedCollection);
      
      // The rest is handled by ReelShareScreen and useReels hook
      logger.info('Example', 'Navigated to ReelShareScreen');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Example', 'Error in complete flow', { error: errorMsg });
      Alert.alert('Error', errorMsg);
    }
  };
  
  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
        disabled={loading}
        onPress={() => handleCompleteFlow('https://www.instagram.com/reel/ABC123DEF456/')}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Share Instagram Reel'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.collectionSelector}>
        {(['will_watch', 'watching', 'watched'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.collectionOption,
              selectedCollection === status && styles.collectionOptionActive,
            ]}
            onPress={() => setSelectedCollection(status)}
          >
            <Text
              style={[
                styles.collectionOptionText,
                selectedCollection === status && styles.collectionOptionTextActive,
              ]}
            >
              {status === 'will_watch' ? 'Will Watch' : status === 'watching' ? 'Watching' : 'Watched'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#d06818ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  collectionSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  collectionOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#d7c7aaff',
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  collectionOptionActive: {
    backgroundColor: '#d06818ff',
    borderColor: '#d06818ff',
  },
  collectionOptionText: {
    color: '#BC6C25',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  collectionOptionTextActive: {
    color: '#FFFFFF',
  },
});

export default {
  ShareReelButton,
  DirectReelProcessing,
  HandleReelFromDifferentSources,
  CompleteReelFlow,
};
