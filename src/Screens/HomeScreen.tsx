import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { ThemedCard } from '../Components/Themed/ThemedCard';
import { CollectionSection } from '../Components/Regular/CollectionSection';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { RootStackParamList, CollectionItem } from '../Types';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { calculateCollectionStats } from '../Utils/helpers';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userProfile, appState, getCollectionByStatus } = useApp();

  const stats = appState?.collections ? calculateCollectionStats(appState.collections) : null;

  const handleItemPress = (item: CollectionItem) => {
    // For now, show an alert with item details
    // Later this can navigate to a detail screen
    Alert.alert(
      item.mediaItem.title,
      `Status: ${item.status.replace('_', ' ')}\nAdded: ${new Date(item.addedAt).toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  const handleSeeAll = (status: CollectionStatus) => {
    navigation.navigate('Collection', { status });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flex: 1,
    },
    welcomeText: {
      marginBottom: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
    searchButton: {
      padding: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
    },
    statsContainer: {
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.large,
    },
    sectionTitle: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: DESIGN_CONSTANTS.SPACING.small,
    },
    statCard: {
      flex: 1,
      padding: DESIGN_CONSTANTS.SPACING.medium,
    },
    statContent: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.heading,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.bold,
      marginVertical: DESIGN_CONSTANTS.SPACING.small,
    },
    statLabel: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    emptyButton: {
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
      backgroundColor: theme.colors.primary,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
    },
    emptyButtonText: {
      color: theme.colors.background,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    },
  });

  const watchedItems = getCollectionByStatus('watched');
  const watchingItems = getCollectionByStatus('watching');
  const willWatchItems = getCollectionByStatus('will_watch');

  const hasAnyItems = watchedItems.length > 0 || watchingItems.length > 0 || willWatchItems.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header with search button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText variant="title" style={styles.welcomeText}>
              Welcome back, {userProfile?.name}!
            </ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>
              Track your favorite movies and TV shows
            </ThemedText>
          </View>
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          {stats && hasAnyItems && (
            <View style={styles.statsContainer}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Your Collection
              </ThemedText>
              
              <View style={styles.statsGrid}>
                <ThemedCard style={styles.statCard}>
                  <View style={styles.statContent}>
                    <Icon name="checkmark-circle" size={24} color={theme.colors.success} />
                    <ThemedText variant="body" style={styles.statNumber}>
                      {stats.watched}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.statLabel}>
                      Watched
                    </ThemedText>
                  </View>
                </ThemedCard>

                <ThemedCard style={styles.statCard}>
                  <View style={styles.statContent}>
                    <Icon name="play-circle" size={24} color={theme.colors.primary} />
                    <ThemedText variant="body" style={styles.statNumber}>
                      {stats.watching}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.statLabel}>
                      Watching
                    </ThemedText>
                  </View>
                </ThemedCard>

                <ThemedCard style={styles.statCard}>
                  <View style={styles.statContent}>
                    <Icon name="bookmark" size={24} color={theme.colors.warning} />
                    <ThemedText variant="body" style={styles.statNumber}>
                      {stats.willWatch}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.statLabel}>
                      Want to Watch
                    </ThemedText>
                  </View>
                </ThemedCard>
              </View>
            </View>
          )}

          {/* Collection Sections */}
          {hasAnyItems ? (
            <>
              <CollectionSection
                title="Currently Watching"
                items={watchingItems}
                onItemPress={handleItemPress}
                onSeeAll={() => handleSeeAll('watching')}
              />
              
              <CollectionSection
                title="Want to Watch"
                items={willWatchItems}
                onItemPress={handleItemPress}
                onSeeAll={() => handleSeeAll('will_watch')}
              />
              
              <CollectionSection
                title="Watched"
                items={watchedItems}
                onItemPress={handleItemPress}
                onSeeAll={() => handleSeeAll('watched')}
              />
            </>
          ) : (
            /* Empty State */
            <View style={styles.emptyState}>
              <ThemedText variant="body" style={styles.emptyText}>
                Your collection is empty.{'\n'}Start by searching for movies and TV shows to add to your collection.
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Search')}
              >
                <ThemedText style={styles.emptyButtonText}>
                  Search Movies & TV Shows
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};