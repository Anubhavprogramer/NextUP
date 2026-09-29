import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_THEME, DARK_THEME, Theme } from '../Utils/constants';
import { ThemePreference, STORAGE_KEYS } from '../Types';
import { logger } from '../Utils/debugger';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  isDark: boolean;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() || 'light'
  );

  // Determine the actual theme to use
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (themePreference === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference;
  };

  const effectiveTheme = getEffectiveTheme();
  const theme = (effectiveTheme === 'dark' ? DARK_THEME : LIGHT_THEME) as Theme;
  const isDark = effectiveTheme === 'dark';

  // Safety check
  if (!theme || !theme.colors) {
    logger.error('ThemeProvider', 'Theme object is invalid', {
      effectiveTheme,
      hasTheme: !!theme,
      hasColors: !!theme?.colors,
    });
  }

  // Load theme preference from storage on mount
  useEffect(() => {
    try {
      logger.info('ThemeProvider', 'Initializing theme provider', { 
        themePreference: 'system',
        systemTheme: Appearance.getColorScheme() 
      });
    } catch (error) {
      logger.error('ThemeProvider', 'Error in initialization logging', error);
    }

    const loadThemePreference = async () => {
      try {
        logger.debug('ThemeProvider', 'Loading theme preference from storage');
        const savedPreference = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
        logger.debug('ThemeProvider', 'Loaded theme preference', { savedPreference });
        
        if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
          setThemePreferenceState(savedPreference as ThemePreference);
          logger.info('ThemeProvider', 'Theme preference loaded', { preference: savedPreference });
        }
      } catch (error) {
        logger.error('ThemeProvider', 'Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    try {
      logger.debug('ThemeProvider', 'Setting up system theme listener');
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        logger.debug('ThemeProvider', 'System theme changed', { colorScheme });
        try {
          setSystemTheme(colorScheme);
          logger.info('ThemeProvider', 'System theme updated', { colorScheme });
        } catch (error) {
          logger.error('ThemeProvider', 'Error updating system theme', error);
        }
      });

      return () => {
        try {
          subscription?.remove();
          logger.debug('ThemeProvider', 'System theme listener removed');
        } catch (error) {
          logger.error('ThemeProvider', 'Error removing theme listener', error);
        }
      };
    } catch (error) {
      logger.error('ThemeProvider', 'Failed to set up system theme listener', error);
      return undefined;
    }
  }, []);

  // Save theme preference to storage
  const setThemePreference = async (preference: ThemePreference) => {
    try {
      logger.debug('ThemeProvider', 'Setting theme preference', { preference });
      setThemePreferenceState(preference);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, preference);
      logger.info('ThemeProvider', 'Theme preference saved', { preference });
    } catch (error) {
      logger.error('ThemeProvider', 'Failed to save theme preference', { preference, error });
    }
  };

  // Toggle between light and dark (ignores system preference)
  const toggleTheme = () => {
    try {
      const newPreference = effectiveTheme === 'dark' ? 'light' : 'dark';
      logger.debug('ThemeProvider', 'Toggling theme', { from: effectiveTheme, to: newPreference });
      setThemePreference(newPreference);
    } catch (error) {
      logger.error('ThemeProvider', 'Failed to toggle theme', error);
    }
  };

  const contextValue: ThemeContextType = {
    theme: theme as Theme,
    themePreference,
    isDark,
    setThemePreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to get theme-aware colors
export const useThemeColor = (
  props: { light?: string; dark?: string },
  colorName: keyof Theme['colors']
) => {
  const { theme, isDark } = useTheme();
  const colorFromProps = props[isDark ? 'dark' : 'light'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return theme.colors[colorName];
  }
};