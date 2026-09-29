import AsyncStorage from '@react-native-async-storage/async-storage';
import { dataManager } from '../DataManager';
import { createExport, importBackup, backupFileName, BACKUP_FORMAT_VERSION } from '../BackupManager';
import { MediaItem } from '../../Types';

const movie = (id: number): MediaItem => ({
  id,
  title: `Movie ${id}`,
  overview: '',
  posterPath: null,
  backdropPath: null,
  releaseDate: '2020-01-01',
  voteAverage: 7,
  genreIds: [],
  mediaType: 'movie',
  originalLanguage: 'en',
});

describe('BackupManager', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await dataManager.createUserProfile('Anubhav');
  });

  it('exports the profile, all lists and a total', async () => {
    await dataManager.addItem(movie(1), 'watched');
    await dataManager.addItem(movie(2), 'will_watch');

    const backup = await createExport(new Date('2026-09-29T10:00:00Z'));
    expect(backup.version).toBe(BACKUP_FORMAT_VERSION);
    expect(backup.userProfile.name).toBe('Anubhav');
    expect(backup.metadata.totalItems).toBe(2);
    expect(backup.collections.watched.map(i => i.mediaItem.id)).toEqual([1]);
    expect(backupFileName(new Date('2026-09-29T10:00:00Z'))).toBe('nextup-backup-2026-09-29.json');
  });

  it('round-trips: export, wipe, import restores items with their details', async () => {
    const item = await dataManager.addItem(movie(1), 'watched');
    await dataManager.updateItemRating(item.id, 9);
    await dataManager.addItem(movie(2), 'watching');
    const json = JSON.stringify(await createExport());

    await AsyncStorage.clear();
    await dataManager.createUserProfile('New phone');
    const result = await importBackup(json);

    expect(result).toMatchObject({ success: true, importedItems: 2, skippedItems: 0 });
    const collections = await dataManager.getAllCollections();
    expect(collections.watched[0]).toMatchObject({ id: item.id, userRating: 9 });
    expect(collections.watching.map(i => i.mediaItem.id)).toEqual([2]);
    // The current profile is kept.
    expect((await dataManager.getUserProfile())?.name).toBe('New phone');
  });

  it('skips titles that are already saved without changing them', async () => {
    await dataManager.addItem(movie(1), 'watched');
    await dataManager.addItem(movie(2), 'watched');
    const json = JSON.stringify(await createExport());

    await AsyncStorage.clear();
    await dataManager.createUserProfile('Anubhav');
    await dataManager.addItem(movie(1), 'will_watch');

    const result = await importBackup(json);
    expect(result).toMatchObject({ importedItems: 1, skippedItems: 1 });
    const collections = await dataManager.getAllCollections();
    expect(collections.will_watch.map(i => i.mediaItem.id)).toEqual([1]); // untouched
    expect(collections.watched.map(i => i.mediaItem.id)).toEqual([2]);
  });

  it('ignores damaged entries and reports them', async () => {
    await dataManager.addItem(movie(1), 'watched');
    const backup = await createExport();
    (backup.collections.watched as any[]).push({ id: 'broken', mediaItem: { title: 'no id' } });

    await AsyncStorage.clear();
    await dataManager.createUserProfile('Anubhav');
    const result = await importBackup(JSON.stringify(backup));
    expect(result).toMatchObject({ success: true, importedItems: 1, skippedItems: 1 });
    expect(result.errors[0]).toMatch(/1 damaged entry/);
  });

  it.each([
    ['not json', /invalid JSON/],
    [JSON.stringify({ hello: 'world' }), /not a NextUP backup/],
    [JSON.stringify({ version: '99', collections: {} }), /Unsupported backup version/],
  ])('rejects %s', async (json, message) => {
    const result = await importBackup(json);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(message);
  });
});
