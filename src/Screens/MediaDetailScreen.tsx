import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { useToast } from '../Store/ToastContext';
import { RootStackParamList, CollectionStatus } from '../Types';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { formatReleaseDate, getTMDBImageUrl } from '../Utils/helpers';
import { CustomHeader, MetadataRow, StatusButton } from '../Components';

type MediaDetailScreenRouteProp = RouteProp<RootStackParamList, 'MediaDetail'>;
type MediaDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MediaDetail'
>;

export const MediaDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<MediaDetailScreenRouteProp>();
  const navigation = useNavigation<MediaDetailScreenNavigationProp>();
  const {
    findItemByMediaId,
    addToCollection,
    updateItemStatus,
    removeFromCollection,
  } = useApp();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const { mediaItem } = route.params;

  if (!mediaItem) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ThemedView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ThemedText>Error: No media item found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const collectionItem = findItemByMediaId(mediaItem.id);

  const handleAddToCollection = async (status: CollectionStatus) => {
    try {
      setIsLoading(true);
      await addToCollection(mediaItem, status);
      const statusLabel = status.replace('_', ' ');
      showSuccess(`Added to ${statusLabel}`);
    } catch (error) {
      showError('Failed to add to collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: CollectionStatus) => {
    if (!collectionItem || collectionItem.status === newStatus) return;

    try {
      setIsLoading(true);
      await updateItemStatus(collectionItem.id, newStatus);
      const statusLabel = newStatus.replace('_', ' ');
      showSuccess(`Moved to ${statusLabel}`);
    } catch (error) {
      showError('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!collectionItem) return;

    try {
      setIsLoading(true);
      await removeFromCollection(collectionItem.id);
      showSuccess('Removed from collection');
      navigation.goBack();
    } catch (error) {
      showError('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      // paddingTop: DESIGN_CONSTANTS.SPACING.small,
    },
    scrollContent: {
      paddingBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    posterSection: {
      alignItems: 'center',
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
      backgroundColor: theme.colors.background,
    },
    poster: {
      width: '100%',
      aspectRatio: 2 / 3,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    posterPlaceholder: {
      width: '100%',
      aspectRatio: 2 / 3,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      backgroundColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    content: {
      padding: DESIGN_CONSTANTS.SPACING.medium,
    },
    section: {
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    sectionTitle: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
      color: theme.colors.primaryDark,
    },
    statusSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    removeButton: {
      backgroundColor: theme.colors.error,
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
    },
  });

  const posterUrl = mediaItem.posterPath
    ? getTMDBImageUrl(mediaItem.posterPath, 'w500')
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ThemedView style={styles.container}>
        <CustomHeader title={mediaItem.title} showBack={true} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Poster Section */}
          <View style={styles.posterSection}>
            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                style={styles.poster}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Icon
                  name="image-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
              </View>
            )}
          </View>

          <View style={styles.content}>
            {/* Basic Info */}
            <View style={styles.section}>
              {/* <ThemedText variant="title" style={{ textAlign: 'left', marginBottom: DESIGN_CONSTANTS.SPACING.medium, color: theme.colors.primaryDark, fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.title }}>
                {mediaItem.title}
              </ThemedText> */}

              <View style={{ flexDirection: 'row', gap: DESIGN_CONSTANTS.SPACING.small}}>
                <MetadataRow
                  iconName={mediaItem.mediaType === 'tv' ? 'tv' : 'film'}
                  text={mediaItem.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                />

                <MetadataRow
                  iconName="calendar-outline"
                  text={formatReleaseDate(mediaItem.releaseDate)}
                />

                <MetadataRow
                  iconName="star"
                  text={`${mediaItem.voteAverage.toFixed(1)}/10`}
                />
              </View>
            </View>

            {/* Overview */}
            {mediaItem.overview && (
              <View style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Overview
                </ThemedText>
                <ThemedText variant="body">{mediaItem.overview}</ThemedText>
              </View>
            )}

            {/* Collection Management */}
            <View style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Collection Status
              </ThemedText>

              {collectionItem ? (
                <>
                  <ThemedText
                    variant="body"
                    style={{
                      marginBottom: DESIGN_CONSTANTS.SPACING.small,
                      textAlign: 'center',
                    }}
                  >
                    Currently in: {collectionItem.status.replace('_', ' ')}
                  </ThemedText>
                  <ThemedText
                    variant="caption"
                    style={{
                      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
                      textAlign: 'center',
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Added:{' '}
                    {new Date(collectionItem.addedAt).toLocaleDateString()}
                  </ThemedText>

                  <View style={styles.statusSection}>
                    <StatusButton
                      iconName="bookmark"
                      status="will_watch"
                      currentStatus={collectionItem.status}
                      isLoading={isLoading}
                      onPress={() => handleStatusChange('will_watch')}
                    />

                    <StatusButton
                      iconName="play-circle"
                      status="watching"
                      currentStatus={collectionItem.status}
                      isLoading={isLoading}
                      onPress={() => handleStatusChange('watching')}
                    />

                    <StatusButton
                      iconName="checkmark-circle"
                      status="watched"
                      currentStatus={collectionItem.status}
                      isLoading={isLoading}
                      onPress={() => handleStatusChange('watched')}
                    />

                    <StatusButton
                      iconName="trash-bin"
                      status="watched"
                      isLoading={isLoading}
                      onPress={() => handleRemove()}
                    />
                  </View>
                </>
              ) : (
                <>
                  <ThemedText
                    variant="body"
                    style={{
                      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
                      textAlign: 'center',
                    }}
                  >
                    Not in your collection yet
                  </ThemedText>

                  <View style={styles.statusSection}>
                    <StatusButton
                      iconName="bookmark"
                      label="Want to Watch"
                      status="will_watch"
                      isLoading={isLoading}
                      onPress={() => handleAddToCollection('will_watch')}
                      iconColor={theme.colors.warning}
                    />

                    <StatusButton
                      iconName="play-circle"
                      label="Watching"
                      status="watching"
                      isLoading={isLoading}
                      onPress={() => handleAddToCollection('watching')}
                      iconColor={theme.colors.primary}
                    />

                    <StatusButton
                      iconName="checkmark-circle"
                      label="Watched"
                      status="watched"
                      isLoading={isLoading}
                      onPress={() => handleAddToCollection('watched')}
                      iconColor={theme.colors.success}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};
