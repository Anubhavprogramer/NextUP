// Utility helper functions for NextUP

import { v4 as uuidv4 } from 'uuid';
import { MediaItem, CollectionItem, CollectionStatus, TMDBGenre, VALIDATION_CONSTANTS } from '../Types';
import { TMDB_CONFIG } from './constants';

/**
 * Generate a unique UUID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown Date';
  }
};

/**
 * Format date to short string (e.g., "2023")
 */
export const formatYear = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch {
    return 'Unknown';
  }
};

/**
 * Get full TMDB image URL
 */
export const getTMDBImageUrl = (
  path: string | null,
  size: string = TMDB_CONFIG.POSTER_SIZES.MEDIUM
): string | null => {
  if (!path) return null;
  return `${TMDB_CONFIG.BASE_IMAGE_URL}${size}${path}`;
};

/**
 * Get poster URL with fallback
 */
export const getPosterUrl = (
  posterPath: string | null,
  size: string = TMDB_CONFIG.POSTER_SIZES.MEDIUM
): string | null => {
  return getTMDBImageUrl(posterPath, size);
};

/**
 * Get backdrop URL with fallback
 */
export const getBackdropUrl = (
  backdropPath: string | null,
  size: string = TMDB_CONFIG.BACKDROP_SIZES.MEDIUM
): string | null => {
  return getTMDBImageUrl(backdropPath, size);
};

/**
 * Format rating to one decimal place
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Get display title for media item (handles both movies and TV shows)
 */
export const getMediaTitle = (mediaItem: MediaItem): string => {
  // TMDB returns 'title' for movies and 'name' for TV shows
  return mediaItem.title || (mediaItem as any).name || 'Unknown Title';
};

/**
 * Get release date for media item (handles both movies and TV shows)
 */
export const getMediaReleaseDate = (mediaItem: MediaItem): string => {
  // TMDB returns 'release_date' for movies and 'first_air_date' for TV shows
  return mediaItem.releaseDate || (mediaItem as any).first_air_date || '';
};

/**
 * Create a collection item from a media item
 */
export const createCollectionItem = (
  mediaItem: MediaItem,
  status: CollectionStatus
): CollectionItem => {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    mediaItem,
    status,
    addedAt: now,
    updatedAt: now,
  };
};

/**
 * Update collection item status
 */
export const updateCollectionItemStatus = (
  item: CollectionItem,
  newStatus: CollectionStatus
): CollectionItem => {
  return {
    ...item,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    // Clear watched date if moving away from watched status
    ...(newStatus !== 'watched' && { watchedDate: undefined }),
    // Set watched date if moving to watched status
    ...(newStatus === 'watched' && !item.watchedDate && { 
      watchedDate: new Date().toISOString() 
    }),
  };
};

/**
 * Get collection status display name
 */
export const getCollectionStatusDisplayName = (status: CollectionStatus): string => {
  switch (status) {
    case 'watched':
      return 'Watched';
    case 'watching':
      return 'Currently Watching';
    case 'will_watch':
      return 'Want to Watch';
    default:
      return 'Unknown';
  }
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Validate user profile data
 */
export const validateUserProfile = (profile: {
  name?: string;
  age?: number;
  preferredGenres?: number[];
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!profile.name || profile.name.trim().length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
    errors.push('Name is required');
  }
  
  if (profile.name && profile.name.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
    errors.push(`Name cannot exceed ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`);
  }
  
  if (!profile.age || profile.age < VALIDATION_CONSTANTS.MIN_AGE || profile.age > VALIDATION_CONSTANTS.MAX_AGE) {
    errors.push(`Age must be between ${VALIDATION_CONSTANTS.MIN_AGE} and ${VALIDATION_CONSTANTS.MAX_AGE}`);
  }
  
  if (!profile.preferredGenres || profile.preferredGenres.length === 0) {
    errors.push('At least one preferred genre is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().replace(/[^\w\s-]/gi, '');
};

/**
 * Check if media item is already in collection
 */
export const isMediaInCollection = (
  mediaId: number,
  collection: CollectionItem[]
): boolean => {
  return collection.some(item => item.mediaItem.id === mediaId);
};

/**
 * Find collection item by media ID
 */
export const findCollectionItemByMediaId = (
  mediaId: number,
  collection: CollectionItem[]
): CollectionItem | undefined => {
  return collection.find(item => item.mediaItem.id === mediaId);
};

/**
 * Sort collection items by date added (newest first)
 */
export const sortCollectionByDateAdded = (items: CollectionItem[]): CollectionItem[] => {
  return [...items].sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
};

/**
 * Sort collection items by title (A-Z)
 */
export const sortCollectionByTitle = (items: CollectionItem[]): CollectionItem[] => {
  return [...items].sort((a, b) => 
    getMediaTitle(a.mediaItem).localeCompare(getMediaTitle(b.mediaItem))
  );
};

/**
 * Sort collection items by rating (highest first)
 */
export const sortCollectionByRating = (items: CollectionItem[]): CollectionItem[] => {
  return [...items].sort((a, b) => 
    b.mediaItem.voteAverage - a.mediaItem.voteAverage
  );
};

/**
 * Get genre names from genre IDs
 */
export const getGenreNames = (genreIds: number[], allGenres: TMDBGenre[]): string[] => {
  return genreIds
    .map(id => allGenres.find(genre => genre.id === id)?.name)
    .filter(Boolean) as string[];
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Calculate collection statistics
 */
export const calculateCollectionStats = (collections: {
  watched: CollectionItem[];
  watching: CollectionItem[];
  will_watch: CollectionItem[];
}) => {
  const totalItems = collections.watched.length + 
                   collections.watching.length + 
                   collections.will_watch.length;
  
  const movieCount = Object.values(collections)
    .flat()
    .filter(item => item.mediaItem.mediaType === 'movie').length;
    
  const tvCount = Object.values(collections)
    .flat()
    .filter(item => item.mediaItem.mediaType === 'tv').length;
  
  return {
    total: totalItems,
    watched: collections.watched.length,
    watching: collections.watching.length,
    willWatch: collections.will_watch.length,
    movies: movieCount,
    tvShows: tvCount,
  };
};

// Aliases for consistency with MediaCard component
export const formatReleaseDate = formatYear;
export const getImageUrl = getTMDBImageUrl;