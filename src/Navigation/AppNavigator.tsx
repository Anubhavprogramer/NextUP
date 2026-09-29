import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileSetupScreen } from '../Screens/ProfileSetupScreen';
import { HomeScreen } from '../Screens/HomeScreen';
import { SearchScreen } from '../Screens/SearchScreen';
import { CollectionScreen } from '../Screens/CollectionScreen';
import { MediaDetailScreen } from '../Screens/MediaDetailScreen';
import { ReelImportScreen } from '../Screens/ReelImportScreen';
import { LoadingScreen } from '../Screens/LoadingScreen';
import { ErrorScreen } from '../Screens/ErrorScreen';
import { useApp } from '../Store/AppContext';
import { useShareIntent } from '../Store/ShareIntentContext';
import { RootStackParamList } from '../Types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { loading, error, isFirstLaunch, userProfile, refreshAppState } = useApp();
  const { pendingShare, clearPendingShare } = useShareIntent();
  const [navigationReady, setNavigationReady] = useState(false);

  const showMainApp = !loading && !error && !isFirstLaunch && !!userProfile;

  // The container unmounts whenever a gate screen shows, so readiness resets.
  useEffect(() => {
    if (!showMainApp) setNavigationReady(false);
  }, [showMainApp]);

  // Open shared reels once the main stack exists (after loading/onboarding).
  useEffect(() => {
    if (showMainApp && navigationReady && pendingShare && navigationRef.isReady()) {
      navigationRef.navigate('ReelImport', { sharedText: pendingShare });
      clearPendingShare();
    }
  }, [showMainApp, navigationReady, pendingShare, clearPendingShare]);

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

  // Show main app for existing users with navigation
  return (
    <NavigationContainer ref={navigationRef} onReady={() => setNavigationReady(true)}>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={HomeScreen}/>
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            headerShown: false,
            title: 'Search Movies & TV Shows',
          }}
        />
        <Stack.Screen 
          name="Collection" 
          component={CollectionScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="ReelImport" component={ReelImportScreen} />
        <Stack.Screen 
          name="MediaDetail" 
          component={MediaDetailScreen}
          options={{
            headerShown: false,
            title: 'Media Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;