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
    
    // if (fullWidth) {
    //   baseStyle.push(styles.fullWidth);
    // }

    const variantStyle: any = {};
    switch (variant) {
      case 'primary':
        variantStyle.backgroundColor = disabled ? theme.colors.textTertiary : theme.colors.primaryLight;
        break;
      case 'secondary':
        variantStyle.backgroundColor = disabled ? theme.colors.textTertiary : theme.colors.secondary;
        break;
      case 'outline':
        variantStyle.backgroundColor = 'transparent';
        variantStyle.borderWidth = 1;
        variantStyle.borderColor = disabled ? theme.colors.textTertiary : theme.colors.primary;
        break;
    }

    baseStyle.push(variantStyle);
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
    borderRadius: 999,
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