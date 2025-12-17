import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '../Themed/ThemedText';
import { MediaCard } from './MediaCard';
import { CollectionItem, CollectionStatus } from '../../Types';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

interface CollectionSectionProps {
  title: string;
  items: CollectionItem[];
  onItemPress?: (item: CollectionItem) => void;
  onSeeAll?: () => void;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  title,
  items,
  onItemPress,
  onSeeAll,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
    },
    seeAllButton: {
      paddingVertical: DESIGN_CONSTANTS.SPACING.xsmall,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.small,
    },
    seeAllText: {
      color: theme.colors.primary,
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    },
    scrollContainer: {
      paddingLeft: DESIGN_CONSTANTS.SPACING.medium,
    },
    itemContainer: {
      marginRight: DESIGN_CONSTANTS.SPACING.medium,
      width: Dimensions.get('window').width * 0.8, // Fixed width for consistent layout
    },
    emptyContainer: {
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.large,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText variant="subtitle">{title}</ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText variant="body" style={styles.emptyText}>
            No items in this collection yet
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="subtitle">{title}</ThemedText>
        {items.length > 5 && onSeeAll && (
          <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {items.slice(0, 10).map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <MediaCard
              mediaItem={item.mediaItem}
              onPress={() => onItemPress?.(item)}
              showStatus={false}
              collectionStatus={item.status}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};