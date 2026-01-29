import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator, Image } from 'react-native';
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
}) => {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: MediaItem }) => (
    <MediaCard
      mediaItem={item}
      onPress={() => onItemPress?.(item)}
    />
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

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      <Text style={styles.loadingText}>Searching...</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
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
    separator: {
      height: DESIGN_CONSTANTS.SPACING.small,
    },
  });

  if (loading && data.length === 0) {
    return renderLoadingState();
  }

  return (
    <FlatList
      style={styles.container}
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.mediaType}-${item.id}`}
      ListEmptyComponent={!loading ? renderEmptyState : null}
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
      contentContainerStyle={data.length === 0 ? { flex: 1 } : undefined}
    />
  );
};