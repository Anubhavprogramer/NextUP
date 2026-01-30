import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export interface StatisticsCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * StatisticsCard - Display a single statistic metric
 * Used for Watch History & Statistics feature
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  subValue,
  size = 'medium',
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      padding: DESIGN_CONSTANTS.SPACING.medium,
      flex: 1,
      marginHorizontal: DESIGN_CONSTANTS.SPACING.xsmall,
    //   borderWidth: 1,
    //   borderColor: theme.colors.primaryDark,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: `${iconColor}20`, // 20% opacity
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    label: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
      color: theme.colors.textSecondary,
      marginBottom: DESIGN_CONSTANTS.SPACING.xsmall,
      textAlign: 'center',
    },
    value: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.largeTitle,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.bold,
      color: theme.colors.text,
      marginBottom: DESIGN_CONSTANTS.SPACING.xsmall,
      textAlign: 'center',
    },
    subValue: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={28} color={iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  );
};
