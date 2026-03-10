/**
 * NextUP - Media Tracking App
 * Main application entry point
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/Store/ThemeContext';
import { AppProvider } from './src/Store/AppContext';
import { ToastProvider } from './src/Store/ToastContext';
import { AppNavigator } from './src/Navigation/AppNavigator';
import { logger } from './src/Utils/debugger';

function App() {
  useEffect(() => {
    logger.info('App', 'Application started');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    try {
      logger.debug('AppContent', 'Theme changed', { isDark });
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    } catch (error) {
      logger.error('AppContent', 'Failed to update status bar', error);
    }
  }, [isDark]);

  return (
    <>
      <AppNavigator />
    </>
  );
}

export default App;
