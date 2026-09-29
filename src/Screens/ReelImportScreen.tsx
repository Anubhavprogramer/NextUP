import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { ThemedButton } from '../Components/Themed/ThemedButton';
import { CustomHeader } from '../Components/Regular/CustomHeader';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { useToast } from '../Store/ToastContext';
import { resolveReel, ReelCandidate, ReelError, ResolvedReel } from '../API/reels';
import { findInstagramReelUrl } from '../Utils/reelLinks';
import { REEL_ERROR_COPY } from '../Utils/reelErrors';
import { getTMDBImageUrl, getCollectionStatusDisplayName } from '../Utils/helpers';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { CollectionStatus, RootStackParamList, StorageError } from '../Types';

type ReelImportRouteProp = RouteProp<RootStackParamList, 'ReelImport'>;
type ReelImportNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReelImport'>;

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'ready'; reel: ResolvedReel }
  | { kind: 'error'; error: ReelError };

const STATUS_OPTIONS: { status: CollectionStatus; label: string; icon: string }[] = [
  { status: 'will_watch', label: 'Want to Watch', icon: 'bookmark' },
  { status: 'watching', label: 'Watching', icon: 'play-circle' },
  { status: 'watched', label: 'Watched', icon: 'checkmark-circle' },
];


