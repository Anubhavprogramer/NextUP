import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemeColor } from '../../Store/ThemeContext';

export interface ThemedViewProps extends ViewProps {
  lightColor?: string;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  lightColor,
  ...otherProps
}) => {
  const backgroundColor = useThemeColor({ light: lightColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
};