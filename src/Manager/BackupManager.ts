import {
  CollectionItem,
  CollectionStatus,
  ExportData,
  ImportResult,
  isCollectionItem,
} from '../Types';
import { APP_CONFIG } from '../Utils/constants';
import { dataManager } from './DataManager';

/** Bump when the backup file shape changes; keep reading older versions. */
export const BACKUP_FORMAT_VERSION = '1';

const STATUSES: CollectionStatus[] = ['watched', 'watching', 'will_watch'];

/** Build the backup document for the current profile and collections. */
export async function createExport(now: Date = new Date()): Promise<ExportData> {
  const [userProfile, collections] = await Promise.all([
    dataManager.getUserProfile(),
    dataManager.getAllCollections(),
  ]);
  if (!userProfile) {
    throw new Error('No profile to export');
  }

  const totalItems = STATUSES.reduce((sum, status) => sum + collections[status].length, 0);
  return {
    version: BACKUP_FORMAT_VERSION,
    exportDate: now.toISOString(),
    userProfile,
    collections,
    metadata: { totalItems, appVersion: APP_CONFIG.APP_VERSION },
  };
}

export const backupFileName = (now: Date = new Date()) =>
  `nextup-backup-${now.toISOString().slice(0, 10)}.json`;

/**
 * Validate a backup file's contents and merge its items into the current
 * collections. Items already saved (same TMDB id) and invalid entries are
 * skipped; the current profile is never replaced.
 */
export async function importBackup(json: string): Promise<ImportResult> {
  let data: any;
  try {
    data = JSON.parse(json);
  } catch {
    return failure('This file is not a NextUP backup (invalid JSON).');
  }

  if (!data || typeof data !== 'object' || !data.collections || typeof data.collections !== 'object') {
    return failure('This file is not a NextUP backup.');
  }
  if (data.version !== BACKUP_FORMAT_VERSION) {
    return failure(`Unsupported backup version "${data.version}". Update NextUP and try again.`);
  }

  const valid: CollectionItem[] = [];
  let invalid = 0;
  for (const status of STATUSES) {
    const items = Array.isArray(data.collections[status]) ? data.collections[status] : [];
    for (const item of items) {
      // Trust the list an item is filed under over its own status field.
      if (isCollectionItem(item)) valid.push({ ...item, status });
      else invalid++;
    }
  }

  const { imported, skipped } = await dataManager.mergeCollectionItems(valid);
  return {
    success: true,
    importedItems: imported,
    skippedItems: skipped + invalid,
    errors: invalid > 0 ? [`${invalid} damaged ${invalid === 1 ? 'entry was' : 'entries were'} ignored`] : [],
  };
}

const failure = (message: string): ImportResult => ({
  success: false,
  importedItems: 0,
  skippedItems: 0,
  errors: [message],
});
