import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileSetupScreen } from '../Screens/ProfileSetupScreen';
import { HomeScreen } from '../Screens/HomeScreen';
import { SearchScreen } from '../Screens/SearchScreen';
import { CollectionScreen } from '../Screens/CollectionScreen';
import { LoadingScreen } from '../Screens/LoadingScreen';
import { ErrorScreen } from '../Screens/ErrorScreen';
import { useApp } from '../Store/AppContext';
import { RootStackParamList } from '../Types';

const Stack = createNativeStackNavigator<RootStackParamList>();

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

  // Show main app for existing users with navigation
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={HomeScreen} />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            headerShown: true,
            title: 'Search Movies & TV Shows',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="Collection" 
          component={CollectionScreen}
          options={{
            headerShown: true,
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;