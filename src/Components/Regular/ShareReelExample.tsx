/**
 * Example: How to use the Instagram Reel Sharing Feature
 * 
 * Place this in src/Components/Regular/ or use as reference
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Store/ThemeContext';
import { logger } from '../../Utils/debugger';

/**
 * Simple example button to open ReelShareScreen
 */
export function ShareReelExample() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  
  const handlePress = () => {
    const reelUrl = 'https://www.instagram.com/reel/ABC123DEF456/';
    
    // Navigate to ReelShare screen with the URL
    navigation.navigate('ReelShare', {
      reelUrl,
      collectionStatus: 'will_watch',
    });
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }]}
      onPress={handlePress}
    >
      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
        Share Instagram Reel
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Example showing how to validate and navigate to reel sharing
 */
export function ValidateAndShareReel() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  
  const handleShareReel = (reelUrl: string) => {
    // Validate URL format
    if (!reelUrl.includes('instagram.com')) {
      Alert.alert('Invalid URL', 'Please provide a valid Instagram URL');
      logger.warn('ReelExample', 'Invalid URL provided', { reelUrl });
      return;
    }
    
    logger.debug('ReelExample', 'Navigating to ReelShare', { reelUrl });
    
    // Navigate to ReelShareScreen
    navigation.navigate('ReelShare', {
      reelUrl: reelUrl.trim(),
      collectionStatus: 'will_watch',
    });
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }]}
      onPress={() => {
        const testUrl = 'https://www.instagram.com/reel/ABC123DEF456/';
        handleShareReel(testUrl);
      }}
    >
      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
        Validate & Share Reel
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShareReelExample;
