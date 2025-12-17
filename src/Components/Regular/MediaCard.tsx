import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Store/ThemeContext';
import { MediaCardProps } from '../../Types';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
import { formatReleaseDate, getTMDBImageUrl } from '../../Utils/helpers';

export const MediaCard: React.FC<MediaCardProps> = ({
  mediaItem,
  onPress,
  showStatus = false,
  collectionStatus,
}) => {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    switch (collectionStatus) {
      case 'watched':
        return 'checkmark-circle';
      case 'watching':
        return 'play-circle';
      case 'will_watch':
        return 'bookmark';
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (collectionStatus) {
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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      width: '100%',
      overflow: 'hidden',
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    content: {
      flexDirection: 'row',
      padding: DESIGN_CONSTANTS.SPACING.medium,
    },
    poster: {
      width: 80,
      height: 120,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.small,
      backgroundColor: theme.colors.border,
    },
    posterPlaceholder: {
      width: 80,
      height: 120,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.small,
      backgroundColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: {
      flex: 1,
      marginLeft: DESIGN_CONSTANTS.SPACING.medium,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    title: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.subtitle,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      color: theme.colors.text,
      flex: 1,
      marginRight: DESIGN_CONSTANTS.SPACING.small,
    },
    statusIcon: {
      marginLeft: DESIGN_CONSTANTS.SPACING.small,
    },
    overview: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: DESIGN_CONSTANTS.SPACING.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    metadataText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      color: theme.colors.textSecondary,
      marginLeft: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    mediaType: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      color: theme.colors.primary,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  const posterUrl = mediaItem.posterPath ? getTMDBImageUrl(mediaItem.posterPath, 'w342') : null;
  const truncatedOverview = mediaItem.overview.length > 150 
    ? `${mediaItem.overview.substring(0, 150)}...` 
    : mediaItem.overview;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Icon name="image-outline" size={24} color={theme.colors.textSecondary} />
          </View>
        )}
        
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {mediaItem.title}
            </Text>
            {showStatus && collectionStatus && (
              <Icon
                name={getStatusIcon()!}
                size={20}
                color={getStatusColor()}
                style={styles.statusIcon}
              />
            )}
          </View>
          
          {truncatedOverview ? (
            <Text style={styles.overview} numberOfLines={3}>
              {truncatedOverview}
            </Text>
          ) : null}
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metadataText}>
                {formatReleaseDate(mediaItem.releaseDate)}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Icon name="star" size={14} color={theme.colors.warning} />
              <Text style={styles.metadataText}>
                {mediaItem.voteAverage.toFixed(1)}
              </Text>
            </View>
            
            <Text style={styles.mediaType}>
              {mediaItem.mediaType === 'tv' ? 'TV Show' : 'Movie'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};