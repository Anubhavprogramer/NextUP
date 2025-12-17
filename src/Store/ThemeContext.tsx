import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_THEME, DARK_THEME, Theme } from '../Utils/constants';
import { ThemePreference, STORAGE_KEYS } from '../Types';

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
    Appearance.getColorScheme()
  );

  // Determine the actual theme to use
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (themePreference === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference;
  };

  const effectiveTheme = getEffectiveTheme();
  const theme = effectiveTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const isDark = effectiveTheme === 'dark';

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
        if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
          setThemePreferenceState(savedPreference as ThemePreference);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Save theme preference to storage
  const setThemePreference = async (preference: ThemePreference) => {
    try {
      setThemePreferenceState(preference);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, preference);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Toggle between light and dark (ignores system preference)
  const toggleTheme = () => {
    const newPreference = effectiveTheme === 'dark' ? 'light' : 'dark';
    setThemePreference(newPreference);
  };

  const contextValue: ThemeContextType = {
    theme,
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