import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemedText, ThemedView } from '../Themed';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
import { TMDBGenre } from '../../Types';
import { getAllGenres } from '../../API/tmdb';

export interface GenreSelectorProps {
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
  error?: string;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedGenres,
  onGenresChange,
  error,
}) => {
  const { theme } = useTheme();
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await getAllGenres();
      setGenres(response.genres);
    } catch (error) {
      console.error('Failed to load genres:', error);
      setLoadError('Failed to load genres. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreId: number) => {
    const isSelected = selectedGenres.includes(genreId);
    if (isSelected) {
      onGenresChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  const renderGenreChip = (genre: TMDBGenre) => {
    const isSelected = selectedGenres.includes(genre.id);
    
    return (
      <TouchableOpacity
        key={genre.id}
        style={[
          styles.genreChip,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => toggleGenre(genre.id)}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[
            styles.genreText,
            { color: isSelected ? theme.colors.textInverse : theme.colors.text },
          ]}
          variant="body"
        >
          {genre.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText variant="subtitle" style={styles.label}>
          Preferred Genres
        </ThemedText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <ThemedText variant="body" style={styles.loadingText}>
            Loading genres...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (loadError) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText variant="subtitle" style={styles.label}>
          Preferred Genres
        </ThemedText>
        <View style={styles.errorContainer}>
          <ThemedText
            variant="body"
            style={[styles.errorText, { color: theme.colors.error }]}
          >
            {loadError}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: theme.colors.primary }]}
            onPress={loadGenres}
          >
            <ThemedText
              variant="body"
              style={[styles.retryText, { color: theme.colors.primary }]}
            >
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="subtitle" style={styles.label}>
        Preferred Genres
      </ThemedText>
      <ThemedText variant="caption" style={styles.helperText}>
        Select at least one genre you enjoy
      </ThemedText>
      
      <ScrollView
        style={styles.genresContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.genresGrid}>
          {genres.map(renderGenreChip)}
        </View>
      </ScrollView>

      {error && (
        <ThemedText
          variant="caption"
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </ThemedText>
      )}

      {selectedGenres.length > 0 && (
        <ThemedText variant="caption" style={styles.selectedCount}>
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DESIGN_CONSTANTS.SPACING.MD,
  },
  label: {
    marginBottom: DESIGN_CONSTANTS.SPACING.XS,
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.MEDIUM,
  },
  helperText: {
    marginBottom: DESIGN_CONSTANTS.SPACING.MD,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN_CONSTANTS.SPACING.LG,
  },
  loadingText: {
    marginLeft: DESIGN_CONSTANTS.SPACING.SM,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: DESIGN_CONSTANTS.SPACING.LG,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: DESIGN_CONSTANTS.SPACING.SM,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.MD,
    paddingHorizontal: DESIGN_CONSTANTS.SPACING.MD,
    paddingVertical: DESIGN_CONSTANTS.SPACING.SM,
  },
  retryText: {
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.MEDIUM,
  },
  genresContainer: {
    maxHeight: 200,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DESIGN_CONSTANTS.SPACING.SM,
  },
  genreChip: {
    borderWidth: 1,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.ROUND,
    paddingHorizontal: DESIGN_CONSTANTS.SPACING.MD,
    paddingVertical: DESIGN_CONSTANTS.SPACING.SM,
    marginBottom: DESIGN_CONSTANTS.SPACING.SM,
  },
  genreText: {
    fontSize: DESIGN_CONSTANTS.FONT_SIZES.SM,
  },
  selectedCount: {
    marginTop: DESIGN_CONSTANTS.SPACING.SM,
    textAlign: 'center',
    opacity: 0.7,
  },
});