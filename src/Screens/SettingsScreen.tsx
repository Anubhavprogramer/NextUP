import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemedView } from '../Components/Themed/ThemedView';
import { ThemedText } from '../Components/Themed/ThemedText';
import { ThemedInput } from '../Components/Themed/ThemedInput';
import { ThemedButton } from '../Components/Themed/ThemedButton';
import { CustomHeader } from '../Components/Regular/CustomHeader';
import { useTheme } from '../Store/ThemeContext';
import { useApp } from '../Store/AppContext';
import { useToast } from '../Store/ToastContext';
import { dataManager } from '../Manager/DataManager';
import { createExport, importBackup, backupFileName } from '../Manager/BackupManager';
import { pickBackupFile, saveBackupFile, BackupFileCancelled } from '../Utils/backupFiles';
import { APP_CONFIG, DESIGN_CONSTANTS } from '../Utils/constants';
import { VALIDATION_CONSTANTS } from '../Types';
import { logger } from '../Utils/debugger';

type Busy = 'name' | 'export' | 'import' | null;

export const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { userProfile, appState } = useApp();
  const { showSuccess, showError, showInfo } = useToast();

  const [name, setName] = useState(userProfile?.name ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [busy, setBusy] = useState<Busy>(null);

  useEffect(() => {
    setName(userProfile?.name ?? '');
  }, [userProfile?.name]);

  const totalItems = appState
    ? appState.collections.watched.length +
      appState.collections.watching.length +
      appState.collections.will_watch.length
    : 0;

  const trimmedName = name.trim();
  const nameChanged = trimmedName !== (userProfile?.name ?? '');

  const saveName = async () => {
    if (!trimmedName) {
      setNameError('Please enter your name');
      return;
    }
    if (trimmedName.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      setNameError(`Name cannot exceed ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`);
      return;
    }
    setBusy('name');
    try {
      await dataManager.updateUserProfile({ name: trimmedName });
      showSuccess('Name updated');
    } catch (error) {
      logger.error('Settings', 'Failed to update name', error);
      showError('Could not update your name');
    } finally {
      setBusy(null);
    }
  };

  const exportData = async () => {
    setBusy('export');
    try {
      const backup = await createExport();
      await saveBackupFile(JSON.stringify(backup, null, 2), backupFileName());
      showSuccess(`Backup saved (${backup.metadata.totalItems} titles)`);
    } catch (error) {
      if (!(error instanceof BackupFileCancelled)) {
        logger.error('Settings', 'Export failed', error);
        showError('Could not save the backup');
      }
    } finally {
      setBusy(null);
    }
  };

  const importData = async () => {
    setBusy('import');
    try {
      const json = await pickBackupFile();
      const result = await importBackup(json);
      if (!result.success) {
        showError(result.errors[0] ?? 'Could not import this file');
      } else if (result.importedItems === 0) {
        showInfo('Everything in this backup is already in your lists');
      } else {
        const skipped = result.skippedItems > 0 ? `, ${result.skippedItems} skipped` : '';
        showSuccess(`Imported ${result.importedItems} titles${skipped}`);
      }
    } catch (error) {
      if (!(error instanceof BackupFileCancelled)) {
        logger.error('Settings', 'Import failed', error);
        showError('Could not read that file');
      }
    } finally {
      setBusy(null);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      padding: DESIGN_CONSTANTS.SPACING.medium,
      paddingBottom: DESIGN_CONSTANTS.SPACING.xxlarge,
      gap: DESIGN_CONSTANTS.SPACING.large,
    },
    sectionTitle: { color: theme.colors.primaryDark, marginBottom: DESIGN_CONSTANTS.SPACING.small },
    muted: { color: theme.colors.textSecondary },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: DESIGN_CONSTANTS.SPACING.medium,
      minHeight: DESIGN_CONSTANTS.BUTTON_HEIGHT + 8,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
    },
    divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
    rowText: { flex: 1, gap: 2 },
    rowLabel: { fontWeight: '600' },
    attribution: {
      padding: DESIGN_CONSTANTS.SPACING.medium,
      gap: DESIGN_CONSTANTS.SPACING.small,
    },
    // Official TMDB logo (assets/tmdb-logo.png, rendered from TMDB's blue_short SVG)
    tmdbLogo: { width: 160, height: 160 * (62 / 480) },
  });

  const renderRow = ({
    icon,
    label,
    detail,
    onPress,
    loading,
    first,
    trailing = 'chevron',
  }: {
    icon: string;
    label: string;
    detail?: string;
    onPress?: () => void;
    loading?: boolean;
    first?: boolean;
    trailing?: 'chevron' | 'external' | 'none';
  }) => (
    <TouchableOpacity
      key={label}
      style={[styles.row, !first && styles.divider]}
      onPress={onPress}
      disabled={!onPress || busy !== null}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <Icon name={icon} size={22} color={theme.colors.primary} />
      <View style={styles.rowText}>
        <ThemedText variant="body" style={styles.rowLabel}>
          {label}
        </ThemedText>
        {!!detail && (
          <ThemedText variant="caption" style={styles.muted}>
            {detail}
          </ThemedText>
        )}
      </View>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        trailing !== 'none' && (
          <Icon
            name={trailing === 'external' ? 'open-outline' : 'chevron-forward'}
            size={18}
            color={theme.colors.textTertiary}
          />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <CustomHeader title="Settings" showBack />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Profile */}
            <View>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Your name
              </ThemedText>
              <ThemedInput
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (nameError) setNameError(undefined);
                }}
                placeholder="Enter your name"
                autoCapitalize="words"
                maxLength={VALIDATION_CONSTANTS.MAX_NAME_LENGTH}
                error={nameError}
                returnKeyType="done"
                onSubmitEditing={nameChanged ? saveName : undefined}
              />
              <ThemedButton
                title="Save name"
                onPress={saveName}
                disabled={!nameChanged || busy !== null}
                loading={busy === 'name'}
                fullWidth
              />
            </View>

            {/* Data */}
            <View>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Your data
              </ThemedText>
              <View style={styles.card}>
                {renderRow({
                  first: true,
                  icon: 'download-outline',
                  label: 'Export backup',
                  detail: `Save all ${totalItems} titles to a file`,
                  onPress: exportData,
                  loading: busy === 'export',
                })}
                {renderRow({
                  icon: 'cloud-upload-outline',
                  label: 'Import backup',
                  detail: 'Add titles from a NextUP backup file',
                  onPress: importData,
                  loading: busy === 'import',
                })}
              </View>
              <ThemedText variant="caption" style={[styles.muted, { marginTop: DESIGN_CONSTANTS.SPACING.small }]}>
                Your lists are stored only on this phone. Export a backup before switching phones or reinstalling.
                Importing never removes or changes titles you already have.
              </ThemedText>
            </View>

            {/* About */}
            <View>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                About
              </ThemedText>
              <View style={styles.card}>
                {renderRow({
                  first: true,
                  icon: 'information-circle-outline',
                  label: 'Version',
                  detail: APP_CONFIG.APP_VERSION,
                  trailing: 'none',
                })}
                {APP_CONFIG.PRIVACY_POLICY_URL &&
                  renderRow({
                    icon: 'shield-checkmark-outline',
                    label: 'Privacy policy',
                    trailing: 'external',
                    onPress: () => Linking.openURL(APP_CONFIG.PRIVACY_POLICY_URL as string),
                  })}
                <TouchableOpacity
                  style={[styles.attribution, styles.divider]}
                  onPress={() => Linking.openURL(APP_CONFIG.TMDB_URL)}
                  accessibilityRole="link"
                  accessibilityLabel="The Movie Database (TMDB)"
                >
                  <Image
                    source={require('../../assets/tmdb-logo.png')}
                    style={styles.tmdbLogo}
                    resizeMode="contain"
                    accessibilityIgnoresInvertColors
                  />
                  <ThemedText variant="caption" style={styles.muted}>
                    This product uses the TMDB API but is not endorsed or certified by TMDB. Movie and TV
                    information and images are provided by The Movie Database.
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};
