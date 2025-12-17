import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export interface ThemedCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  elevated = true,
  style,
  ...otherProps
}) => {
  const { theme } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    elevated && theme.shadows.medium,
    style,
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      activeOpacity={otherProps.onPress ? 0.8 : 1}
      {...otherProps}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
    padding: DESIGN_CONSTANTS.CARD_PADDING,
    borderWidth: StyleSheet.hairlineWidth,
  },
});