import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  onHide,
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
      default:
        return theme.colors.primary;
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 100,
      left: DESIGN_CONSTANTS.SPACING.medium,
      right: DESIGN_CONSTANTS.SPACING.medium,
      zIndex: 9999,
    },
    toast: {
      backgroundColor: theme.colors.surface,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderLeftWidth: 4,
      borderLeftColor: getToastColor(),
      maxWidth: screenWidth - (DESIGN_CONSTANTS.SPACING.medium * 2),
    },
    iconContainer: {
      marginRight: DESIGN_CONSTANTS.SPACING.small,
    },
    messageContainer: {
      flex: 1,
    },
    message: {
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.text,
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.medium,
    },
  });

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={getToastIcon()}
            size={20}
            color={getToastColor()}
          />
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};