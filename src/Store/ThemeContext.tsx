import React, { createContext, useContext, ReactNode } from 'react';
import { LIGHT_THEME, Theme } from '../Utils/constants';

/**
 * NextUP ships a single (light, peach) theme. The native projects also pin
 * light mode (iOS UIUserInterfaceStyle, Android Light AppTheme) so system
 * UI never switches to dark either. Components still read colors through
 * useTheme() so the palette stays in one place.
 */
interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const contextValue: ThemeContextType = { theme: LIGHT_THEME };

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/** A color override from props, or the named theme color. */
export const useThemeColor = (
  props: { light?: string },
  colorName: keyof Theme['colors'],
) => {
  const { theme } = useTheme();
  return props.light ?? theme.colors[colorName];
};
