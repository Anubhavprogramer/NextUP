import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
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
import { CustomHeader } from '../Components';

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
      paddingTop: DESIGN_CONSTANTS.SPACING.medium,
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
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
      backgroundColor: theme.colors.white,
      padding: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.xlarge * 2,
    },
    metadataText: {
      marginLeft: DESIGN_CONSTANTS.SPACING.small,
      color: theme.colors.textSecondary,
    },
    statusSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    statusButton: {
      flex: 1,
      marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.primaryDark,
    },
    statusButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    statusButtonText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
      marginTop: DESIGN_CONSTANTS.SPACING.xsmall,
      color: theme.colors.text,
    },
    statusButtonTextActive: {
      color: theme.colors.background,
    },
    statusButtonDisabled: {
      opacity: 0.6,
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
        <CustomHeader title="Details" showBack={true} />
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
              <ThemedText variant="title" style={{ textAlign: 'left', marginBottom: DESIGN_CONSTANTS.SPACING.medium, color: theme.colors.primaryDark, fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.title }}>
                {mediaItem.title}
              </ThemedText>

              <View style={{ flexDirection: 'row', gap: DESIGN_CONSTANTS.SPACING.large}}>
                <View style={styles.metadataRow}>
                  <Icon
                    name={mediaItem.mediaType === 'tv' ? 'tv' : 'film'}
                    size={16}
                    color={theme.colors.primaryDark}
                  />
                  <ThemedText variant="body" style={styles.metadataText}>
                    {mediaItem.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                  </ThemedText>
                </View>

                <View style={styles.metadataRow}>
                  <Icon
                    name="calendar-outline"
                    size={16}
                    color={theme.colors.primaryDark}
                  />
                  <ThemedText variant="body" style={styles.metadataText}>
                    {formatReleaseDate(mediaItem.releaseDate)}
                  </ThemedText>
                </View>

                <View style={styles.metadataRow}>
                  <Icon name="star" size={16} color={theme.colors.primaryDark} />
                  <ThemedText variant="body" style={styles.metadataText}>
                    {mediaItem.voteAverage.toFixed(1)}/10
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Overview */}
            {mediaItem.overview && (
              <View style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Overview
                </ThemedText>
                <ThemedText variant="body" style={styles.metadataText}>{mediaItem.overview}</ThemedText>
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
                    <TouchableOpacity
                      disabled={isLoading || collectionItem.status === 'will_watch'}
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'will_watch' &&
                          styles.statusButtonActive,
                        isLoading && collectionItem.status !== 'will_watch' &&
                          styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleStatusChange('will_watch')}
                      activeOpacity={isLoading || collectionItem.status === 'will_watch' ? 1 : 0.7}
                    >
                      <Icon
                        name="bookmark"
                        size={20}
                        color={
                          collectionItem.status === 'will_watch'
                            ? theme.colors.background
                            : theme.colors.primary
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={isLoading || collectionItem.status === 'watching'}
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'watching' &&
                          styles.statusButtonActive,
                        isLoading && collectionItem.status !== 'watching' &&
                          styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleStatusChange('watching')}
                      activeOpacity={isLoading || collectionItem.status === 'watching' ? 1 : 0.7}
                    >
                      <Icon
                        name="play-circle"
                        size={20}
                        color={
                          collectionItem.status === 'watching'
                            ? theme.colors.background
                            : theme.colors.primary
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={isLoading || collectionItem.status === 'watched'}
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'watched' &&
                          styles.statusButtonActive,
                        isLoading && collectionItem.status !== 'watched' &&
                          styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleStatusChange('watched')}
                      activeOpacity={isLoading || collectionItem.status === 'watched' ? 1 : 0.7}
                    >
                      <Icon
                        name="checkmark-circle"
                        size={20}
                        color={
                          collectionItem.status === 'watched'
                            ? theme.colors.background
                            : theme.colors.primary
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={isLoading}
                      style={[
                        styles.statusButton,
                        isLoading && styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleRemove()}
                      activeOpacity={isLoading ? 1 : 0.7}
                    >
                      <Icon
                        name="trash-bin"
                        size={20}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
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
                    <TouchableOpacity
                      disabled={isLoading}
                      style={[
                        styles.statusButton,
                        isLoading && styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleAddToCollection('will_watch')}
                      activeOpacity={isLoading ? 1 : 0.7}
                    >
                      <Icon
                        name="bookmark"
                        size={20}
                        color={theme.colors.warning}
                      />
                      <ThemedText style={styles.statusButtonText}>
                        Want to Watch
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={isLoading}
                      style={[
                        styles.statusButton,
                        isLoading && styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleAddToCollection('watching')}
                      activeOpacity={isLoading ? 1 : 0.7}
                    >
                      <Icon
                        name="play-circle"
                        size={20}
                        color={theme.colors.primary}
                      />
                      <ThemedText style={styles.statusButtonText}>
                        Watching
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={isLoading}
                      style={[
                        styles.statusButton,
                        isLoading && styles.statusButtonDisabled,
                      ]}
                      onPress={() => handleAddToCollection('watched')}
                      activeOpacity={isLoading ? 1 : 0.7}
                    >
                      <Icon
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.success}
                      />
                      <ThemedText style={styles.statusButtonText}>
                        Watched
                      </ThemedText>
                    </TouchableOpacity>
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
