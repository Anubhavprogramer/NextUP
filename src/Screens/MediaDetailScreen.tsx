import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
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
type MediaDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MediaDetail'>;

export const MediaDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<MediaDetailScreenRouteProp>();
  const navigation = useNavigation<MediaDetailScreenNavigationProp>();
  const { findItemByMediaId, addToCollection, updateItemStatus, removeFromCollection } = useApp();
  const { showSuccess, showError } = useToast();
  
  const { mediaItem } = route.params;
  
  if (!mediaItem) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Error: No media item found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }
  
  const collectionItem = findItemByMediaId(mediaItem.id);
  
  const handleAddToCollection = async (status: CollectionStatus) => {
    try {
      await addToCollection(mediaItem, status);
      const statusLabel = status.replace('_', ' ');
      showSuccess(`Added to ${statusLabel}`);
    } catch (error) {
      showError('Failed to add to collection');
    }
  };

  const handleStatusChange = async (newStatus: CollectionStatus) => {
    if (!collectionItem) return;

    try {
      await updateItemStatus(collectionItem.id, newStatus);
      const statusLabel = newStatus.replace('_', ' ');
      showSuccess(`Moved to ${statusLabel}`);
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const handleRemove = async () => {
    if (!collectionItem) return;

    try {
      await removeFromCollection(collectionItem.id);
      showSuccess('Removed from collection');
      navigation.goBack();
    } catch (error) {
      showError('Failed to remove item');
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
    posterSection: {
      alignItems: 'center',
      padding: DESIGN_CONSTANTS.SPACING.large,
      backgroundColor: theme.colors.surface,
    },
    poster: {
      width: 200,
      height: 300,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    posterPlaceholder: {
      width: 200,
      height: 300,
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
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    sectionTitle: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
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
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    removeButton: {
      backgroundColor: theme.colors.error,
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
    },
  });

  const posterUrl = mediaItem.posterPath ? getTMDBImageUrl(mediaItem.posterPath, 'w500') : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Poster Section */}
          <View style={styles.posterSection}>
            {posterUrl ? (
              <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Icon name="image-outline" size={48} color={theme.colors.textSecondary} />
              </View>
            )}
          </View>

          <View style={styles.content}>
            {/* Basic Info */}
            <View style={styles.section}>
              <ThemedText variant="title" style={{ textAlign: 'center', marginBottom: DESIGN_CONSTANTS.SPACING.medium }}>
                {mediaItem.title}
              </ThemedText>
              
              <View style={styles.metadataRow}>
                <Icon name={mediaItem.mediaType === 'tv' ? 'tv' : 'film'} size={16} color={theme.colors.primary} />
                <ThemedText variant="body" style={styles.metadataText}>
                  {mediaItem.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                </ThemedText>
              </View>
              
              <View style={styles.metadataRow}>
                <Icon name="calendar-outline" size={16} color={theme.colors.primary} />
                <ThemedText variant="body" style={styles.metadataText}>
                  {formatReleaseDate(mediaItem.releaseDate)}
                </ThemedText>
              </View>
              
              <View style={styles.metadataRow}>
                <Icon name="star" size={16} color={theme.colors.warning} />
                <ThemedText variant="body" style={styles.metadataText}>
                  {mediaItem.voteAverage.toFixed(1)}/10
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

            {/* Collection Management */}
            <View style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Collection Status
              </ThemedText>
              
              {collectionItem ? (
                <>
                  <ThemedText variant="body" style={{ marginBottom: DESIGN_CONSTANTS.SPACING.medium, textAlign: 'center' }}>
                    Currently in: {collectionItem.status.replace('_', ' ')}
                  </ThemedText>
                  <ThemedText variant="caption" style={{ marginBottom: DESIGN_CONSTANTS.SPACING.medium, textAlign: 'center', color: theme.colors.textSecondary }}>
                    Added: {new Date(collectionItem.addedAt).toLocaleDateString()}
                  </ThemedText>
                  
                  <View style={styles.statusSection}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'will_watch' && styles.statusButtonActive
                      ]}
                      onPress={() => handleStatusChange('will_watch')}
                    >
                      <Icon 
                        name="bookmark" 
                        size={20} 
                        color={collectionItem.status === 'will_watch' ? theme.colors.background : theme.colors.warning} 
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'watching' && styles.statusButtonActive
                      ]}
                      onPress={() => handleStatusChange('watching')}
                    >
                      <Icon 
                        name="play-circle" 
                        size={20} 
                        color={collectionItem.status === 'watching' ? theme.colors.background : theme.colors.primary} 
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'watched' && styles.statusButtonActive
                      ]}
                      onPress={() => handleStatusChange('watched')}
                    >
                      <Icon 
                        name="checkmark-circle" 
                        size={20} 
                        color={collectionItem.status === 'watched' ? theme.colors.background : theme.colors.success} 
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        collectionItem.status === 'watched' && styles.statusButtonActive
                      ]}
                      onPress={() => handleRemove()}
                    >
                      <Icon 
                        name="trash-bin" 
                        size={20} 
                        color={theme.colors.error} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                </>
              ) : (
                <>
                  <ThemedText variant="body" style={{ marginBottom: DESIGN_CONSTANTS.SPACING.medium, textAlign: 'center' }}>
                    Not in your collection yet
                  </ThemedText>
                  
                  <View style={styles.statusSection}>
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => handleAddToCollection('will_watch')}
                    >
                      <Icon name="bookmark" size={20} color={theme.colors.warning} />
                      <ThemedText style={styles.statusButtonText}>
                        Want to Watch
                      </ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => handleAddToCollection('watching')}
                    >
                      <Icon name="play-circle" size={20} color={theme.colors.primary} />
                      <ThemedText style={styles.statusButtonText}>
                        Watching
                      </ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => handleAddToCollection('watched')}
                    >
                      <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
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