import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeProvider, useTheme } from '../Store/ThemeContext';
import { ThemedText } from '../Components/Themed/ThemedText';
import { dataManager } from '../Manager/DataManager';
import { resolveReel, ReelCandidate, ReelError } from '../API/reels';
import { findInstagramReelUrl, IMPORT_LINK_PREFIX } from '../Utils/reelLinks';
import { REEL_ERROR_COPY } from '../Utils/reelErrors';
import { getCollectionStatusDisplayName, getTMDBImageUrl } from '../Utils/helpers';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { CollectionStatus, StorageError } from '../Types';
import { logger } from '../Utils/debugger';

const STATUS_OPTIONS: { status: CollectionStatus; label: string; icon: string }[] = [
  { status: 'will_watch', label: 'Want to Watch', icon: 'bookmark' },
  { status: 'watching', label: 'Watching', icon: 'play-circle' },
  { status: 'watched', label: 'Watched', icon: 'checkmark-circle' },
];

/** How long the "Added ✓" confirmation stays before the sheet closes. */
export const CLOSE_AFTER_SAVE_MS = 1100;
const ANIMATION_MS = 220;
const OFFSCREEN = 700;

type Phase =
  | { kind: 'loading' }
  | { kind: 'needsSetup' }
  | { kind: 'error'; error: ReelError }
  | { kind: 'ready'; candidates: ReelCandidate[]; saved: Record<number, CollectionStatus> }
  | { kind: 'saved'; title: string; status: CollectionStatus };

/**
 * Root component for Android's ShareActivity ("Share → NextUP"). Shows the movies
 * found in the shared reel as a bottom sheet over the calling app; tapping one
 * saves it and closes the sheet, so the user never leaves Instagram.
 */
export const ShareSheetApp: React.FC<{ sharedText?: string }> = ({ sharedText = '' }) => (
  <SafeAreaProvider>
    <ThemeProvider>
      <ShareSheet sharedText={sharedText} />
    </ThemeProvider>
  </SafeAreaProvider>
);

