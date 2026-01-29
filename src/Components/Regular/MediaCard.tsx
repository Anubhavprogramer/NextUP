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
  onLongPress,
  // showStatus = false,
  // collectionStatus,
}) => {
  const { theme } = useTheme();

  // const getStatusColor = () => {
  //   switch (collectionStatus) {
  //     case 'watched':
  //       return theme.colors.success;
  //     case 'watching':
  //       return theme.colors.primary;
  //     case 'will_watch':
  //       return theme.colors.warning;
  //     default:
  //       return theme.colors.primary;
  //   }
  // };

  // const statusColor = getStatusColor();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      height: 190,
      width: '100%',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      // marginVertical: DESIGN_CONSTANTS.SPACING.small,
      flexDirection: 'row',
    },
    posterSection: {
      width: "35%",
      backgroundColor: theme.colors.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    poster: {
      width: '80%',
      height: '80%'
    },
    posterPlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.border,
    },
    middleSection: {
      flex: 1,
      padding: DESIGN_CONSTANTS.SPACING.small,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primaryDark,
    },
    title: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.title,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.bold,
      color: theme.colors.white,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    overview: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      color: theme.colors.white,
      // lineHeight: 22,
      // marginBottom: DESIGN_CONSTANTS.SPACING.medium,
      flex: 1,
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: DESIGN_CONSTANTS.SPACING.small,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metadataText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.white,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
    },
    mediaTypeTag: {
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.xsmall,
      alignSelf: 'flex-start',
      zIndex: 1,
    },
    mediaTypeText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      color: theme.colors.primary,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    barcodeSection: {
      width: 50,
      backgroundColor: theme.colors.primaryDark,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.xsmall,
      justifyContent: 'center',
      alignItems: 'center',
    },
    barcode: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
      height: '80%',
    },
    barLine: {
      width: 30,
      height: 2,
      backgroundColor: theme.colors.white,
    },
    barLineThin: {
      width: 30,
      height: 1,
      backgroundColor: theme.colors.white,
    },
    leftCircle: {
      position: 'absolute',
      left: -20,
      top: '50%',
      width: 30,
      height: 30,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      transform: [{ translateY: -20 }],
      zIndex: 1,
    },
    rightCircle: {
      position: 'absolute',
      right: -20,
      top: '50%',
      width: 30,
      height: 30,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      transform: [{ translateY: -20 }],
      zIndex: 1,
    },
    topTriangle: {
      position: 'absolute',
      top: -20,
      left: '35%',
      width: 25,
      height: 25,
      backgroundColor: theme.colors.background,
      transform: [{ translateX: -15 }, { rotate: '45deg' }],
      zIndex: 1,
    },
    bottomTriangle: {
      position: 'absolute',
      bottom: -20,
      left: '35%',
      width: 25,
      height: 25,
      backgroundColor: theme.colors.background,
      transform: [{ translateX: -15 }, { rotate: '45deg' }],
      zIndex: 1,
    },
  });

  // Generate barcode pattern
  const generateBarcode = () => {
    const bars = [];
    for (let i = 0; i < 35; i++) {
      const isThin = Math.random() > 0.5;
      bars.push(
        <View
          key={i}
          style={isThin ? styles.barLineThin : styles.barLine}
        />
      );
    }
    return bars;
  };

  const posterUrl = mediaItem.posterPath
    ? getTMDBImageUrl(mediaItem.posterPath, 'w342')
    : null;

  const truncatedOverview =
    mediaItem.overview.length > 800
      ? `${mediaItem.overview.substring(0, 800)}...`
      : mediaItem.overview;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftCircle}></View>
      <View style={styles.rightCircle}></View>

      <View style={styles.topTriangle}></View>
      <View style={styles.bottomTriangle}></View>
      {/* Left Poster Section */}
      <View style={styles.posterSection}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Icon
              name="image-outline"
              size={32}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
      </View>

      {/* Middle Content Section */}
      <View style={styles.middleSection}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={0}>
            {mediaItem.title}
          </Text>



          {truncatedOverview ? (
            <Text style={styles.overview} numberOfLines={6}>
              {truncatedOverview}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: DESIGN_CONSTANTS.SPACING.medium }}>
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Icon name="calendar" size={16} color={theme.colors.white} />
              <Text style={styles.metadataText}>
                {formatReleaseDate(mediaItem.releaseDate)}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Icon name="star" size={16} color="#FFFFFF" />
              <Text style={styles.metadataText}>
                {mediaItem.voteAverage.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.mediaTypeTag}>
            <Text style={styles.mediaTypeText}>
              {mediaItem.mediaType === 'tv' ? 'TV Show' : 'Movie'}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Barcode Section */}
      <View style={styles.barcodeSection}>
        <View style={styles.barcode}>
          {generateBarcode()}
        </View>
      </View>
    </TouchableOpacity>
  );
};