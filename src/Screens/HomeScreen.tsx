import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { ThemedCard } from '../Components/Themed/ThemedCard';
import { ThemedButton } from '../Components/Themed/ThemedButton';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { SearchScreen } from './SearchScreen';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { calculateCollectionStats } from '../Utils/helpers';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { userProfile, appState } = useApp();
  const [currentTab, setCurrentTab] = React.useState<'home' | 'search' | 'watched' | 'watching' | 'willWatch'>('home');

  const stats = appState?.collections ? calculateCollectionStats(appState.collections) : null;

  const renderTabContent = () => {
    switch (currentTab) {
      case 'search':
        return <SearchScreen />;
      case 'home':
      default:
        return renderHomeContent();
    }
  };

  const renderHomeContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.welcomeText}>
          Welcome back, {userProfile?.name}!
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Track your favorite movies and TV shows
        </ThemedText>
      </View>

      {stats && (
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

      <View style={styles.quickActions}>
        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        
        <ThemedButton
          title="Search Movies & TV Shows"
          onPress={() => setCurrentTab('search')}
          variant="primary"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: DESIGN_CONSTANTS.SPACING.medium,
    },
    header: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    welcomeText: {
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
    statsContainer: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
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
    quickActions: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    actionButton: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
    },
    tabButtonActive: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.small,
    },
    tabText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      marginTop: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.container}>
        {renderTabContent()}
        
        {/* Simple Tab Bar */}
        <View style={styles.tabBar}>
          <ThemedButton
            title="Home"
            onPress={() => setCurrentTab('home')}
            variant={currentTab === 'home' ? 'primary' : 'outline'}
            style={{ flex: 1, marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall }}
          />
          <ThemedButton
            title="Search"
            onPress={() => setCurrentTab('search')}
            variant={currentTab === 'search' ? 'primary' : 'outline'}
            style={{ flex: 1, marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall }}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};