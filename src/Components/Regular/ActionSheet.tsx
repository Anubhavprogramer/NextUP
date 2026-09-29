import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedText } from '../Themed/ThemedText';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
import { getTMDBImageUrl } from '../../Utils/helpers';
import { MediaItem } from '../../Types';

export interface ActionSheetAction {
  label: string;
  icon?: string;
  /** Tint for the icon; defaults to the theme primary (or error for destructive). */
  iconColor?: string;
  destructive?: boolean;
  onPress: () => void;
}

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  /** Shows the poster, title and year as the sheet header. */
  media?: MediaItem;
  actions: ActionSheetAction[];
  cancelLabel?: string;
}

interface ActionSheetProps extends ActionSheetOptions {
  visible: boolean;
  /** Called after the close animation, with the chosen action (if any). */
  onClosed: (action?: ActionSheetAction) => void;
}

const ANIMATION_MS = 220;
const OFFSCREEN = 600;

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  title,
  message,
  media,
  actions,
  cancelLabel = 'Cancel',
  onClosed,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  useEffect(() => {
    if (!visible) return;
    closing.current = false;
    translateY.setValue(OFFSCREEN);
    backdrop.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, { toValue: 1, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start();
  }, [visible, translateY, backdrop]);

  // Animate out first, then report the choice, so the action (often a
  // navigation or a toast) runs after the modal is gone.
  const close = (action?: ActionSheetAction) => {
    if (closing.current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: OFFSCREEN,
        duration: ANIMATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, { toValue: 0, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start(() => onClosed(action));
  };

  const posterUrl = media ? getTMDBImageUrl(media.posterPath, 'w185') : null;
  const year = media?.releaseDate ? media.releaseDate.slice(0, 4) : '';

  const styles = StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.overlay },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: DESIGN_CONSTANTS.BORDER_RADIUS.xlarge + 8,
      borderTopRightRadius: DESIGN_CONSTANTS.BORDER_RADIUS.xlarge + 8,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingTop: DESIGN_CONSTANTS.SPACING.small,
      paddingBottom: Math.max(insets.bottom, DESIGN_CONSTANTS.SPACING.medium),
      ...theme.shadows.large,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: DESIGN_CONSTANTS.SPACING.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.medium,
    },
    poster: {
      width: 48,
      aspectRatio: DESIGN_CONSTANTS.POSTER_ASPECT_RATIO,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1, gap: 2 },
    title: { color: theme.colors.primaryDark },
    muted: { color: theme.colors.textSecondary },
    actions: {
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: DESIGN_CONSTANTS.SPACING.medium,
      minHeight: DESIGN_CONSTANTS.BUTTON_HEIGHT + 4,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
    },
    divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
    cancel: {
      minHeight: DESIGN_CONSTANTS.BUTTON_HEIGHT,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.xlarge,
      backgroundColor: theme.colors.primaryDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const hasHeader = !!(media || title || message);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={() => close()}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} accessibilityViewIsModal>
          <View style={styles.handle} />

          {hasHeader && (
            <View style={styles.header}>
              {media && (
                posterUrl ? (
                  <Image source={{ uri: posterUrl }} style={styles.poster} />
                ) : (
                  <View style={styles.poster}>
                    <Icon name="film-outline" size={20} color={theme.colors.textSecondary} />
                  </View>
                )
              )}
              <View style={styles.headerText}>
                <ThemedText variant="subtitle" style={styles.title} numberOfLines={2}>
                  {title ?? media?.title}
                </ThemedText>
                {media && !title && (
                  <ThemedText variant="caption" style={styles.muted}>
                    {[year, media.mediaType === 'tv' ? 'TV Show' : 'Movie'].filter(Boolean).join(' · ')}
                  </ThemedText>
                )}
                {!!message && (
                  <ThemedText variant="caption" style={styles.muted}>
                    {message}
                  </ThemedText>
                )}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            {actions.map((action, index) => {
              const color = action.destructive ? theme.colors.error : theme.colors.text;
              return (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.action, index > 0 && styles.divider]}
                  onPress={() => close(action)}
                  accessibilityRole="button"
                >
                  {!!action.icon && (
                    <Icon
                      name={action.icon}
                      size={22}
                      color={action.destructive ? theme.colors.error : action.iconColor ?? theme.colors.primary}
                    />
                  )}
                  <ThemedText variant="body" style={{ color, fontWeight: '600' }}>
                    {action.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.cancel} onPress={() => close()} accessibilityRole="button">
            <ThemedText variant="body" style={{ color: theme.colors.white, fontWeight: '600' }}>
              {cancelLabel}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
