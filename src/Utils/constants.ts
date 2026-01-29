// Design constants and theme configuration for NextUP

export const DESIGN_CONSTANTS = {
  // Spacing
  SPACING: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
  },
  
  // Border radius
  BORDER_RADIUS: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,
  },
  
  // Typography
  TYPOGRAPHY: {
    sizes: {
      caption: 12,
      body: 14,
      subtitle: 16,
      title: 18,
      heading: 20,
      largeTitle: 24,
      display: 32,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
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
    primary: '#d06818ff',
    primaryDark: '#743700',
    primaryLight: '#cc5200ff',
    
    // Secondary colors
    secondary: '#5856D6',
    secondaryLight: '#7B7AE8',
    secondaryDark: '#3F3EA3',
    
    // Background colors
    background: '#FADCC2',
    backgroundSecondary: '#F2F2F7',
    backgroundTertiary: '#FFFFFF',
    
    // Surface colors
    surface: '#d7c7aaff',
    surfaceSecondary: '#F2F2F7',
    
    // Text colors
    text: '#BC6C25',
    textSecondary: '#000000ff',
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
    // Primary colors (Deep Peach / Burnt Orange)
    primary: '#B85A2A',        // Deep Peach (darkened)
    primaryLight: '#D97A45',   // Warm highlight
    primaryDark: '#7A3318',    // Burnt coffee

    // Secondary colors (Muted Pine / Olive)
    secondary: '#6B6A3D',
    secondaryLight: '#8A894F',
    secondaryDark: '#4B4A2B',

    // Background colors (Coffee / Pine inspired)
    background: '#1E140F',             // Dark Coffee
    backgroundSecondary: '#2A1C16',    // Leather Couch
    backgroundTertiary: '#35251D',     // Warm Surface

    // Surface colors
    surface: '#2F2019',
    surfaceSecondary: '#3A2A21',

    // Text colors (Creme based)
    text: '#F1E3C6',            // Creme
    textSecondary: '#D8C9A8',   // Muted creme
    textTertiary: '#A9997A',    // Dusty text
    textInverse: '#1E140F',

    // Border colors
    border: '#4A3A30',
    borderLight: '#5A4A3F',

    // Status colors (Earth toned)
    success: '#7D9A6C',   // Muted green
    warning: '#C47A2C',   // Clay orange
    error: '#9E3B2F',     // Muted maroon
    info: '#8B6F4E',      // Warm neutral info

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.65)',

    // Card shadow
    shadow: 'rgba(0, 0, 0, 0.6)',
  },

  // Shadow styles (softer for dark UI)
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
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