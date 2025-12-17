import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

export interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  lightColor,
  darkColor,
  variant = 'body',
  ...otherProps
}) => {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  const variantStyle = styles[variant];

  return (
    <Text
      style={[
        { color },
        variantStyle,
        style,
      ]}
      {...otherProps}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.largeTitle,
    fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.bold,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.largeTitle * 1.2,
  },
  subtitle: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.title,
    fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.title * 1.3,
  },
  body: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
    fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.regular,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body * 1.4,
  },
  caption: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
    fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.regular,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption * 1.3,
  },
});