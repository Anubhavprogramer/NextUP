import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { useToast } from '../Store/ToastContext';

import { dataManager } from '../Manager/DataManager';

import { MediaList } from '../Components/Regular/MediaList';
import { SearchHeader } from '../Components/Regular/SearchHeader';

import { MediaItem, APIError, SearchHistoryItem } from '../Types';

import { searchMulti } from '../API/tmdb';

import { DESIGN_CONSTANTS } from '../Utils';
import { useDebounce } from '../Store/hooks';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const { addToCollection, findItemByMediaId } = useApp();
  const { showSuccess, showError, showInfo } = useToast();

  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentQuery, setCurrentQuery] = useState('');

  const debouncedSearch = useDebounce(currentQuery, 600);

  // ===============================
  // Load Recent Searches on Mount
  // ===============================

  useEffect(() => {
    const loadRecentSearches = async () => {
      const history = await dataManager.getRecentSearches();
      setRecentSearches(history);
    };

    loadRecentSearches();
  }, []);

  // ===============================
  // Perform Search
  // ===============================

  useEffect(() => {
    const fetchSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await searchMulti(debouncedSearch.trim());

        const validResults = response.results.filter(
          item => item.mediaType === 'movie' || item.mediaType === 'tv',
        );

        setSearchResults(validResults);

        // Save successful search
        if (validResults.length > 0) {
          await dataManager.addRecentSearch(debouncedSearch.trim());

          const history = await dataManager.getRecentSearches();
          setRecentSearches(history);
        }

      } catch (error) {

        console.error('Search error:', error);

        let errorMessage = 'An unexpected error occurred. Please try again.';

        if (error instanceof APIError) {

          if (error.code === 'NETWORK_ERROR') {

            errorMessage =
              'Network connection failed. Please check your internet connection and try again.';

          } else if (error.code === 'TMDB_REQUEST_FAILED') {

            errorMessage =
              `TMDB API error (${error.status}). Please try again later.`;

          } else {

            errorMessage =
              'Unable to search at the moment. Please try again.';
          }
        }

        showError(errorMessage);

        setSearchResults([]);

      } finally {
        setLoading(false);
      }
    };

    fetchSearch();

  }, [debouncedSearch]);

  // ===============================
  // Handle Search Input
  // ===============================

  const handleSearch = useCallback((query: string) => {
    setCurrentQuery(query);
  }, []);

  // ===============================
  // Remove One Recent Search
  // ===============================

  const handleRemoveSearch = useCallback(async (query: string) => {

    await dataManager.removeRecentSearch(query);

    const history = await dataManager.getRecentSearches();

    setRecentSearches(history);

  }, []);

  // ===============================
  // Clear All Recent Searches
  // ===============================

  const handleClearAll = useCallback(async () => {

    await dataManager.clearRecentSearches();

    setRecentSearches([]);

  }, []);

  // ===============================
  // Add Item to Collection
  // ===============================

  const handleItemPress = useCallback(
    (mediaItem: MediaItem) => {

      const existingItem = findItemByMediaId(mediaItem.id);

      if (existingItem) {

        const statusLabel = existingItem.status.replace('_', ' ');

        showInfo(`Already in ${statusLabel} collection`);

        return;
      }

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
        ],
      );
    },
    [findItemByMediaId, showInfo],
  );

  const handleAddToCollection = useCallback(
    async (
      mediaItem: MediaItem,
      status: 'watched' | 'watching' | 'will_watch',
    ) => {

      try {

        await addToCollection(mediaItem, status);

        const statusName =
          status === 'will_watch'
            ? 'Want to Watch'
            : status === 'watching'
            ? 'Currently Watching'
            : 'Watched';

        showSuccess(`Added to ${statusName}`);

      } catch (error) {

        console.error('Add to collection error:', error);

        showError('Unable to add to collection');
      }
    },
    [addToCollection, showSuccess, showError],
  );

  // ===============================
  // Pull To Refresh
  // ===============================

  const handleRefresh = useCallback(() => {

    if (currentQuery) {
      handleSearch(currentQuery);
    }

  }, [currentQuery, handleSearch]);

  // ===============================
  // Empty Message
  // ===============================

  const getEmptyMessage = () => {

    if (!currentQuery) {
      return 'Search for movies and TV shows to add to your collection';
    }

    return `No results found for "${currentQuery}"`;
  };

  // ===============================
  // Styles
  // ===============================

  const styles = StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      flex: 1,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
    },

  });

  // ===============================
  // UI
  // ===============================

  return (

    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >

      <SearchHeader
        onSearch={handleSearch}
        placeholder="Search movies and TV shows..."
      />

      <View style={styles.content}>

        <MediaList
          data={searchResults}
          loading={loading}
          onItemPress={handleItemPress}
          onRefresh={handleRefresh}
          emptyMessage={getEmptyMessage()}

          recentSearches={recentSearches.map(item => item.query)}

          onRecentSearchPress={handleSearch}

          onRemoveRecentSearch={handleRemoveSearch}

          onClearRecentSearches={handleClearAll}
        />

      </View>

    </SafeAreaView>
  );
};