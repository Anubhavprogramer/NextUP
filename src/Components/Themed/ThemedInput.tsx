import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
  label,
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  ...otherProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: getBorderColor(),
      color: theme.colors.text,
    },
    style,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText variant="body" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <TextInput
        style={inputStyle}
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...otherProps}
      />
      {error && (
        <ThemedText
          variant="caption"
          style={[styles.helperText, { color: theme.colors.error }]}
        >
          {error}
        </ThemedText>
      )}
      {helperText && !error && (
        <ThemedText
          variant="caption"
          style={[styles.helperText, { color: theme.colors.textSecondary }]}
        >
          {helperText}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DESIGN_CONSTANTS.SPACING.MD,
  },
  label: {
    marginBottom: DESIGN_CONSTANTS.SPACING.XS,
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.MEDIUM,
  },
  input: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.MD,
    paddingHorizontal: DESIGN_CONSTANTS.SPACING.MD,
    fontSize: DESIGN_CONSTANTS.FONT_SIZES.MD,
  },
  helperText: {
    marginTop: DESIGN_CONSTANTS.SPACING.XS,
    marginLeft: DESIGN_CONSTANTS.SPACING.XS,
  },
});