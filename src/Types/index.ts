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