const ShareSheet: React.FC<{ sharedText: string }> = ({ sharedText }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [status, setStatus] = useState<CollectionStatus>('will_watch');
  const [savingId, setSavingId] = useState<number | null>(null);

  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(translateY, { toValue: OFFSCREEN, duration: ANIMATION_MS, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start(() => BackHandler.exitApp()); // finishes ShareActivity, back to the caller
  }, [translateY, backdrop]);

  // Hand the share to the full app (onboarding, or the Import screen's manual search).
  const openInApp = useCallback(() => {
    Linking.openURL(`${IMPORT_LINK_PREFIX}?url=${encodeURIComponent(sharedText)}`).catch(error =>
      logger.error('ShareSheet', 'Failed to open app', error),
    );
    close();
  }, [sharedText, close]);

  const load = useCallback(async () => {
    setPhase({ kind: 'loading' });
    try {
      if (!(await dataManager.getUserProfile())) {
        setPhase({ kind: 'needsSetup' });
        return;
      }
      if (!findInstagramReelUrl(sharedText)) {
        setPhase({ kind: 'error', error: new ReelError('UNSUPPORTED_URL', 'No reel link found') });
        return;
      }
      const reel = await resolveReel(sharedText);
      const saved: Record<number, CollectionStatus> = {};
      for (const candidate of reel.candidates) {
        const existing = await dataManager.findItemByMediaId(candidate.media.id);
        if (existing) saved[candidate.media.id] = existing.status;
      }
      setPhase({ kind: 'ready', candidates: reel.candidates, saved });
    } catch (error) {
      setPhase({ kind: 'error', error: error instanceof ReelError ? error : new ReelError('UNKNOWN', String(error)) });
    }
  }, [sharedText]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: ANIMATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 1, duration: ANIMATION_MS, useNativeDriver: true }),
    ]).start();
    load();
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [load, close, translateY, backdrop]);

  const add = async (candidate: ReelCandidate) => {
    if (savingId !== null) return;
    setSavingId(candidate.media.id);
    try {
      await dataManager.addItem(candidate.media, status);
      setPhase({ kind: 'saved', title: candidate.media.title, status });
      setTimeout(close, CLOSE_AFTER_SAVE_MS);
    } catch (error) {
      if (error instanceof StorageError && error.code === 'DUPLICATE_ITEM') {
        const existing = await dataManager.findItemByMediaId(candidate.media.id);
        setPhase(prev =>
          prev.kind === 'ready' && existing
            ? { ...prev, saved: { ...prev.saved, [candidate.media.id]: existing.status } }
            : prev,
        );
      } else {
        logger.error('ShareSheet', 'Failed to save', error);
        setPhase({ kind: 'error', error: new ReelError('UNKNOWN', 'Could not save') });
      }
    } finally {
      setSavingId(null);
    }
  };

  const styles = StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingTop: DESIGN_CONSTANTS.SPACING.small,
      paddingBottom: Math.max(insets.bottom, DESIGN_CONSTANTS.SPACING.medium) + DESIGN_CONSTANTS.SPACING.small,
      maxHeight: '82%',
    },
    handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: theme.colors.border, marginBottom: 12 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    title: { flex: 1, color: theme.colors.primaryDark },
    muted: { color: theme.colors.textSecondary },
    center: { alignItems: 'center', paddingVertical: 28, gap: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    poster: { width: 46, height: 69, borderRadius: 8, backgroundColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1, gap: 2 },
    chips: { flexDirection: 'row', gap: 8, marginTop: 12 },
    chip: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primaryDark,
    },
    chipOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    button: {
      alignSelf: 'stretch',
      height: 48,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryDark,
    },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary },
  });

  const button = (label: string, onPress: () => void, outline = false) => (
    <TouchableOpacity key={label} style={[styles.button, outline && styles.buttonOutline]} onPress={onPress} accessibilityRole="button">
      <ThemedText variant="body" style={{ color: outline ? theme.colors.primary : theme.colors.white, fontWeight: '600' }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderBody = () => {
    switch (phase.kind) {
      case 'loading':
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="subtitle">Finding the movie in this reel…</ThemedText>
          </View>
        );
      case 'needsSetup':
        return (
          <View style={styles.center}>
            <Icon name="person-circle-outline" size={48} color={theme.colors.primary} />
            <ThemedText variant="subtitle">Set up NextUP first</ThemedText>
            <ThemedText variant="body" style={[styles.muted, { textAlign: 'center' }]}>
              It takes 5 seconds. Your reel will be waiting.
            </ThemedText>
            {button('Open NextUP', openInApp)}
          </View>
        );
      case 'error': {
        const copy = REEL_ERROR_COPY[phase.error.code] || REEL_ERROR_COPY.UNKNOWN;
        return (
          <View style={styles.center}>
            <Icon name="sad-outline" size={44} color={theme.colors.textSecondary} />
            <ThemedText variant="subtitle" style={{ textAlign: 'center' }}>
              {copy.title}
            </ThemedText>
            {copy.retry && button('Try again', load)}
            {button('Search in NextUP', openInApp, true)}
          </View>
        );
      }
      case 'saved':
        return (
          <View style={styles.center}>
            <Icon name="checkmark-circle" size={52} color={theme.colors.success} />
            <ThemedText variant="subtitle" style={{ textAlign: 'center' }}>
              Added to {getCollectionStatusDisplayName(phase.status)}
            </ThemedText>
            <ThemedText variant="body" style={styles.muted}>
              {phase.title}
            </ThemedText>
          </View>
        );
      case 'ready':
        return (
          <>
            <ThemedText variant="caption" style={[styles.muted, { marginBottom: 6 }]}>
              Tap the one you want to save
            </ThemedText>
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 4 }}>
              {phase.candidates.map(candidate => {
                const { media } = candidate;
                const savedAs = phase.saved[media.id];
                const posterUrl = getTMDBImageUrl(media.posterPath, 'w185');
                return (
                  <TouchableOpacity
                    key={`${media.mediaType}-${media.id}`}
                    style={[styles.row, savedAs && { opacity: 0.5 }]}
                    disabled={!!savedAs || savingId !== null}
                    onPress={() => add(candidate)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${media.title}`}
                  >
                    {posterUrl ? (
                      <Image source={{ uri: posterUrl }} style={styles.poster} />
                    ) : (
                      <View style={styles.poster}>
                        <Icon name="film-outline" size={20} color={theme.colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.rowText}>
                      <ThemedText variant="subtitle" numberOfLines={2}>
                        {media.title}
                      </ThemedText>
                      <ThemedText variant="caption" style={styles.muted}>
                        {media.releaseDate ? media.releaseDate.slice(0, 4) : '—'} · {media.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                      </ThemedText>
                      {savedAs && (
                        <ThemedText variant="caption" style={{ color: theme.colors.primary }}>
                          Already in {getCollectionStatusDisplayName(savedAs)}
                        </ThemedText>
                      )}
                    </View>
                    {savingId === media.id ? (
                      <ActivityIndicator color={theme.colors.primary} />
                    ) : (
                      !savedAs && <Icon name="add-circle" size={30} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.chips}>
              {STATUS_OPTIONS.map(option => {
                const on = option.status === status;
                const color = on ? theme.colors.background : theme.colors.primaryDark;
                return (
                  <TouchableOpacity
                    key={option.status}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setStatus(option.status)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                  >
                    <Icon name={option.icon} size={18} color={color} />
                    <ThemedText variant="caption" style={{ color }}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} accessibilityViewIsModal>
        <View style={styles.handle} />
        <View style={styles.header}>
          <ThemedText variant="subtitle" style={styles.title}>
            Add from reel
          </ThemedText>
          <TouchableOpacity onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Icon name="close" size={24} color={theme.colors.primaryDark} />
          </TouchableOpacity>
        </View>
        {renderBody()}
      </Animated.View>
    </View>
  );
};
