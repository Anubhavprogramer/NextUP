import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { SearchBar } from '../Components/Regular/SearchBar';
import { MediaList } from '../Components/Regular/MediaList';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { useToast } from '../Store/ToastContext';
import { RootStackParamList, CollectionItem, CollectionStatus, MediaItem } from '../Types';

type CollectionScreenRouteProp = RouteProp<RootStackParamList, 'Collection'>;
type CollectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Collection'>;

export const CollectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<CollectionScreenRouteProp>();
  const navigation = useNavigation<CollectionScreenNavigationProp>();
  const { getCollectionByStatus, updateItemStatus, removeFromCollection } = useApp();
  const { showSuccess, showError } = useToast();
  
  const { status } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const items = getCollectionByStatus(status);
  
  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return items.filter(item => 
      item.mediaItem.title.toLowerCase().includes(query) ||
      item.mediaItem.overview.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const mediaItems = filteredItems.map(item => item.mediaItem);

  const getTitle = (status: CollectionStatus): string => {
    switch (status) {
      case 'watched':
        return 'Watched';
      case 'watching':
        return 'Currently Watching';
      case 'will_watch':
        return 'Want to Watch';
      default:
        return 'Collection';
    }
  };

  const handleItemPress = useCallback((mediaItem: any) => {
    navigation.navigate('MediaDetail', { mediaItem });
  }, [navigation]);

  const showStatusChangeOptions = (item: CollectionItem) => {
    const currentStatus = item.status;
    const statusOptions = [
      { status: 'will_watch' as CollectionStatus, label: 'Want to Watch' },
      { status: 'watching' as CollectionStatus, label: 'Currently Watching' },
      { status: 'watched' as CollectionStatus, label: 'Watched' },
    ].filter(option => option.status !== currentStatus);

    Alert.alert(
      'Change Status',
      `Move "${item.mediaItem.title}" to:`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...statusOptions.map(option => ({
          text: option.label,
          onPress: () => handleStatusChange(item, option.status),
        })),
      ]
    );
  };

  const handleStatusChange = async (item: CollectionItem, newStatus: CollectionStatus) => {
    try {
      await updateItemStatus(item.id, newStatus);
      const statusLabel = newStatus.replace('_', ' ');
      showSuccess(`Moved to ${statusLabel}`);
    } catch (error) {
      console.error('Status change error:', error);
      showError('Unable to change status');
    }
  };

  const handleRemoveItem = async (item: CollectionItem) => {
    try {
      await removeFromCollection(item.id);
      showSuccess('Removed from collection');
    } catch (error) {
      console.error('Remove error:', error);
      showError('Unable to remove item');
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return `No results found for "${searchQuery}".\nTry a different search term.`;
    }
    
    switch (status) {
      case 'watched':
        return 'No watched items yet.\nItems you mark as watched will appear here.';
      case 'watching':
        return 'No items currently being watched.\nAdd items you\'re currently watching here.';
      case 'will_watch':
        return 'No items in your watchlist yet.\nAdd movies and shows you want to watch later.';
      default:
        return 'No items in this collection.';
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: getTitle(status),
    });
  }, [navigation, status]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    searchContainer: {
      // paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ThemedView style={styles.container}>
        {/* Search Bar - only show if there are items to search */}
        {items.length > 0 && (
          <View style={styles.searchContainer}>
            <SearchBar
              onSearch={handleSearch}
              placeholder={`Search in ${getTitle(status).toLowerCase()}...`}
              debounceMs={300}
            />
          </View>
        )}
        
        {/* Results Header */}
        {items.length > 0 && (
          <View style={styles.header}>
            <ThemedText variant="body" style={styles.subtitle}>
              {searchQuery.trim() ? (
                `${filteredItems.length} of ${items.length} ${items.length === 1 ? 'item' : 'items'}`
              ) : (
                `${items.length} ${items.length === 1 ? 'item' : 'items'}`
              )}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.content}>
          <MediaList
            data={mediaItems}
            onItemPress={handleItemPress}
            onRefresh={handleRefresh}
            loading={refreshing}
            emptyMessage={getEmptyMessage()}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};