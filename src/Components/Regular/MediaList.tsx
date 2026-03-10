import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../Store/ThemeContext';
import { MediaListProps, MediaItem } from '../../Types';
import { MediaCard } from './MediaCard';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
import { Images } from '../../Utils/Imges';

export const MediaList: React.FC<MediaListProps> = ({
  data,
  onItemPress,
  onRefresh,
  loading = false,
  emptyMessage = 'No results found',

  recentSearches = [],
  onRecentSearchPress,
  onRemoveRecentSearch,
  onClearRecentSearches,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },

    separator: {
      height: DESIGN_CONSTANTS.SPACING.small,
    },

    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
      paddingVertical: DESIGN_CONSTANTS.SPACING.xlarge,
    },

    emptyTitle: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.title,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      color: theme.colors.primaryDark,
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },

    emptyMessage: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.primaryDark,
      textAlign: 'center',
      lineHeight: 22,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: DESIGN_CONSTANTS.SPACING.xlarge,
    },

    loadingText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.textSecondary,
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
    },

    recentContainer: {
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
    },

    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },

    recentTitle: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.subtitle,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      color: theme.colors.textPrimary,
    },

    clearAll: {
      color: theme.colors.primary,
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
    },

    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
    },

    recentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    recentText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.textPrimary,
      marginLeft: DESIGN_CONSTANTS.SPACING.small,
    },
  });

  const renderItem = ({ item }: { item: MediaItem }) => (
    <MediaCard mediaItem={item} onPress={() => onItemPress?.(item)} />
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      <Text style={styles.loadingText}>Searching...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={Images.search}
        style={{ width: 64, height: 64, tintColor: theme.colors.primaryDark }}
        resizeMode="contain"
      />

      <Text style={styles.emptyTitle}>No Results</Text>

      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    </View>
  );

  const renderRecentSearches = () => {
    if (!recentSearches.length) return null;

    return (
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Searches</Text>

          {onClearRecentSearches && (
            <TouchableOpacity onPress={onClearRecentSearches}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentSearches.map((query, index) => (
          <View key={`${query}-${index}`} style={styles.recentItem}>
            <TouchableOpacity
              style={styles.recentLeft}
              onPress={() => onRecentSearchPress?.(query)}
            >
              <Icon
                name="time-outline"
                size={18}
                color={theme.colors.textSecondary}
              />

              <Text style={styles.recentText}>{query}</Text>
            </TouchableOpacity>

            {onRemoveRecentSearch && (
              <TouchableOpacity
                onPress={() => onRemoveRecentSearch(query)}
              >
                <Icon
                  name="close"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Loading state
  if (loading && data.length === 0) {
    return renderLoadingState();
  }

  return (
    <FlatList
      style={styles.container}
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.mediaType}-${item.id}`}
      ListHeaderComponent={
        data.length === 0 && recentSearches.length > 0
          ? renderRecentSearches
          : null
      }
      ListEmptyComponent={
        !loading && recentSearches.length === 0
          ? renderEmptyState
          : null
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        data.length === 0 ? { flexGrow: 1 } : undefined
      }
    />
  );
};