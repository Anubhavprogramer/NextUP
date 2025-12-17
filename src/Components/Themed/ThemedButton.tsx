import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...otherProps
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({
          backgroundColor: disabled ? theme.colors.textTertiary : theme.colors.primary,
        });
        break;
      case 'secondary':
        baseStyle.push({
          backgroundColor: disabled ? theme.colors.textTertiary : theme.colors.secondary,
        });
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.textTertiary : theme.colors.primary,
        });
        break;
    }

    return baseStyle;
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.textInverse;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.textInverse;
      case 'outline':
        return theme.colors.primary;
      default:
        return theme.colors.textInverse;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <ThemedText
          style={[styles.buttonText, { color: getTextColor() }]}
          variant="body"
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: DESIGN_CONSTANTS.BUTTON_HEIGHT,
    paddingHorizontal: DESIGN_CONSTANTS.SPACING.large,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: DESIGN_CONSTANTS.MIN_TOUCH_TARGET,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
});