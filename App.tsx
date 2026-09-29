/**
 * NextUP - Media Tracking App
 * Main application entry point
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/Store/ThemeContext';
import { AppProvider } from './src/Store/AppContext';
import { ToastProvider } from './src/Store/ToastContext';
import { ShareIntentProvider } from './src/Store/ShareIntentContext';
import { DialogProvider } from './src/Store/DialogContext';
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
            <DialogProvider>
              <ShareIntentProvider>
                <AppContent />
              </ShareIntentProvider>
            </DialogProvider>
          </ToastProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
}

export default App;
