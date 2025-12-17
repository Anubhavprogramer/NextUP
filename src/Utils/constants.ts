// Design constants and theme configuration for NextUP

export const DESIGN_CONSTANTS = {
  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    ROUND: 50,
  },
  
  // Typography
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  
  FONT_WEIGHTS: {
    LIGHT: '300' as const,
    REGULAR: '400' as const,
    MEDIUM: '500' as const,
    SEMIBOLD: '600' as const,
    BOLD: '700' as const,
  },
  
  // Layout
  CONTAINER_PADDING: 16,
  CARD_PADDING: 16,
  BUTTON_HEIGHT: 48,
  INPUT_HEIGHT: 48,
  
  // Images
  POSTER_ASPECT_RATIO: 2 / 3, // Standard movie poster ratio
  BACKDROP_ASPECT_RATIO: 16 / 9,
  
  // Animation
  ANIMATION_DURATION: 200,
  
  // Touch targets
  MIN_TOUCH_TARGET: 44,
} as const;

export const LIGHT_THEME = {
  colors: {
    // Primary colors
    primary: '#007AFF',
    primaryLight: '#4DA2FF',
    primaryDark: '#0056CC',
    
    // Secondary colors
    secondary: '#5856D6',
    secondaryLight: '#7B7AE8',
    secondaryDark: '#3F3EA3',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',
    backgroundTertiary: '#FFFFFF',
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F2F2F7',
    
    // Text colors
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#C6C6C8',
    borderLight: '#E5E5EA',
    
    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',
    
    // Card shadow
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Shadow styles
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

export const DARK_THEME = {
  colors: {
    // Primary colors
    primary: '#0A84FF',
    primaryLight: '#409CFF',
    primaryDark: '#0056CC',
    
    // Secondary colors
    secondary: '#5E5CE6',
    secondaryLight: '#7D7AFF',
    secondaryDark: '#3F3EA3',
    
    // Background colors
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',
    
    // Surface colors
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    textInverse: '#000000',
    
    // Border colors
    border: '#38383A',
    borderLight: '#48484A',
    
    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    
    // Card shadow
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Shadow styles
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

// Export theme type for TypeScript
export type Theme = typeof LIGHT_THEME;

// TMDB configuration
export const TMDB_CONFIG = {
  BASE_IMAGE_URL: 'https://image.tmdb.org/t/p/',
  POSTER_SIZES: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    ORIGINAL: 'original',
  },
  BACKDROP_SIZES: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
  },
} as const;

// App configuration
export const APP_CONFIG = {
  SEARCH_DEBOUNCE_MS: 500,
  MAX_SEARCH_RESULTS: 20,
  STORAGE_RETRY_ATTEMPTS: 3,
  API_TIMEOUT_MS: 10000,
  PROPERTY_TEST_ITERATIONS: 100,
} as const;