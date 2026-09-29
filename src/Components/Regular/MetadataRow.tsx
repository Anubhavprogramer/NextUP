import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedText } from '../Themed/ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

interface MetadataRowProps {
  iconName: string;
  text: string;
  iconSize?: number;
}

export const MetadataRow: React.FC<MetadataRowProps> = ({
  iconName,
  text,
  iconSize = 16,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
    //   marginBottom: DESIGN_CONSTANTS.SPACING.small,
      backgroundColor: theme.colors.primaryDark,
      padding: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.xlarge,
    },
    metadataText: {
      marginLeft: DESIGN_CONSTANTS.SPACING.small,
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.metadataRow}>
      <Icon name={iconName} size={iconSize} color={theme.colors.white} />
      <ThemedText variant="body" style={styles.metadataText}>
        {text}
      </ThemedText>
    </View>
  );
};
