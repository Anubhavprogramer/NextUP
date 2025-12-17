// Core type definitions for NextUP media tracking app

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  preferredGenres: number[]; // TMDB genre IDs
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: number; // TMDB ID
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  mediaType: 'movie' | 'tv';
  originalLanguage: string;
}

export interface CollectionItem {
  id: string; // UUID
  mediaItem: MediaItem;
  status: CollectionStatus;
  addedAt: string;
  updatedAt: string;
  userRating?: number; // 1-10 scale
  notes?: string;
  watchedDate?: string; // for watched items
  progress?: number; // for watching items (episodes/percentage)
}

export interface AppState {
  user: UserProfile | null;
  collections: {
    watched: CollectionItem[];
    watching: CollectionItem[];
    will_watch: CollectionItem[];
  };
  theme: ThemePreference;
  isFirstLaunch: boolean;
}

// Utility types
export type CollectionStatus = 'watched' | 'watching' | 'will_watch';
export type ThemePreference = 'light' | 'dark' | 'system';
export type MediaType = 'movie' | 'tv';

// Component prop types
export interface ThemedComponentProps {
  lightColor?: string;
  darkColor?: string;
  style?: any;
}

export interface MediaCardProps {
  mediaItem: MediaItem;
  onPress?: () => void;
  showStatus?: boolean;
  collectionStatus?: CollectionStatus;
}

export interface MediaListProps {
  data: MediaItem[];
  onItemPress?: (item: MediaItem) => void;
  onRefresh?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

// Navigation types
export type RootStackParamList = {
  ProfileSetup: undefined;
  Main: undefined;
  MediaDetail: { mediaItem: MediaItem };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Watched: undefined;
  Watching: undefined;
  WillWatch: undefined;
};

// API response types
export interface TMDBSearchResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

// TMDB Detail response types
export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBImagesResponse {
  id: number;
  backdrops: TMDBImage[];
  logos: TMDBImage[];
  posters: TMDBImage[];
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: TMDBGenre[];
  videos?: TMDBVideosResponse;
  images?: TMDBImagesResponse;
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: TMDBGenre[];
  videos?: TMDBVideosResponse;
  images?: TMDBImagesResponse;
}

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  COLLECTIONS: 'collections',
  THEME_PREFERENCE: 'theme_preference',
  IS_FIRST_LAUNCH: 'is_first_launch',
} as const;

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class StorageError extends Error {
  constructor(message: string, public code: string = 'STORAGE_ERROR') {
    super(message);
    this.name = 'StorageError';
  }
}

export class APIError extends Error {
  constructor(message: string, public code: string = 'API_ERROR', public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}
// Storage and validation types
export interface StorageManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DataMigration {
  version: number;
  migrate: (data: any) => any;
}

// Collection management types
export interface CollectionOperations {
  addItem: (mediaItem: MediaItem, status: CollectionStatus) => Promise<CollectionItem>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemStatus: (itemId: string, newStatus: CollectionStatus) => Promise<CollectionItem>;
  updateItemRating: (itemId: string, rating: number) => Promise<CollectionItem>;
  updateItemNotes: (itemId: string, notes: string) => Promise<CollectionItem>;
  updateItemProgress: (itemId: string, progress: number) => Promise<CollectionItem>;
  getItemsByStatus: (status: CollectionStatus) => Promise<CollectionItem[]>;
  findItemByMediaId: (mediaId: number) => Promise<CollectionItem | null>;
  getAllItems: () => Promise<CollectionItem[]>;
}

// Data export/import types
export interface ExportData {
  version: string;
  exportDate: string;
  userProfile: UserProfile;
  collections: {
    watched: CollectionItem[];
    watching: CollectionItem[];
    will_watch: CollectionItem[];
  };
  metadata: {
    totalItems: number;
    appVersion: string;
  };
}

export interface ImportResult {
  success: boolean;
  importedItems: number;
  skippedItems: number;
  errors: string[];
}

// Search and filter types
export interface SearchFilters {
  mediaType?: MediaType;
  genre?: number;
  yearRange?: {
    start: number;
    end: number;
  };
  rating?: {
    min: number;
    max: number;
  };
}

export interface SortOptions {
  field: 'title' | 'dateAdded' | 'rating' | 'releaseDate';
  direction: 'asc' | 'desc';
}

// Statistics types
export interface CollectionStats {
  total: number;
  watched: number;
  watching: number;
  willWatch: number;
  movies: number;
  tvShows: number;
  averageRating: number;
  totalWatchTime?: number; // in minutes
  genreBreakdown: { [genreId: number]: number };
  monthlyActivity: { [month: string]: number };
}

// Form validation types
export interface ProfileFormData {
  name: string;
  age: string; // String for form input, converted to number
  preferredGenres: number[];
}

export interface ProfileValidationErrors {
  name?: string;
  age?: string;
  preferredGenres?: string;
}

// Storage operation types
export type StorageOperation = 'read' | 'write' | 'delete' | 'clear';

export interface StorageOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: StorageError;
  operation: StorageOperation;
  key?: string;
  timestamp: string;
}

