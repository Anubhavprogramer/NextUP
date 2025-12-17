import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { ThemedButton } from '../Components/Themed/ThemedButton';
import { useTheme } from '../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../Utils/constants';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  onRetry,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: DESIGN_CONSTANTS.SPACING.large,
    },
    icon: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    title: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
      textAlign: 'center',
    },
    message: {
      marginBottom: DESIGN_CONSTANTS.SPACING.xlarge,
      textAlign: 'center',
      lineHeight: 22,
    },
    button: {
      minWidth: 120,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Icon
          name="alert-circle-outline"
          size={64}
          color={theme.colors.error}
          style={styles.icon}
        />
        
        <ThemedText variant="title" style={styles.title}>
          Something went wrong
        </ThemedText>
        
        <ThemedText variant="body" style={styles.message}>
          {error}
        </ThemedText>
        
        {onRetry && (
          <ThemedButton
            title="Try Again"
            onPress={onRetry}
            variant="primary"
            style={styles.button}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
};