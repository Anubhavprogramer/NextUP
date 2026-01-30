import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedText } from '../Themed/ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export interface EmptyStateProps {
  icon?: string;
  title?: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  title,
  message,
  buttonText,
  onButtonPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
    },
    iconContainer: {
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    title: {
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginBottom: buttonText ? DESIGN_CONSTANTS.SPACING.large : 0,
    },
    button: {
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
      backgroundColor: theme.colors.primary,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
    },
    buttonText: {
      color: theme.colors.background,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color={theme.colors.primaryDark} />
      </View>

      {title && (
        <ThemedText variant="subtitle" style={[styles.title, { color: theme.colors.primaryDark }]}>
          {title}
        </ThemedText>
      )}

      <ThemedText variant="body" style={[styles.message, { color: theme.colors.primaryDark }]}>
        {message}
      </ThemedText>

    </View>
  );
};
