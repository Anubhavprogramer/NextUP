import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { useToast } from '../Store/ToastContext';
import { SearchBar } from '../Components/Regular/SearchBar';
import { MediaList } from '../Components/Regular/MediaList';
import { MediaItem, APIError } from '../Types';
import { searchMulti, testTMDBConnection } from '../API/tmdb';
import { runFullDebug } from '../API/debug';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const { addToCollection, findItemByMediaId } = useApp();
  const { showSuccess, showError, showInfo } = useToast();
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Test API connection on component mount
  useEffect(() => {
    testTMDBConnection();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setCurrentQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await searchMulti(query.trim());
      
      // Filter out person results and invalid items
      const validResults = response.results.filter(item => 
        item.mediaType === 'movie' || item.mediaType === 'tv'
      );
      
      setSearchResults(validResults);
    } catch (error) {
      console.error('Search error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof APIError) {
        if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.code === 'TMDB_REQUEST_FAILED') {
          errorMessage = `TMDB API error (${error.status}). Please try again later.`;
        } else {
          errorMessage = 'Unable to search at the moment. Please try again.';
        }
      }
      
      showError(errorMessage);
      
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleItemPress = useCallback((mediaItem: MediaItem) => {
    // Check if item is already in collection
    const existingItem = findItemByMediaId(mediaItem.id);
    
    if (existingItem) {
      const statusLabel = existingItem.status.replace('_', ' ');
      showInfo(`Already in ${statusLabel} collection`);
      return;
    }

    // Show collection selection
    Alert.alert(
      'Add to Collection',
      `Add "${mediaItem.title}" to which collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Want to Watch',
          onPress: () => handleAddToCollection(mediaItem, 'will_watch'),
        },
        {
          text: 'Currently Watching',
          onPress: () => handleAddToCollection(mediaItem, 'watching'),
        },
        {
          text: 'Watched',
          onPress: () => handleAddToCollection(mediaItem, 'watched'),
        },
      ]
    );
  }, [findItemByMediaId, showInfo]);

  const handleAddToCollection = useCallback(async (
    mediaItem: MediaItem, 
    status: 'watched' | 'watching' | 'will_watch'
  ) => {
    try {
      await addToCollection(mediaItem, status);
      
      const statusName = status === 'will_watch' ? 'Want to Watch' : 
                        status === 'watching' ? 'Currently Watching' : 'Watched';
      
      showSuccess(`Added to ${statusName}`);
    } catch (error) {
      console.error('Add to collection error:', error);
      showError('Unable to add to collection');
    }
  }, [addToCollection, showSuccess, showError]);

  const handleRefresh = useCallback(() => {
    if (currentQuery) {
      handleSearch(currentQuery);
    }
  }, [currentQuery, handleSearch]);

  const getEmptyMessage = () => {
    if (!currentQuery) {
      return 'Search for movies and TV shows to add to your collection';
    }
    return `No results found for "${currentQuery}"`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search movies and TV shows..."
        debounceMs={300}
      />
      
      <View style={styles.content}>
        <MediaList
          data={searchResults}
          onItemPress={handleItemPress}
          onRefresh={handleRefresh}
          loading={loading}
          emptyMessage={getEmptyMessage()}
        />
      </View>
    </SafeAreaView>
  );
};