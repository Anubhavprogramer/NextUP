import React from 'react';
import { ProfileSetupScreen } from '../Screens/ProfileSetupScreen';
import { HomeScreen } from '../Screens/HomeScreen';
import { LoadingScreen } from '../Screens/LoadingScreen';
import { ErrorScreen } from '../Screens/ErrorScreen';
import { useApp } from '../Store/AppContext';

export const AppNavigator: React.FC = () => {
  const { loading, error, isFirstLaunch, userProfile, refreshAppState } = useApp();

  // Show loading screen while app state is loading
  if (loading) {
    return <LoadingScreen message="Loading NextUP..." />;
  }

  // Show error screen if there's an error loading app state
  if (error) {
    return <ErrorScreen error={error} onRetry={refreshAppState} />;
  }

  // Show profile setup for first-time users or users without a profile
  if (isFirstLaunch || !userProfile) {
    return (
      <ProfileSetupScreen
        onProfileCreated={() => {
          // Refresh app state after profile creation
          refreshAppState();
        }}
      />
    );
  }

  // Show main app for existing users
  return <HomeScreen />;
};

export default AppNavigator;