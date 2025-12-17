import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, useNavigation } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { ThemedCard } from '../Components/Themed/ThemedCard';
import { ThemedButton } from '../Components/Themed/ThemedButton';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { RootStackParamList, CollectionStatus } from '../Types';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { formatReleaseDate, getTMDBImageUrl } from '../Utils/helpers';

type MediaDetailScreenRouteProp = RouteProp<RootStackParamList, 'MediaDetail'>;
type MediaDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MediaDetail'>;

export const MediaDetailScreen: React.FC = () => {
  try {
    const { theme } = useTheme();
    const route = useRoute<MediaDetailScreenRouteProp>();
    const navigation = useNavigation<MediaDetailScreenNavigationProp>();
    const { findItemByMediaId, updateItemStatus, updateItemRating, updateItemNotes, updateItemProgress, removeFromCollection } = useApp();
    
    const { mediaItem } = route.params;
    console.log('MediaDetailScreen - mediaItem:', mediaItem);
    
    if (!mediaItem) {
      console.error('MediaDetailScreen - No mediaItem in route params');
      return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Error: No media item found</ThemedText>
        </SafeAreaView>
      );
    }
    
    const collectionItem = findItemByMediaId(mediaItem.id);
    console.log('MediaDetailScreen - collectionItem:', collectionItem);
  
  const [userRating, setUserRating] = useState(collectionItem?.userRating || 0);
  const [notes, setNotes] = useState(collectionItem?.notes || '');
  const [progress, setProgress] = useState(collectionItem?.progress || 0);
  const [isEditing, setIsEditing] = useState(false);

  const handleStatusChange = useCallback((newStatus: CollectionStatus) => {
    if (!collectionItem) return;

    Alert.alert(
      'Change Status',
      `Move "${mediaItem.title}" to ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateItemStatus(collectionItem.id, newStatus);
              Alert.alert('Success', 'Status updated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  }, [collectionItem, mediaItem.title, updateItemStatus]);

  const handleRatingChange = useCallback(async (rating: number) => {
    if (!collectionItem) return;

    try {
      await updateItemRating(collectionItem.id, rating);
      setUserRating(rating);
    } catch (error) {
      Alert.alert('Error', 'Failed to update rating');
    }
  }, [collectionItem, updateItemRating]);

  const handleSaveNotes = useCallback(async () => {
    if (!collectionItem) return;

    try {
      await updateItemNotes(collectionItem.id, notes);
      setIsEditing(false);
      Alert.alert('Success', 'Notes saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  }, [collectionItem, notes, updateItemNotes]);

  const handleProgressChange = useCallback(async (newProgress: number) => {
    if (!collectionItem) return;

    try {
      await updateItemProgress(collectionItem.id, newProgress);
      setProgress(newProgress);
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    }
  }, [collectionItem, updateItemProgress]);

  const handleRemove = useCallback(() => {
    if (!collectionItem) return;

    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${mediaItem.title}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCollection(collectionItem.id);
              navigation.goBack();
              Alert.alert('Success', 'Item removed from collection');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  }, [collectionItem, mediaItem.title, removeFromCollection, navigation]);

  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= userRating ? 'star' : 'star-outline'}
          size={24}
          color={theme.colors.warning}
          style={styles.star}
          onPress={() => handleRatingChange(i)}
        />
      );
    }
    return stars;
  };

  const getStatusColor = (status: CollectionStatus) => {
    switch (status) {
      case 'watched':
        return theme.colors.success;
      case 'watching':
        return theme.colors.primary;
      case 'will_watch':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: CollectionStatus) => {
    switch (status) {
      case 'watched':
        return 'checkmark-circle';
      case 'watching':
        return 'play-circle';
      case 'will_watch':
        return 'bookmark';
      default:
        return 'help-circle';
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: mediaItem.title.length > 20 ? `${mediaItem.title.substring(0, 20)}...` : mediaItem.title,
    });
  }, [navigation, mediaItem.title]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    heroSection: {
      position: 'relative',
      height: 300,
    },
    backdrop: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    heroOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: DESIGN_CONSTANTS.SPACING.medium,
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    poster: {
      width: 100,
      height: 150,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      marginRight: DESIGN_CONSTANTS.SPACING.medium,
    },
    heroInfo: {
      flex: 1,
    },
    heroTitle: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.heading,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.bold,
      color: 'white',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    heroMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    heroMetaText: {
      color: 'white',
      marginLeft: DESIGN_CONSTANTS.SPACING.xsmall,
      marginRight: DESIGN_CONSTANTS.SPACING.medium,
    },
    content: {
      padding: DESIGN_CONSTANTS.SPACING.medium,
    },
    section: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    sectionTitle: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    statusSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusButton: {
      flex: 1,
      marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      alignItems: 'center',
      borderWidth: 1,
    },
    statusButtonActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    statusButtonText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
      marginTop: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    ratingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    star: {
      marginRight: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    ratingText: {
      marginLeft: DESIGN_CONSTANTS.SPACING.medium,
      color: theme.colors.textSecondary,
    },
    notesInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      padding: DESIGN_CONSTANTS.SPACING.medium,
      minHeight: 100,
      textAlignVertical: 'top',
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    notesActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
    },
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressButton: {
      padding: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.small,
      backgroundColor: theme.colors.surface,
      marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    progressText: {
      minWidth: 50,
      textAlign: 'center',
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    },
    removeButton: {
      backgroundColor: theme.colors.error,
      marginTop: DESIGN_CONSTANTS.SPACING.large,
    },
  });

  const posterUrl = mediaItem.posterPath ? getTMDBImageUrl(mediaItem.posterPath, 'w500') : null;
  const backdropUrl = mediaItem.backdropPath ? getTMDBImageUrl(mediaItem.backdropPath, 'w780') : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Basic Info */}
            <View style={styles.section}>
              <ThemedText variant="title">
                {mediaItem.title}
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Icon name="tv" size={16} color={theme.colors.primary} />
                <ThemedText variant="body" style={{ marginLeft: 8 }}>
                  {mediaItem.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Icon name="calendar-outline" size={16} color={theme.colors.primary} />
                <ThemedText variant="body" style={{ marginLeft: 8 }}>
                  Release Date: {formatReleaseDate(mediaItem.releaseDate)}
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Icon name="star" size={16} color={theme.colors.warning} />
                <ThemedText variant="body" style={{ marginLeft: 8 }}>
                  Rating: {mediaItem.voteAverage.toFixed(1)}/10
                </ThemedText>
              </View>
            </View>

            {/* Overview */}
            {mediaItem.overview && (
              <View style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Overview
                </ThemedText>
                <ThemedText variant="body">
                  {mediaItem.overview}
                </ThemedText>
              </View>
            )}

            {/* Collection Status */}
            {collectionItem && (
              <View style={styles.section}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Collection Status: {collectionItem.status.replace('_', ' ')}
                </ThemedText>
                <ThemedText variant="body">
                  Added: {new Date(collectionItem.addedAt).toLocaleDateString()}
                </ThemedText>
                {collectionItem.userRating && (
                  <ThemedText variant="body">
                    Your Rating: {collectionItem.userRating}/10
                  </ThemedText>
                )}
                {collectionItem.notes && (
                  <ThemedText variant="body">
                    Notes: {collectionItem.notes}
                  </ThemedText>
                )}
              </View>
            )}

            {!collectionItem && (
              <View style={styles.section}>
                <ThemedText variant="body">
                  This item is not in your collection yet.
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
  } catch (error) {
    console.error('MediaDetailScreen error:', error);
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Error loading media details</ThemedText>
      </SafeAreaView>
    );
  }
};