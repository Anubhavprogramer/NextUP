import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedText } from '../Themed/ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export interface CustomHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    iconName: string;
    accessibilityLabel?: string;
    onPress: () => void;
  };
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBack = false,
  rightAction,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      padding: DESIGN_CONSTANTS.SPACING.small,
      marginRight: DESIGN_CONSTANTS.SPACING.small,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
        color: '#000000',
        justifyContent: 'center',
        textAlign: 'center',
    },
    rightButton: {
      padding: DESIGN_CONSTANTS.SPACING.small,
    },
  });

  return (
    <View style={styles.container}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <ThemedText variant="subtitle" style={styles.title}>
            {title}
          </ThemedText>
        </View>

      {rightAction && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={rightAction.onPress}
          accessible
          accessibilityLabel={rightAction.accessibilityLabel}
        >
          <Icon name={rightAction.iconName} size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};
