/**
 * NextUP - Media Tracking App
 * Main application entry point
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/Store/ThemeContext';
import { AppProvider } from './src/Store/AppContext';
import { AppNavigator } from './src/Navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <AppNavigator />
    </>
  );
}

export default App;
