import AsyncStorage from '@react-native-async-storage/async-storage';
import { dataManager } from '../DataManager';
import { MediaItem, StorageError } from '../../Types';

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

const expectStorageCode = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toBeInstanceOf(StorageError);
  await expect(promise).rejects.toMatchObject({ code });
};

describe('DataManager error codes', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('keeps DUPLICATE_ITEM when adding a media item twice', async () => {
    await dataManager.addItem(movie(1), 'will_watch');
    await expectStorageCode(dataManager.addItem(movie(1), 'watched'), 'DUPLICATE_ITEM');
  });

  it('keeps ITEM_NOT_FOUND for unknown ids', async () => {
    await expectStorageCode(dataManager.removeItem('missing'), 'ITEM_NOT_FOUND');
    await expectStorageCode(dataManager.updateItemStatus('missing', 'watched'), 'ITEM_NOT_FOUND');
  });

  it('moves an item between collections', async () => {
    const item = await dataManager.addItem(movie(2), 'will_watch');
    await dataManager.updateItemStatus(item.id, 'watching');

    const collections = await dataManager.getAllCollections();
    expect(collections.will_watch).toHaveLength(0);
    expect(collections.watching.map(i => i.mediaItem.id)).toEqual([2]);
  });
});