export const ReelImportScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ReelImportNavigationProp>();
  const { sharedText } = useRoute<ReelImportRouteProp>().params;
  const { addToCollection, findItemByMediaId } = useApp();
  const { showSuccess, showInfo, showError } = useToast();

  const [state, setState] = useState<ScreenState>({ kind: 'loading' });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<CollectionStatus>('will_watch');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!findInstagramReelUrl(sharedText)) {
      setState({ kind: 'error', error: new ReelError('UNSUPPORTED_URL', 'No reel link found') });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const reel = await resolveReel(sharedText);
      setState({ kind: 'ready', reel });
    } catch (error) {
      setState({
        kind: 'error',
        error: error instanceof ReelError ? error : new ReelError('UNKNOWN', String(error)),
      });
    }
  }, [sharedText]);

  useEffect(() => {
    load();
  }, [load]);

  // Preselect the best candidate that isn't already saved.
  useEffect(() => {
    if (state.kind !== 'ready') return;
    const firstNew = state.reel.candidates.find(c => !findItemByMediaId(c.media.id));
    setSelectedId(firstNew ? firstNew.media.id : null);
    // Only when a new result arrives, not on every collection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const searchManually = (keyword?: string) => {
    navigation.replace('Search', keyword ? { initialQuery: keyword } : undefined);
  };

  const handleAdd = async () => {
    if (state.kind !== 'ready' || selectedId === null) return;
    const candidate = state.reel.candidates.find(c => c.media.id === selectedId);
    if (!candidate) return;

    setAdding(true);
    try {
      await addToCollection(candidate.media, targetStatus);
      showSuccess(`Added to ${getCollectionStatusDisplayName(targetStatus)}`);
      navigation.replace('MediaDetail', { mediaItem: candidate.media });
    } catch (error) {
      if (error instanceof StorageError && error.code === 'DUPLICATE_ITEM') {
        showInfo('Already in your collection');
      } else {
        showError('Failed to add to collection');
      }
    } finally {
      setAdding(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: DESIGN_CONSTANTS.SPACING.medium, paddingBottom: DESIGN_CONSTANTS.SPACING.xxlarge },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: DESIGN_CONSTANTS.SPACING.large,
      gap: DESIGN_CONSTANTS.SPACING.medium,
    },
    centeredText: { textAlign: 'center' },
    muted: { color: theme.colors.textSecondary },
    reelCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      padding: DESIGN_CONSTANTS.SPACING.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
      gap: DESIGN_CONSTANTS.SPACING.xsmall,
    },
    sectionTitle: {
      color: theme.colors.primaryDark,
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    candidate: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: DESIGN_CONSTANTS.SPACING.medium,
      padding: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      borderWidth: 2,
      borderColor: 'transparent',
      marginBottom: DESIGN_CONSTANTS.SPACING.small,
    },
    candidateSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface },
    candidateDisabled: { opacity: 0.5 },
    poster: {
      width: 56,
      aspectRatio: DESIGN_CONSTANTS.POSTER_ASPECT_RATIO,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    candidateText: { flex: 1, gap: 2 },
    statusRow: {
      flexDirection: 'row',
      gap: DESIGN_CONSTANTS.SPACING.small,
      marginTop: DESIGN_CONSTANTS.SPACING.medium,
      marginBottom: DESIGN_CONSTANTS.SPACING.large,
    },
    statusChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      borderWidth: 2,
      borderColor: theme.colors.primaryDark,
      gap: 2,
    },
    statusChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    secondaryAction: { marginTop: DESIGN_CONSTANTS.SPACING.medium },
  });

  const renderCandidate = (candidate: ReelCandidate) => {
    const { media } = candidate;
    const existing = findItemByMediaId(media.id);
    const selected = selectedId === media.id;
    const posterUrl = getTMDBImageUrl(media.posterPath, 'w185');
    const year = media.releaseDate ? media.releaseDate.slice(0, 4) : '—';

    return (
      <TouchableOpacity
        key={`${media.mediaType}-${media.id}`}
        style={[styles.candidate, selected && styles.candidateSelected, existing && styles.candidateDisabled]}
        onPress={() => (existing ? navigation.navigate('MediaDetail', { mediaItem: media }) : setSelectedId(media.id))}
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled: !!existing }}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} />
        ) : (
          <View style={styles.poster}>
            <Icon name="film-outline" size={22} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.candidateText}>
          <ThemedText variant="subtitle" numberOfLines={2}>
            {media.title}
          </ThemedText>
          <ThemedText variant="caption" style={styles.muted}>
            {year} · {media.mediaType === 'tv' ? 'TV Show' : 'Movie'}
          </ThemedText>
          {existing && (
            <ThemedText variant="caption" style={{ color: theme.colors.primary }}>
              Already in {getCollectionStatusDisplayName(existing.status)}
            </ThemedText>
          )}
        </View>
        {!existing && (
          <Icon
            name={selected ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selected ? theme.colors.primary : theme.colors.textTertiary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderBody = () => {
    if (state.kind === 'loading') {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="subtitle" style={styles.centeredText}>
            Finding the movie in this reel…
          </ThemedText>
          <ThemedText variant="caption" style={[styles.centeredText, styles.muted]}>
            This can take up to 30 seconds
          </ThemedText>
        </View>
      );
    }

    if (state.kind === 'error') {
      const { error } = state;
      const copy = REEL_ERROR_COPY[error.code] || REEL_ERROR_COPY.UNKNOWN;
      return (
        <View style={styles.centered}>
          <Icon name="sad-outline" size={56} color={theme.colors.textSecondary} />
          <ThemedText variant="subtitle" style={styles.centeredText}>
            {copy.title}
          </ThemedText>
          {copy.retry && <ThemedButton title="Try Again" onPress={load} fullWidth />}
          <ThemedButton
            title="Search manually"
            variant="outline"
            onPress={() => searchManually(error.keywords[0])}
            fullWidth
          />
        </View>
      );
    }

    const { reel } = state;
    const selectedLabel = STATUS_OPTIONS.find(o => o.status === targetStatus)?.label;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.reelCard}>
          {!!reel.author && (
            <ThemedText variant="caption" style={styles.muted}>
              @{reel.author}
            </ThemedText>
          )}
          <ThemedText variant="body" numberOfLines={4}>
            {reel.caption}
          </ThemedText>
        </View>

        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Is it one of these?
        </ThemedText>
        {reel.candidates.map(renderCandidate)}

        <ThemedText variant="subtitle" style={[styles.sectionTitle, { marginTop: DESIGN_CONSTANTS.SPACING.medium }]}>
          Add to
        </ThemedText>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(option => {
            const active = option.status === targetStatus;
            const color = active ? theme.colors.background : theme.colors.primaryDark;
            return (
              <TouchableOpacity
                key={option.status}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => setTargetStatus(option.status)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Icon name={option.icon} size={18} color={color} />
                <ThemedText variant="caption" style={{ color }}>
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedButton
          title={selectedId === null ? 'Pick a title' : `Add to ${selectedLabel}`}
          onPress={handleAdd}
          disabled={selectedId === null || adding}
          loading={adding}
          fullWidth
        />
        <ThemedButton
          title="None of these — search manually"
          variant="outline"
          onPress={() => searchManually(reel.candidates[0]?.query)}
          style={styles.secondaryAction}
          fullWidth
        />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <CustomHeader title="Import from reel" showBack />
        {renderBody()}
      </ThemedView>
    </SafeAreaView>
  );
};
