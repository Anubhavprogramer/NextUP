import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { CustomHeader } from '../Components/Regular/CustomHeader';
import { StatisticsCard } from '../Components/Regular/StatisticsCard';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { statisticsManager, WatchStatistics } from '../Manager/StatisticsManager';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { logger } from '../Utils/debugger';

export const StatisticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { getCollectionByStatus } = useApp();
  const [statistics, setStatistics] = useState<WatchStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: DESIGN_CONSTANTS.SPACING.large,
    },
    scrollContent: {
      paddingBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    content: {
      flex: 1,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    sectionTitle: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.subtitle,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      color: theme.colors.primaryDark,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    statsRowHalf: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timelineCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      padding: DESIGN_CONSTANTS.SPACING.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    timelineTitle: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      color: theme.colors.text,
    },
    timelineDate: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      color: theme.colors.textSecondary,
      marginTop: DESIGN_CONSTANTS.SPACING.xsmall,
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    // Calculate statistics whenever component mounts or data changes
    const watched = getCollectionByStatus('watched').map(item => item);
    const watching = getCollectionByStatus('watching').map(item => item);
    const willWatch = getCollectionByStatus('will_watch').map(item => item);

    const stats = statisticsManager.calculateStatistics(
      watched,
      watching,
      willWatch
    );

    setStatistics(stats);
    setLoading(false);

    logger.info('StatisticsScreen', 'Statistics loaded', {
      totalWatched: stats.totalWatched,
      totalHours: stats.totalHoursWatched,
    });
  }, [getCollectionByStatus]);

  if (loading || !statistics) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ThemedView style={styles.container}>
          <CustomHeader title="Statistics" showBack={true} />
          <View style={styles.loadingContainer}>
            <ThemedText>Loading statistics...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ThemedView style={styles.container}>
        <CustomHeader title="Statistics" showBack={true} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Overview Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Overview</ThemedText>

              <View style={styles.statsRow}>
                <StatisticsCard
                  icon="checkmark-circle"
                  iconColor={theme.colors.primary}
                  label="Watched"
                  value={`${statistics.totalWatched}`}
                />
                <StatisticsCard
                  icon="play-circle"
                  iconColor={theme.colors.primary}
                  label="Watching"
                  value={`${statistics.totalWatching}`}
                />
              </View>

              <View style={styles.statsRow}>
                <StatisticsCard
                  icon="bookmark"
                  iconColor={theme.colors.primary}
                  label="Will Watch"
                  value={`${statistics.totalWillWatch}`}
                />
                <StatisticsCard
                  icon="time"
                  iconColor={theme.colors.primary}
                  label="Hours Watched"
                  value={`${statistics.totalHoursWatched}h`}
                />
              </View>
            </View>

            {/* Media Breakdown */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Media Breakdown</ThemedText>

              <View style={styles.statsRow}>
                <StatisticsCard
                  icon="film"
                  iconColor={theme.colors.primary}
                  label="Movies"
                  value={`${statistics.totalMovies}`}
                />
                <StatisticsCard
                  icon="tv"
                  iconColor={theme.colors.primary}
                  label="TV Shows"
                  value={`${statistics.totalTVShows}`}
                />
              </View>
            </View>

            {/* Ratings & Engagement */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Ratings & Engagement</ThemedText>

              <View style={styles.statsRow}>
                <StatisticsCard
                  icon="star"
                  iconColor={theme.colors.warning}
                  label="Avg Rating"
                  value={`${statistics.averageRating}`}
                  subValue="out of 10"
                />
                {/* <StatisticsCard
                  icon="flame"
                  iconColor="#FF6B6B"
                  label="Viewing Streak"
                  value={`${statistics.viewingStreak}`}
                  subValue="days"
                /> */}
              </View>
            </View>

            {/* Favorite Insights */}
            {statistics.favoriteYear && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Your Favorites</ThemedText>

                <StatisticsCard
                  icon="calendar"
                  iconColor={theme.colors.primary}
                  label="Favorite Year"
                  value={`${statistics.favoriteYear}`}
                  subValue="Most watched release year"
                />
              </View>
            )}

            {/* Last Watched */}
            {statistics.lastWatchDate && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>

                <View style={styles.timelineCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.timelineTitle}>Last Watch Date</ThemedText>
                      <ThemedText style={styles.timelineDate}>
                        {new Date(statistics.lastWatchDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};
