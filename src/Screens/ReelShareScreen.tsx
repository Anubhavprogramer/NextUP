/**
 * Reel Share Screen
 * Screen for sharing Instagram reels and adding movies to collections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useReels } from '../Hooks/useReels';
import { useTheme } from '../Store/ThemeContext';
import { useToast } from '../Store/ToastContext';
import { MediaItem } from '../Types';
import { logger } from '../Utils/debugger';

export interface ReelShareScreenProps {
  route?: {
    params?: {
      reelUrl?: string;
      collectionStatus?: 'will_watch' | 'watching' | 'watched';
    };
  };
  navigation?: any;
}

export const ReelShareScreen: React.FC<ReelShareScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const { addReelMovie, loading, error } = useReels();
  
  const [selectedMovie, setSelectedMovie] = useState<MediaItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<
    'will_watch' | 'watching' | 'watched'
  >('will_watch');

  const reelUrl = route?.params?.reelUrl || '';
  const defaultCollection = route?.params?.collectionStatus || 'will_watch';

  React.useEffect(() => {
    if (defaultCollection) {
      setSelectedCollection(defaultCollection);
    }
  }, [defaultCollection]);

  const handleAddMovie = async () => {
    if (!reelUrl) {
      showError('No reel URL provided');
      return;
    }

    logger.debug('ReelShareScreen', 'Processing reel', { reelUrl });

    const movie = await addReelMovie(reelUrl, selectedCollection);

    if (movie) {
      setSelectedMovie(movie);
      showSuccess(`Added "${movie.title}" to ${selectedCollection}`);
      logger.info('ReelShareScreen', 'Movie added successfully', {
        title: movie.title,
        collection: selectedCollection,
      });

      // Navigate back after a short delay
      setTimeout(() => {
        if (navigation?.goBack) {
          navigation.goBack();
        }
      }, 1500);
    } else {
      const errorMsg = error || 'Failed to process reel';
      showError(errorMsg);
      logger.error('ReelShareScreen', 'Failed to add movie', { error: errorMsg });
    }
  };

  const collectionOptions: Array<'will_watch' | 'watching' | 'watched'> = [
    'will_watch',
    'watching',
    'watched',
  ];

  const getCollectionLabel = (status: 'will_watch' | 'watching' | 'watched') => {
    switch (status) {
      case 'will_watch':
        return 'Will Watch';
      case 'watching':
        return 'Currently Watching';
      case 'watched':
        return 'Already Watched';
      default:
        return status;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Share from Instagram
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Add the movie from this reel to your collection
        </Text>
      </View>

      {/* Movie Preview */}
      {selectedMovie ? (
        <View style={[styles.moviePreview, { backgroundColor: theme.colors.surface }]}>
          {selectedMovie.posterPath && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w200${selectedMovie.posterPath}` }}
              style={styles.moviePoster}
            />
          )}
          <View style={styles.movieInfo}>
            <Text style={[styles.movieTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {selectedMovie.title}
            </Text>
            <Text style={[styles.movieYear, { color: theme.colors.textSecondary }]}>
              {selectedMovie.releaseDate?.substring(0, 4)}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingLabel, { color: theme.colors.textSecondary }]}>
                Rating:
              </Text>
              <Text style={[styles.ratingValue, { color: theme.colors.primary }]}>
                {selectedMovie.voteAverage?.toFixed(1)}/10
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.placeholder, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
            Processing reel...
          </Text>
        </View>
      )}

      {/* Collection Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Add to Collection
        </Text>
        <View style={styles.collectionButtons}>
          {collectionOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.collectionButton,
                {
                  backgroundColor:
                    selectedCollection === option
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setSelectedCollection(option)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.collectionButtonText,
                  {
                    color:
                      selectedCollection === option
                        ? '#FFFFFF'
                        : theme.colors.text,
                  },
                ]}
              >
                {getCollectionLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error }]}>
          <Text style={[styles.errorText, { color: '#FFFFFF' }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: loading ? theme.colors.textTertiary : theme.colors.primary,
          },
        ]}
        onPress={handleAddMovie}
        disabled={loading || !reelUrl}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text} size="small" />
        ) : (
          <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>
            {selectedMovie ? 'Confirm & Add to Collection' : 'Process Reel'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Info Text */}
      <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
        Once added, you can edit the title, add notes, or remove it from your collection.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    marginBottom: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  moviePreview: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  moviePoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 13,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  collectionButtons: {
    gap: 8,
  },
  collectionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  collectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ReelShareScreen;
