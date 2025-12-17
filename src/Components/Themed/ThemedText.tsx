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
    fontSize: DESIGN_CONSTANTS.FONT_SIZES.XXL,
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.BOLD,
    lineHeight: DESIGN_CONSTANTS.FONT_SIZES.XXL * 1.2,
  },
  subtitle: {
    fontSize: DESIGN_CONSTANTS.FONT_SIZES.LG,
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.SEMIBOLD,
    lineHeight: DESIGN_CONSTANTS.FONT_SIZES.LG * 1.3,
  },
  body: {
    fontSize: DESIGN_CONSTANTS.FONT_SIZES.MD,
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.REGULAR,
    lineHeight: DESIGN_CONSTANTS.FONT_SIZES.MD * 1.4,
  },
  caption: {
    fontSize: DESIGN_CONSTANTS.FONT_SIZES.SM,
    fontWeight: DESIGN_CONSTANTS.FONT_WEIGHTS.REGULAR,
    lineHeight: DESIGN_CONSTANTS.FONT_SIZES.SM * 1.3,
  },
});