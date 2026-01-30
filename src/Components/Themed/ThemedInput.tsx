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


  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.background,
      color: theme.colors.text
    },
    style,
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {label && (
        <ThemedText variant="body" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[inputStyle,{backgroundColor: theme.colors.background}]}
        placeholderTextColor={theme.colors.text}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...otherProps}
      />
      <View style={{ height: 3, backgroundColor: theme.colors.primary, borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.small }} />
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
    marginBottom: DESIGN_CONSTANTS.SPACING.medium,
  },
  label: {
    marginBottom: DESIGN_CONSTANTS.SPACING.xsmall,
    fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
  },
  input: {
    height: DESIGN_CONSTANTS.INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
    paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
  },
  helperText: {
    marginTop: DESIGN_CONSTANTS.SPACING.xsmall,
    marginLeft: DESIGN_CONSTANTS.SPACING.xsmall,
  },
});