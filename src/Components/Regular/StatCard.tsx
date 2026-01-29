import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedCard } from '../Themed/ThemedCard';
import { ThemedText } from '../Themed/ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
export interface StatCardProps {
  iconName: string;
  iconColor: string;
  number: number;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  iconName,
  iconColor,
  number,
  label,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundTertiary,
    },
    topSection: {
      flex: 1,
      padding: DESIGN_CONSTANTS.SPACING.small,
      justifyContent: 'space-between',
    },
    label: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.semibold,
      color: theme.colors.primaryDark,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    numberContainer: {
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    //   paddingRight: DESIGN_CONSTANTS.SPACING.medium,
    },
    number: {
      fontSize: 50,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.bold,
      color: theme.colors.textSecondary,
      lineHeight: 50,
    },
    bottomSection: {
      backgroundColor: theme.colors.primaryDark,
      padding: DESIGN_CONSTANTS.SPACING.medium,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 2,
      height: 60,
      alignItems: 'center',
      overflow: 'hidden',
    },
    barcode: {
      flexDirection: 'row',
      gap: 1,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.small,
    },
    barLine: {
      width: 2,
      height: 14,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    barLineThin: {
      width: 1,
      height: 14,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    circleRight: {
      position: 'absolute',
      right: -20,
      top: '70%',
      width: 30,
      height: 30,
      borderRadius: 30,
      backgroundColor: theme.colors.background,
      transform: [{ translateY: -30 }],
      zIndex: 1,
    },
    circleLeft: {
      position: 'absolute',
      left: -20,
      top: '70%',
      width: 30,
      height: 30,
      borderRadius: 30,
      backgroundColor: theme.colors.background,
      transform: [{ translateY: -30 }],
      zIndex: 1,
    }
  });

  // Generate barcode-like pattern
  const generateBarcode = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const isThin = Math.random() > 0.6;
      bars.push(
        <View
          key={i}
          style={isThin ? styles.barLineThin : styles.barLine}
        />
      );
    }
    return bars;
  };

  return (
    <View style={styles.container}>
        <View style={styles.circleRight}></View>
        <View style={styles.circleLeft}></View>
      {/* Top Section - Label and Number */}
      <View style={styles.topSection}>
        <ThemedText style={styles.label}>
          {label}
        </ThemedText>
        <View style={styles.numberContainer}>
          <ThemedText style={styles.number}>
            {number}
          </ThemedText>
        </View>
      </View>

      {/* Bottom Section - Barcode */}
      <View style={styles.bottomSection}>
        {generateBarcode()}
      </View>
    </View>
  );
};
