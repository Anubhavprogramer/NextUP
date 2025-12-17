import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedButton } from '../Themed/ThemedButton';
import { useToast } from '../../Store/ToastContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export const ToastDemo: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const styles = StyleSheet.create({
    container: {
      padding: DESIGN_CONSTANTS.SPACING.medium,
      gap: DESIGN_CONSTANTS.SPACING.small,
    },
  });

  return (
    <View style={styles.container}>
      <ThemedButton
        title="Show Success Toast"
        onPress={() => showSuccess('This is a success message!')}
      />
      <ThemedButton
        title="Show Error Toast"
        onPress={() => showError('This is an error message!')}
      />
      <ThemedButton
        title="Show Info Toast"
        onPress={() => showInfo('This is an info message!')}
      />
      <ThemedButton
        title="Show Warning Toast"
        onPress={() => showWarning('This is a warning message!')}
      />
    </View>
  );
};