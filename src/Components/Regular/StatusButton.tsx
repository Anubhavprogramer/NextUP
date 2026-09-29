import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedText } from '../Themed/ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
import { CollectionStatus } from '../../Types';

interface StatusButtonProps {
  iconName: string;
  label?: string;
  status: CollectionStatus;
  currentStatus?: CollectionStatus;
  isLoading?: boolean;
  onPress: () => void;
  iconColor?: string;
  disabled?: boolean;
  activeOpacity?: number;
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  iconName,
  label,
  status,
  currentStatus,
  isLoading = false,
  onPress,
  iconColor,
  disabled = false,
  activeOpacity = 0.7,
}) => {
  const { theme } = useTheme();

  const isActive = currentStatus === status;
  const isButtonDisabled = disabled || isLoading || isActive;

  const styles = StyleSheet.create({
    statusButton: {
      flex: 1,
      marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.primaryDark,
    },
    statusButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    statusButtonDisabled: {
      opacity: 0.6,
    },
    statusButtonText: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
      marginTop: DESIGN_CONSTANTS.SPACING.xsmall,
      color: theme.colors.text,
    },
    statusButtonTextActive: {
      color: theme.colors.background,
    },
  });

  return (
    <TouchableOpacity
      disabled={isButtonDisabled}
      style={[
        styles.statusButton,
        isActive && styles.statusButtonActive,
        isLoading && !isActive && styles.statusButtonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={isButtonDisabled ? 1 : activeOpacity}
    >
      <Icon
        name={iconName}
        size={20}
        color={
          iconColor || (isActive ? theme.colors.background : theme.colors.primary)
        }
      />
      {label && (
        <ThemedText
          style={[
            styles.statusButtonText,
            isActive && styles.statusButtonTextActive,
          ]}
        >
          {label}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};
