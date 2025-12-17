import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { useTheme } from '../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../Utils/constants';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: DESIGN_CONSTANTS.SPACING.large,
    },
    message: {
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body" style={styles.message}>
          {message}
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
};