// Cache types for offline functionality
export interface CacheEntry<T> {
  data: T;
  timestamp: string;
  expiresAt?: string;
}

export interface CacheManager {
  set<T>(key: string, data: T, ttl?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  cleanup(): Promise<void>; // Remove expired entries
}

// Backup and sync types
export interface BackupMetadata {
  id: string;
  createdAt: string;
  size: number;
  itemCount: number;
  checksum: string;
}

export interface SyncStatus {
  lastSync?: string;
  pendingChanges: number;
  conflictCount: number;
  isOnline: boolean;
}

// Event types for data changes
export type DataChangeEvent = 
  | { type: 'ITEM_ADDED'; payload: { item: CollectionItem } }
  | { type: 'ITEM_REMOVED'; payload: { itemId: string } }
  | { type: 'ITEM_UPDATED'; payload: { item: CollectionItem } }
  | { type: 'PROFILE_UPDATED'; payload: { profile: UserProfile } }
  | { type: 'COLLECTION_CLEARED'; payload: { status: CollectionStatus } };

export interface DataChangeListener {
  (event: DataChangeEvent): void;
}

// Type guards for runtime type checking
export const isUserProfile = (obj: any): obj is UserProfile => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.age === 'number' &&
    Array.isArray(obj.preferredGenres) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

export const isMediaItem = (obj: any): obj is MediaItem => {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.overview === 'string' &&
    (obj.posterPath === null || typeof obj.posterPath === 'string') &&
    (obj.backdropPath === null || typeof obj.backdropPath === 'string') &&
    typeof obj.releaseDate === 'string' &&
    typeof obj.voteAverage === 'number' &&
    Array.isArray(obj.genreIds) &&
    ['movie', 'tv'].includes(obj.mediaType) &&
    typeof obj.originalLanguage === 'string';
};

export const isCollectionItem = (obj: any): obj is CollectionItem => {
  return obj &&
    typeof obj.id === 'string' &&
    isMediaItem(obj.mediaItem) &&
    ['watched', 'watching', 'will_watch'].includes(obj.status) &&
    typeof obj.addedAt === 'string' &&
    typeof obj.updatedAt === 'string';
};

export const isCollectionStatus = (status: any): status is CollectionStatus => {
  return ['watched', 'watching', 'will_watch'].includes(status);
};

// Utility type for partial updates
export type PartialUpdate<T> = {
  [P in keyof T]?: T[P];
};

// Type for collection item updates
export type CollectionItemUpdate = PartialUpdate<Pick<CollectionItem, 'status' | 'userRating' | 'notes' | 'progress' | 'watchedDate'>>;

// Constants for data validation
export const VALIDATION_CONSTANTS = {
  MIN_AGE: 1,
  MAX_AGE: 120,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 50,
  MIN_RATING: 1,
  MAX_RATING: 10,
  MIN_PROGRESS: 0,
  MAX_PROGRESS: 100,
  MAX_NOTES_LENGTH: 500,
} as const;